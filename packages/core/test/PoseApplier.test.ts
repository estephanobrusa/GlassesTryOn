import { describe, it, expect, vi } from 'vitest';
import { PoseApplier } from '../src/PoseApplier';
import * as THREE from 'three';
import { FacePose } from '../src/FaceGeometryEstimator';

// Note: THREE is mocked in setup.ts

describe('PoseApplier', () => {
  function makeModel() {
    const positionCopy = vi.fn();
    const quaternionCopy = vi.fn();
    const scaleSetScalar = vi.fn();
    const updateWorldMatrix = vi.fn();

    const model = {
      position: { copy: positionCopy },
      quaternion: { copy: quaternionCopy },
      scale: { setScalar: scaleSetScalar },
      updateWorldMatrix,
    } as unknown as THREE.Object3D;

    return { model, positionCopy, quaternionCopy, scaleSetScalar, updateWorldMatrix };
  }

  function makePose(overrides?: Partial<FacePose>): FacePose {
    const position = new THREE.Vector3(10, 20, 30);
    const quaternion = new THREE.Quaternion();
    return {
      position,
      quaternion,
      scale: 1.5,
      ...overrides,
    };
  }

  describe('applyPose()', () => {
    it('copies position to model.position', () => {
      const { model, positionCopy } = makeModel();
      const pose = makePose();
      PoseApplier.applyPose(model, pose);
      expect(positionCopy).toHaveBeenCalledWith(pose.position);
    });

    it('copies quaternion to model.quaternion', () => {
      const { model, quaternionCopy } = makeModel();
      const pose = makePose();
      PoseApplier.applyPose(model, pose);
      expect(quaternionCopy).toHaveBeenCalledWith(pose.quaternion);
    });

    it('sets scale via setScalar with pose.scale', () => {
      const { model, scaleSetScalar } = makeModel();
      const pose = makePose({ scale: 2.5 });
      PoseApplier.applyPose(model, pose);
      expect(scaleSetScalar).toHaveBeenCalledWith(2.5);
    });

    it('calls updateWorldMatrix(true, true)', () => {
      const { model, updateWorldMatrix } = makeModel();
      const pose = makePose();
      PoseApplier.applyPose(model, pose);
      expect(updateWorldMatrix).toHaveBeenCalledWith(true, true);
    });

    it('applies scale = 1 correctly', () => {
      const { model, scaleSetScalar } = makeModel();
      const pose = makePose({ scale: 1 });
      PoseApplier.applyPose(model, pose);
      expect(scaleSetScalar).toHaveBeenCalledWith(1);
    });

    it('applies scale = 0 correctly', () => {
      const { model, scaleSetScalar } = makeModel();
      const pose = makePose({ scale: 0 });
      PoseApplier.applyPose(model, pose);
      expect(scaleSetScalar).toHaveBeenCalledWith(0);
    });

    it('applies negative scale correctly', () => {
      const { model, scaleSetScalar } = makeModel();
      const pose = makePose({ scale: -1 });
      PoseApplier.applyPose(model, pose);
      expect(scaleSetScalar).toHaveBeenCalledWith(-1);
    });

    it('calls all four operations per invocation', () => {
      const { model, positionCopy, quaternionCopy, scaleSetScalar, updateWorldMatrix } =
        makeModel();
      const pose = makePose();
      PoseApplier.applyPose(model, pose);

      expect(positionCopy).toHaveBeenCalledTimes(1);
      expect(quaternionCopy).toHaveBeenCalledTimes(1);
      expect(scaleSetScalar).toHaveBeenCalledTimes(1);
      expect(updateWorldMatrix).toHaveBeenCalledTimes(1);
    });

    it('can be called multiple times consecutively', () => {
      const { model, positionCopy, scaleSetScalar } = makeModel();
      const pose1 = makePose({ scale: 1.0 });
      const pose2 = makePose({ scale: 2.0 });

      PoseApplier.applyPose(model, pose1);
      PoseApplier.applyPose(model, pose2);

      expect(positionCopy).toHaveBeenCalledTimes(2);
      expect(scaleSetScalar).toHaveBeenNthCalledWith(1, 1.0);
      expect(scaleSetScalar).toHaveBeenNthCalledWith(2, 2.0);
    });
  });
});

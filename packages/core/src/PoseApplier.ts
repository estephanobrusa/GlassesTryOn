// PoseApplier.ts
// Applies a FacePose (pixel-space position, quaternion, scale) directly
// to a Three.js model. Works with the negated-pixel coordinate system
// used by FaceGeometryEstimator.

import * as THREE from 'three';
import { FacePose } from './FaceGeometryEstimator';

export class PoseApplier {
  /**
   * Apply face pose to a Three.js model for AR overlay.
   * Position and quaternion come pre-computed in scene space from the estimator.
   */
  static applyPose(model: THREE.Object3D, pose: FacePose): void {
    model.position.copy(pose.position);
    model.quaternion.copy(pose.quaternion);
    model.scale.setScalar(pose.scale);
    model.updateWorldMatrix(true, true);
  }
}

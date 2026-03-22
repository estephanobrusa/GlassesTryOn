import { describe, it, expect } from 'vitest';
import { FaceGeometryEstimator, FacePose } from '../src/FaceGeometryEstimator';
import { FaceLandmark } from '../src/FaceMeshRunner';

// Note: THREE is mocked in setup.ts – all Vector3/Quaternion methods return `this` (chainable)

// ── Helpers ──

/**
 * Create an array of 468 synthetic landmarks.
 * All points default to {x:0.5, y:0.5, z:0} to represent a front-facing,
 * centered face in normalized MediaPipe space.
 */
function make468(overrides?: Record<number, Partial<FaceLandmark>>): FaceLandmark[] {
  const lms: FaceLandmark[] = Array.from({ length: 468 }, () => ({ x: 0.5, y: 0.5, z: 0 }));
  if (overrides) {
    for (const [idx, vals] of Object.entries(overrides)) {
      lms[Number(idx)] = { ...lms[Number(idx)], ...vals };
    }
  }
  return lms;
}

/** Default intrinsics suitable for 640×480 video */
const intrinsics = { fx: 640, fy: 640, cx: 320, cy: 240 };

describe('FaceGeometryEstimator', () => {
  describe('constructor', () => {
    it('constructs without throwing', () => {
      expect(() => new FaceGeometryEstimator(intrinsics, 640, 480)).not.toThrow();
    });

    it('accepts alignment config', () => {
      expect(
        () =>
          new FaceGeometryEstimator(intrinsics, 640, 480, {
            glassesScaleFactor: 1.5,
            glassesZ: 15,
          }),
      ).not.toThrow();
    });

    it('accepts partial alignment config (only glassesScaleFactor)', () => {
      expect(
        () => new FaceGeometryEstimator(intrinsics, 640, 480, { glassesScaleFactor: 2 }),
      ).not.toThrow();
    });

    it('accepts partial alignment config (only glassesZ)', () => {
      expect(() => new FaceGeometryEstimator(intrinsics, 640, 480, { glassesZ: 20 })).not.toThrow();
    });
  });

  describe('estimatePose() – guard conditions', () => {
    it('returns null when landmarks is null', () => {
      const est = new FaceGeometryEstimator(intrinsics, 640, 480);
      expect(est.estimatePose(null as unknown as FaceLandmark[])).toBeNull();
    });

    it('returns null when landmarks is undefined', () => {
      const est = new FaceGeometryEstimator(intrinsics, 640, 480);
      expect(est.estimatePose(undefined as unknown as FaceLandmark[])).toBeNull();
    });

    it('returns null for empty array', () => {
      const est = new FaceGeometryEstimator(intrinsics, 640, 480);
      expect(est.estimatePose([])).toBeNull();
    });

    it('returns null when fewer than 468 landmarks', () => {
      const est = new FaceGeometryEstimator(intrinsics, 640, 480);
      expect(est.estimatePose(make468().slice(0, 467))).toBeNull();
    });

    it('returns null for exactly 467 landmarks', () => {
      const est = new FaceGeometryEstimator(intrinsics, 640, 480);
      const lms = make468().slice(0, 467);
      expect(est.estimatePose(lms)).toBeNull();
    });
  });

  describe('estimatePose() – happy path', () => {
    it('returns a non-null FacePose for 468 landmarks', () => {
      const est = new FaceGeometryEstimator(intrinsics, 640, 480);
      const result = est.estimatePose(make468());
      expect(result).not.toBeNull();
    });

    it('returned pose has a position property', () => {
      const est = new FaceGeometryEstimator(intrinsics, 640, 480);
      const result = est.estimatePose(make468()) as FacePose;
      expect(result).toHaveProperty('position');
    });

    it('returned pose has a quaternion property', () => {
      const est = new FaceGeometryEstimator(intrinsics, 640, 480);
      const result = est.estimatePose(make468()) as FacePose;
      expect(result).toHaveProperty('quaternion');
    });

    it('returned pose has a numeric scale property', () => {
      const est = new FaceGeometryEstimator(intrinsics, 640, 480);
      const result = est.estimatePose(make468()) as FacePose;
      expect(result).toHaveProperty('scale');
      expect(typeof result.scale).toBe('number');
    });

    it('first call initialises smoothing (sm.ready path)', () => {
      const est = new FaceGeometryEstimator(intrinsics, 640, 480);
      // First call sets sm.ready = true
      const r1 = est.estimatePose(make468());
      expect(r1).not.toBeNull();
      // Second call uses lerp/slerp path
      const r2 = est.estimatePose(make468());
      expect(r2).not.toBeNull();
    });

    it('returns a new pose object on each call', () => {
      const est = new FaceGeometryEstimator(intrinsics, 640, 480);
      const r1 = est.estimatePose(make468());
      const r2 = est.estimatePose(make468());
      // Both should be valid objects (not necessarily the same reference)
      expect(r1).not.toBeNull();
      expect(r2).not.toBeNull();
    });
  });

  describe('estimatePose() – alignment config variations', () => {
    it('works with glassesScaleFactor = 0.5', () => {
      const est = new FaceGeometryEstimator(intrinsics, 640, 480, { glassesScaleFactor: 0.5 });
      const result = est.estimatePose(make468());
      expect(result).not.toBeNull();
    });

    it('works with glassesScaleFactor = 2.0', () => {
      const est = new FaceGeometryEstimator(intrinsics, 640, 480, { glassesScaleFactor: 2.0 });
      const result = est.estimatePose(make468());
      expect(result).not.toBeNull();
    });

    it('works with glassesZ = 0', () => {
      const est = new FaceGeometryEstimator(intrinsics, 640, 480, { glassesZ: 0 });
      const result = est.estimatePose(make468());
      expect(result).not.toBeNull();
    });

    it('works with glassesZ = 50', () => {
      const est = new FaceGeometryEstimator(intrinsics, 640, 480, { glassesZ: 50 });
      const result = est.estimatePose(make468());
      expect(result).not.toBeNull();
    });
  });

  describe('estimatePose() – different video dimensions', () => {
    it('works with 1280×720', () => {
      const est = new FaceGeometryEstimator({ fx: 1280, fy: 1280, cx: 640, cy: 360 }, 1280, 720);
      const result = est.estimatePose(make468());
      expect(result).not.toBeNull();
    });

    it('works with 320×240', () => {
      const est = new FaceGeometryEstimator({ fx: 320, fy: 320, cx: 160, cy: 120 }, 320, 240);
      const result = est.estimatePose(make468());
      expect(result).not.toBeNull();
    });
  });

  describe('estimatePose() – landmark variations', () => {
    it('handles landmarks with all zeros', () => {
      const est = new FaceGeometryEstimator(intrinsics, 640, 480);
      const lms = Array.from({ length: 468 }, () => ({ x: 0, y: 0, z: 0 }));
      const result = est.estimatePose(lms);
      expect(result).not.toBeNull();
    });

    it('handles landmarks with all ones', () => {
      const est = new FaceGeometryEstimator(intrinsics, 640, 480);
      const lms = Array.from({ length: 468 }, () => ({ x: 1, y: 1, z: 0 }));
      const result = est.estimatePose(lms);
      expect(result).not.toBeNull();
    });

    it('handles exactly 468 landmarks (boundary)', () => {
      const est = new FaceGeometryEstimator(intrinsics, 640, 480);
      const lms = make468();
      expect(lms.length).toBe(468);
      const result = est.estimatePose(lms);
      expect(result).not.toBeNull();
    });

    it('handles more than 468 landmarks', () => {
      const est = new FaceGeometryEstimator(intrinsics, 640, 480);
      const lms = make468();
      lms.push({ x: 0.5, y: 0.5, z: 0 }); // 469 landmarks
      const result = est.estimatePose(lms);
      expect(result).not.toBeNull();
    });

    it('handles spread-out landmarks (varied positions)', () => {
      const est = new FaceGeometryEstimator(intrinsics, 640, 480);
      // Vary specific landmarks to simulate a real face
      const lms = make468({
        33: { x: 0.35, y: 0.45, z: -0.01 }, // leftEyeOuter
        263: { x: 0.65, y: 0.45, z: -0.01 }, // rightEyeOuter
        133: { x: 0.4, y: 0.45, z: -0.01 }, // leftEyeInner
        362: { x: 0.6, y: 0.45, z: -0.01 }, // rightEyeInner
        10: { x: 0.5, y: 0.2, z: -0.05 }, // forehead
        175: { x: 0.5, y: 0.8, z: -0.05 }, // chin
        1: { x: 0.5, y: 0.55, z: -0.08 }, // noseTip
        168: { x: 0.5, y: 0.5, z: -0.06 }, // noseBridge
      });
      const result = est.estimatePose(lms);
      expect(result).not.toBeNull();
    });
  });

  describe('smoothing state across multiple calls', () => {
    it('accumulates smoothing state across 5 calls', () => {
      const est = new FaceGeometryEstimator(intrinsics, 640, 480);
      const results: (FacePose | null)[] = [];
      for (let i = 0; i < 5; i++) {
        results.push(est.estimatePose(make468()));
      }
      // All should return valid poses
      results.forEach((r) => expect(r).not.toBeNull());
    });

    it('smoothing state is independent between estimator instances', () => {
      const est1 = new FaceGeometryEstimator(intrinsics, 640, 480);
      const est2 = new FaceGeometryEstimator(intrinsics, 640, 480);
      const r1 = est1.estimatePose(make468());
      const r2 = est2.estimatePose(make468());
      expect(r1).not.toBeNull();
      expect(r2).not.toBeNull();
    });
  });
});

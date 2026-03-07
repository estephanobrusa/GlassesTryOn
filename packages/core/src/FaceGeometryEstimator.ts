// FaceGeometryEstimator.ts
// Estimates head pose from MediaPipe FaceMesh landmarks using a proper
// rotation matrix built from 3 orthogonal face axes.
// Returns pixel-space position, quaternion rotation, and scale.

import * as THREE from 'three';
import { CameraIntrinsics } from './CameraCalibration';
import { FaceLandmark } from './FaceMeshRunner';

/**
 * Pose data in pixel space, ready to apply directly to a Three.js model.
 */
export interface FacePose {
  /** Eye midpoint position in pixel coords (negated for Three.js ortho scene) */
  position: THREE.Vector3;
  /** Orientation quaternion built from real face axes */
  quaternion: THREE.Quaternion;
  /** Uniform scale factor for the glasses model */
  scale: number;
}

// ── Key MediaPipe FaceMesh landmark indices ──
const LM = {
  leftEyeOuter: 33,
  rightEyeOuter: 263,
  leftEyeInner: 133,
  rightEyeInner: 362,
  leftTemple: 127,
  rightTemple: 356,
  leftCheek: 234,
  rightCheek: 454,
  forehead: 10,
  chin: 175,
  noseBridge: 168,
  noseTip: 1,
};

// ── Calibration config (defaults) ──
const DEFAULT_CFG = {
  refHeadWidth: 140,
  refFaceHeight: 210,
  glassesScale: 1.22,
  glassesDepth: 10,
  glassesDown: 2,
  glassesCenterX: 0,
};

/** Optional overrides consumers can pass in. */
export interface AlignmentConfig {
  glassesScaleFactor?: number;
  glassesZ?: number;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

export class FaceGeometryEstimator {
  private videoWidth: number;
  private videoHeight: number;
  private cfg: typeof DEFAULT_CFG;

  // Adaptive smoothing state
  private sm = {
    ready: false,
    pos: new THREE.Vector3(),
    quat: new THREE.Quaternion(),
    scale: new THREE.Vector3(1, 1, 1),
    prev: new THREE.Vector3(),
  };

  constructor(
    _intrinsics: CameraIntrinsics,
    videoWidth: number,
    videoHeight: number,
    alignment?: AlignmentConfig,
  ) {
    this.videoWidth = videoWidth;
    this.videoHeight = videoHeight;
    this.cfg = {
      ...DEFAULT_CFG,
      glassesScale: DEFAULT_CFG.glassesScale * (alignment?.glassesScaleFactor ?? 1),
      glassesDepth: alignment?.glassesZ ?? DEFAULT_CFG.glassesDepth,
    };
  }

  /** Convert normalized MediaPipe landmarks to pixel coordinates. */
  private toPixels(landmarks: FaceLandmark[]): number[][] {
    const w = this.videoWidth;
    const h = this.videoHeight;
    return landmarks.map((l) => [l.x * w, l.y * h, l.z * w]);
  }

  /** Create a negated THREE.Vector3 from pixel-space landmark. */
  private toV(pts: number[][], i: number): THREE.Vector3 {
    return new THREE.Vector3(-pts[i][0], -pts[i][1], -pts[i][2]);
  }

  /** Midpoint between two Vector3s. */
  private mid(a: THREE.Vector3, b: THREE.Vector3): THREE.Vector3 {
    return a.clone().add(b).multiplyScalar(0.5);
  }

  /** Midpoint between inner and outer eye landmarks. */
  private eyeMid(pts: number[][], inner: number, outer: number): THREE.Vector3 {
    return this.mid(this.toV(pts, inner), this.toV(pts, outer));
  }

  /** Angular delta between two quaternions (radians). */
  private qDelta(a: THREE.Quaternion, b: THREE.Quaternion): number {
    return 2 * Math.acos(clamp(Math.abs(a.dot(b)), 0, 1));
  }

  /**
   * Estimate face pose from 468 MediaPipe landmarks.
   * Builds a rotation matrix from 3 orthogonal face axes for accurate tracking.
   */
  estimatePose(landmarks: FaceLandmark[]): FacePose | null {
    if (!landmarks || landmarks.length < 468) return null;

    const pts = this.toPixels(landmarks);

    // ── Key landmarks ──
    const lEye = this.eyeMid(pts, LM.leftEyeInner, LM.leftEyeOuter);
    const rEye = this.eyeMid(pts, LM.rightEyeInner, LM.rightEyeOuter);
    const nose = this.toV(pts, LM.noseBridge);
    const nTip = this.toV(pts, LM.noseTip);
    const fHead = this.toV(pts, LM.forehead);
    const chn = this.toV(pts, LM.chin);
    const lTmp = this.toV(pts, LM.leftTemple);
    const rTmp = this.toV(pts, LM.rightTemple);
    const lChk = this.toV(pts, LM.leftCheek);
    const rChk = this.toV(pts, LM.rightCheek);

    const eMid = this.mid(lEye, rEye);

    // ── Face measurements (multiple for robustness) ──
    const eW = lEye.distanceTo(rEye);
    const tW = lTmp.distanceTo(rTmp);
    const cW = lChk.distanceTo(rChk);
    const fW = Math.max(eW, tW, cW);
    const fH = fHead.distanceTo(chn);

    // ── Orientation: rotation matrix from 3 face axes ──
    // X axis: eye-to-eye line
    const xAxis = rEye.clone().sub(lEye).normalize();
    // Y raw: forehead to chin direction
    const yRaw = fHead.clone().sub(chn).normalize();
    // Z axis: face normal via cross product
    const zAxis = xAxis.clone().cross(yRaw).normalize();
    // Ensure Z points toward camera
    if (zAxis.z < 0) zAxis.negate();
    // Y axis: orthogonalized (perpendicular to X and Z)
    const yAxis = zAxis.clone().cross(xAxis).normalize();

    // Build rotation matrix and extract quaternion
    const rotMat = new THREE.Matrix4().makeBasis(xAxis, yAxis, zAxis);
    const targetQuat = new THREE.Quaternion().setFromRotationMatrix(rotMat);

    // Z-flip: model faces +Z but scene uses -Z for "behind"
    const flipZ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI);
    targetQuat.multiply(flipZ);

    // ── Position: eye midpoint + offsets along face axes ──
    const btt = nTip.clone().sub(nose);
    const depAdj = clamp(btt.length() * 0.1, 0, 6);

    const tGPos = eMid
      .clone()
      .addScaledVector(xAxis, this.cfg.glassesCenterX)
      .addScaledVector(yAxis, this.cfg.glassesDown)
      .addScaledVector(zAxis, this.cfg.glassesDepth + depAdj);

    // ── Scale: blend of width (70%) and height (30%) ──
    const wS = fW / this.cfg.refHeadWidth;
    const hS = fH / this.cfg.refFaceHeight;
    const bS = wS * 0.7 + hS * 0.3;
    const gS = bS * this.cfg.glassesScale;
    const tGScale = new THREE.Vector3(gS, gS, gS);

    // ── Adaptive smoothing ──
    const mov = tGPos.distanceTo(this.sm.prev);
    const aDelta = this.qDelta(this.sm.quat, targetQuat);

    const aP = clamp(0.15 + mov * 0.015, 0.15, 0.55); // position lerp factor
    const aR = clamp(0.2 + aDelta * 0.6, 0.2, 0.75); // rotation slerp factor
    const aS = clamp(0.16 + mov * 0.01, 0.16, 0.45); // scale lerp factor

    if (!this.sm.ready) {
      this.sm.pos.copy(tGPos);
      this.sm.quat.copy(targetQuat);
      this.sm.scale.copy(tGScale);
      this.sm.ready = true;
    } else {
      this.sm.pos.lerp(tGPos, aP);
      this.sm.quat.slerp(targetQuat, aR);
      this.sm.scale.lerp(tGScale, aS);
    }

    this.sm.prev.copy(tGPos);

    return {
      position: this.sm.pos.clone(),
      quaternion: this.sm.quat.clone(),
      scale: this.sm.scale.x,
    };
  }
}

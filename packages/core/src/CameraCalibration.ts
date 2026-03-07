// CameraCalibration.ts
// Module for managing camera intrinsics and calibration

export interface CameraIntrinsics {
  fx: number;
  fy: number;
  cx: number;
  cy: number;
}

export class CameraCalibration {
  public intrinsics: CameraIntrinsics;

  constructor(
    videoWidth: number,
    videoHeight: number,
    fx?: number,
    fy?: number,
    cx?: number,
    cy?: number,
  ) {
    this.intrinsics = {
      fx: fx ?? videoWidth,
      fy: fy ?? videoWidth,
      cx: cx ?? videoWidth / 2,
      cy: cy ?? videoHeight / 2,
    };
  }

  getIntrinsics(): CameraIntrinsics {
    return this.intrinsics;
  }
}

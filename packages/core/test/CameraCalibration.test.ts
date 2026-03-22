import { describe, it, expect } from 'vitest';
import { CameraCalibration } from '../src/CameraCalibration';

describe('CameraCalibration', () => {
  describe('constructor with only videoWidth and videoHeight', () => {
    it('sets fx = videoWidth (default focal length)', () => {
      const cal = new CameraCalibration(640, 480);
      expect(cal.intrinsics.fx).toBe(640);
    });

    it('sets fy = videoWidth (default focal length, not height)', () => {
      const cal = new CameraCalibration(640, 480);
      // Note: fy defaults to videoWidth (not videoHeight) - this is the actual implementation
      expect(cal.intrinsics.fy).toBe(640);
    });

    it('sets cx = videoWidth / 2', () => {
      const cal = new CameraCalibration(640, 480);
      expect(cal.intrinsics.cx).toBe(320);
    });

    it('sets cy = videoHeight / 2', () => {
      const cal = new CameraCalibration(640, 480);
      expect(cal.intrinsics.cy).toBe(240);
    });
  });

  describe('constructor with all optional parameters', () => {
    it('uses provided fx value', () => {
      const cal = new CameraCalibration(640, 480, 500, 510, 320, 240);
      expect(cal.intrinsics.fx).toBe(500);
    });

    it('uses provided fy value', () => {
      const cal = new CameraCalibration(640, 480, 500, 510, 320, 240);
      expect(cal.intrinsics.fy).toBe(510);
    });

    it('uses provided cx value', () => {
      const cal = new CameraCalibration(640, 480, 500, 510, 300, 240);
      expect(cal.intrinsics.cx).toBe(300);
    });

    it('uses provided cy value', () => {
      const cal = new CameraCalibration(640, 480, 500, 510, 320, 200);
      expect(cal.intrinsics.cy).toBe(200);
    });

    it('ignores videoWidth/videoHeight when all params provided', () => {
      const cal = new CameraCalibration(1280, 720, 800, 820, 640, 360);
      expect(cal.intrinsics.fx).toBe(800);
      expect(cal.intrinsics.fy).toBe(820);
      expect(cal.intrinsics.cx).toBe(640);
      expect(cal.intrinsics.cy).toBe(360);
    });
  });

  describe('getIntrinsics()', () => {
    it('returns the intrinsics object', () => {
      const cal = new CameraCalibration(640, 480);
      const intrinsics = cal.getIntrinsics();
      expect(intrinsics).toBeDefined();
      expect(intrinsics).toHaveProperty('fx');
      expect(intrinsics).toHaveProperty('fy');
      expect(intrinsics).toHaveProperty('cx');
      expect(intrinsics).toHaveProperty('cy');
    });

    it('returns the same reference as cal.intrinsics', () => {
      const cal = new CameraCalibration(640, 480);
      expect(cal.getIntrinsics()).toBe(cal.intrinsics);
    });

    it('returns correct values for default construction', () => {
      const cal = new CameraCalibration(800, 600);
      const intrinsics = cal.getIntrinsics();
      expect(intrinsics.fx).toBe(800);
      expect(intrinsics.fy).toBe(800);
      expect(intrinsics.cx).toBe(400);
      expect(intrinsics.cy).toBe(300);
    });

    it('returns correct values when all params are provided', () => {
      const cal = new CameraCalibration(640, 480, 700, 720, 310, 250);
      const intrinsics = cal.getIntrinsics();
      expect(intrinsics.fx).toBe(700);
      expect(intrinsics.fy).toBe(720);
      expect(intrinsics.cx).toBe(310);
      expect(intrinsics.cy).toBe(250);
    });
  });

  describe('edge cases', () => {
    it('handles videoWidth = 0', () => {
      const cal = new CameraCalibration(0, 480);
      expect(cal.intrinsics.fx).toBe(0);
      expect(cal.intrinsics.cx).toBe(0);
    });

    it('handles videoHeight = 0', () => {
      const cal = new CameraCalibration(640, 0);
      expect(cal.intrinsics.cy).toBe(0);
    });

    it('handles negative videoWidth', () => {
      const cal = new CameraCalibration(-640, 480);
      expect(cal.intrinsics.fx).toBe(-640);
      expect(cal.intrinsics.cx).toBe(-320);
    });

    it('handles decimal videoWidth and videoHeight', () => {
      const cal = new CameraCalibration(640.5, 480.5);
      expect(cal.intrinsics.fx).toBe(640.5);
      expect(cal.intrinsics.cx).toBe(320.25);
      expect(cal.intrinsics.cy).toBe(240.25);
    });

    it('handles fx = 0 explicitly (does not fall back to default)', () => {
      // When fx is explicitly provided as 0, ?? does NOT trigger (0 is not null/undefined)
      // But wait: 0 ?? videoWidth → 0 because 0 is not null/undefined
      const cal = new CameraCalibration(640, 480, 0);
      expect(cal.intrinsics.fx).toBe(0);
    });

    it('handles very large values', () => {
      const cal = new CameraCalibration(99999, 88888);
      expect(cal.intrinsics.fx).toBe(99999);
      expect(cal.intrinsics.cx).toBe(49999.5);
    });

    it('partial optional params: only fx provided', () => {
      const cal = new CameraCalibration(640, 480, 500);
      expect(cal.intrinsics.fx).toBe(500);
      // fy not provided, defaults to videoWidth
      expect(cal.intrinsics.fy).toBe(640);
    });
  });
});

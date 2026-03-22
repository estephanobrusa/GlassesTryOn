import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GlassesViewer, GlassesViewerOptions } from '../src/GlassesViewer';

// Mock all dependencies
vi.mock('../src/CameraEngine', () => ({
  CameraEngine: class {
    start = vi.fn().mockResolvedValue(undefined);
    getVideoElement = vi.fn(() => {
      const video = document.createElement('video');
      Object.assign(video, {
        readyState: 4,
        videoWidth: 640,
        videoHeight: 480,
        addEventListener: (evt: string, cb: () => void) => setTimeout(cb, 1),
      });
      return video;
    });
    destroy = vi.fn();
  },
}));

vi.mock('../src/CameraCalibration', () => ({
  CameraCalibration: class {
    getIntrinsics = vi.fn(() => ({ fx: 1, fy: 1, cx: 0.5, cy: 0.5 }));
  },
}));

// Keep FaceMeshRunner mock mutable so we can override getLastFace per test
let mockGetLastFace = vi.fn(() => undefined as any);
vi.mock('../src/FaceMeshRunner', () => ({
  FaceMeshRunner: class {
    start = vi.fn().mockResolvedValue(undefined);
    getLastFace = (...args: any[]) => (mockGetLastFace as (...a: any[]) => any)(...args);
    stop = vi.fn();
  },
}));

let mockEstimatePose = vi.fn(() => null as any);
vi.mock('../src/FaceGeometryEstimator', () => ({
  FaceGeometryEstimator: class {
    estimatePose = (...args: any[]) => (mockEstimatePose as (...a: any[]) => any)(...args);
  },
}));

vi.mock('../src/ThreeSceneManager', () => ({
  ThreeSceneManager: class {
    updateForVideo = vi.fn();
    renderer = { setPixelRatio: vi.fn() };
    destroy = vi.fn();
    setModel = vi.fn();
    videoWidth = 0;
    videoHeight = 0;
    model = { visible: false };
    render = vi.fn();
  },
}));

vi.mock('three/examples/jsm/loaders/GLTFLoader', () => ({
  GLTFLoader: class {
    load(url: string, onLoad: (scene: any) => void, onProgress: any, onError: (err: any) => void) {
      if (url === 'success.glb') {
        onLoad({ scene: { dummy: true } });
      } else {
        onError(new Error('failed to load'));
      }
    }
  },
}));

describe('GlassesViewer', () => {
  let container: HTMLElement;
  let options: GlassesViewerOptions;

  beforeEach(() => {
    container = document.createElement('div');
    options = {
      container,
      model: { url: 'success.glb' },
      render: { maxFPS: 30, pixelRatio: 1 },
    };
    mockGetLastFace = vi.fn(() => undefined as any);
    mockEstimatePose = vi.fn(() => null as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('constructs and initializes maxFPS', () => {
    const viewer = new GlassesViewer(options);
    expect(viewer).toBeInstanceOf(GlassesViewer);
    expect((viewer as any)._maxFPS).toBe(30);
  });

  it('constructs with maxFPS = 0 when not provided', () => {
    const viewer = new GlassesViewer({ container, model: { url: 'success.glb' } });
    expect((viewer as any)._maxFPS).toBe(0);
  });

  it('runs start() happy path', async () => {
    const viewer = new GlassesViewer({ ...options });
    await viewer.start();
    // should be running, RAF loop started
    expect((viewer as any)._running).toBe(true);
    viewer.destroy();
  });

  it('loads a model (success)', async () => {
    const viewer = new GlassesViewer({ ...options, model: { url: 'success.glb' } });
    await viewer.start(); // triggers loadModel with success
    viewer.destroy();
  });

  it('loads a model (error path)', async () => {
    const viewer = new GlassesViewer({ ...options, model: { url: 'fail.glb' } });
    // Ignore errors from loadModel
    await expect(viewer.start()).rejects.toThrow();
  });

  it('warns if no model specified', async () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const viewer = new GlassesViewer({ ...options });
    delete (viewer.options as any).model;
    await viewer.start();
    expect(spy).toHaveBeenCalledWith('[GlassesViewer] No model specified');
    spy.mockRestore();
    viewer.destroy();
  });

  it('can register, emit, and remove event listeners', () => {
    const viewer = new GlassesViewer(options);
    const cb = vi.fn();
    viewer.on('faceDetected', cb);
    (viewer as any).emit('faceDetected');
    expect(cb).toHaveBeenCalled();

    viewer.off('faceDetected', cb);
    (viewer as any).emit('faceDetected');
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('can destroy and cleanup', async () => {
    const viewer = new GlassesViewer(options);
    await viewer.start();
    viewer.destroy();
    expect((viewer as any)._running).toBe(false);
    expect((viewer as any).camera?.destroy).toHaveBeenCalled();
    expect((viewer as any).faceMeshRunner?.stop).toHaveBeenCalled();
    expect((viewer as any).sceneManager?.destroy).toHaveBeenCalled();
  });

  describe('render loop branches', () => {
    it('loop exits immediately when not running', async () => {
      const viewer = new GlassesViewer({ ...options });
      await viewer.start();
      viewer.destroy(); // sets _running = false

      // Manually calling the loop after stopping should be a no-op
      const renderSpy = vi.spyOn((viewer as any).sceneManager, 'render');
      (viewer as any).loop(9999);
      expect(renderSpy).not.toHaveBeenCalled();
    });

    it('loop with no face: model visible = false, renders', async () => {
      mockGetLastFace.mockReturnValue(null);

      const viewer = new GlassesViewer({ ...options });
      await viewer.start();

      // Manually invoke loop with _running = true
      const sceneManager = (viewer as any).sceneManager;
      sceneManager.model = { visible: true };

      (viewer as any).loop(1000);

      expect(sceneManager.model.visible).toBe(false);
      expect(sceneManager.render).toHaveBeenCalled();
      viewer.destroy();
    });

    it('loop with face + pose: model visible = true, faceDetected emitted', async () => {
      const fakeFace = Array.from({ length: 468 }, () => ({ x: 0.5, y: 0.5, z: 0 }));
      mockGetLastFace.mockReturnValue(fakeFace);

      const fakePose = {
        position: { x: 0, y: 0, z: 0, toFixed: () => '0.000' },
        quaternion: {},
        scale: { toFixed: () => '1.0000' },
      };
      mockEstimatePose.mockReturnValue(fakePose);

      const viewer = new GlassesViewer({ ...options });
      await viewer.start();

      const sceneManager = (viewer as any).sceneManager;
      // Use a proper Object3D mock that PoseApplier can work with
      sceneManager.model = {
        visible: false,
        position: { copy: vi.fn() },
        quaternion: { copy: vi.fn() },
        scale: { setScalar: vi.fn() },
        updateWorldMatrix: vi.fn(),
      };

      const faceDetectedCb = vi.fn();
      viewer.on('faceDetected', faceDetectedCb);

      (viewer as any).loop(1000);

      expect(sceneManager.model.visible).toBe(true);
      expect(faceDetectedCb).toHaveBeenCalled();
      viewer.destroy();
    });

    it('loop: face lost after face detected emits faceLost', async () => {
      const viewer = new GlassesViewer({ ...options });
      await viewer.start();

      const sceneManager = (viewer as any).sceneManager;
      sceneManager.model = { visible: true };

      // Simulate face was detected previously
      (viewer as any)._lastFaceState = true;
      mockGetLastFace.mockReturnValue(null);

      const faceLostCb = vi.fn();
      viewer.on('faceLost', faceLostCb);

      (viewer as any).loop(1000);

      expect(faceLostCb).toHaveBeenCalled();
      expect((viewer as any)._lastFaceState).toBe(false);
      viewer.destroy();
    });

    it('loop: FPS throttling skips frame if interval not met', async () => {
      const viewer = new GlassesViewer({ ...options, render: { maxFPS: 30 } });
      await viewer.start();

      const sceneManager = (viewer as any).sceneManager;
      const renderSpy = sceneManager.render;

      // Set last frame time to 0ms ago
      (viewer as any)._lastFrameTime = 1000;

      // Call loop at time 1001ms — only 1ms elapsed, minInterval = 33ms → should skip
      (viewer as any).loop(1001);

      expect(renderSpy).not.toHaveBeenCalled();
      viewer.destroy();
    });

    it('loop: FPS throttling allows frame if interval met', async () => {
      mockGetLastFace.mockReturnValue(null);
      const viewer = new GlassesViewer({ ...options, render: { maxFPS: 30 } });
      await viewer.start();

      const sceneManager = (viewer as any).sceneManager;
      sceneManager.model = { visible: false };

      // Set last frame time to 100ms ago
      (viewer as any)._lastFrameTime = 0;

      // Call loop at time 100ms — 100ms elapsed, minInterval ≈ 33ms → allowed
      (viewer as any).loop(100);

      expect(sceneManager.render).toHaveBeenCalled();
      viewer.destroy();
    });

    it('loop: debug mode logs pose info when pose available', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const fakeFace = Array.from({ length: 468 }, () => ({ x: 0.5, y: 0.5, z: 0 }));
      mockGetLastFace.mockReturnValue(fakeFace);

      const fakePose = {
        position: { x: 10, y: 20, z: 30, toFixed: () => '10.000' },
        quaternion: {},
        scale: { toFixed: () => '1.2200' },
      };
      mockEstimatePose.mockReturnValue(fakePose);

      const viewer = new GlassesViewer({ ...options, debug: true });
      await viewer.start();

      const sceneManager = (viewer as any).sceneManager;
      sceneManager.model = {
        visible: false,
        position: { copy: vi.fn() },
        quaternion: { copy: vi.fn() },
        scale: { setScalar: vi.fn() },
        updateWorldMatrix: vi.fn(),
      };

      (viewer as any).loop(1000);

      expect(consoleSpy).toHaveBeenCalledWith('[GlassesViewer] pose:', expect.any(Object));

      consoleSpy.mockRestore();
      viewer.destroy();
    });

    it('loop: pose null does not set model visible', async () => {
      const fakeFace = Array.from({ length: 468 }, () => ({ x: 0.5, y: 0.5, z: 0 }));
      mockGetLastFace.mockReturnValue(fakeFace);
      mockEstimatePose.mockReturnValue(null);

      const viewer = new GlassesViewer({ ...options });
      await viewer.start();

      const sceneManager = (viewer as any).sceneManager;
      sceneManager.model = { visible: false };

      (viewer as any).loop(1000);

      // model.visible should still be false since pose is null
      expect(sceneManager.model.visible).toBe(false);
      viewer.destroy();
    });
  });
});

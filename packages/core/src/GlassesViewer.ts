// GlassesViewer.ts
// Main orchestrator for the AR glasses try-on pipeline.
// Integrates camera, calibration, face mesh, geometry estimation, pose application, and Three.js scene management.

import { CameraEngine } from './CameraEngine';
import { CameraCalibration } from './CameraCalibration';
import { FaceMeshRunner } from './FaceMeshRunner';
import { FaceGeometryEstimator, AlignmentConfig } from './FaceGeometryEstimator';
import { PoseApplier } from './PoseApplier';
import { ThreeSceneManager } from './ThreeSceneManager';

export interface GlassesViewerOptions {
  container: HTMLElement;
  model?: { url: string; scale?: number; offset?: { x?: number; y?: number; z?: number } };
  tracking?: { smoothingFactor?: number };
  render?: { maxFPS?: number; pixelRatio?: number };
  debug?: boolean;
  alignmentConfig?: AlignmentConfig;
}

export class GlassesViewer {
  private camera?: CameraEngine;
  private calibration?: CameraCalibration;
  private faceMeshRunner?: FaceMeshRunner;
  private geometryEstimator?: FaceGeometryEstimator;
  private sceneManager?: ThreeSceneManager;
  private listeners: Record<string, ((...args: unknown[]) => void)[]> = {};
  private _lastFaceState = false;
  private _destroyed = false;
  private _running = false;
  private _rafId: number | null = null;
  private _maxFPS: number;
  private _lastFrameTime = 0;

  constructor(public options: GlassesViewerOptions) {
    this._maxFPS = options.render?.maxFPS ?? 0; // 0 = unlimited
  }

  async start(): Promise<void> {
    // 1. Initialize camera
    this.camera = new CameraEngine(this.options.container);
    await this.camera.start();
    console.log('[GlassesViewer] Camera initialized');

    // Wait for video to be ready
    const videoElement = this.camera.getVideoElement();
    await new Promise<void>((resolve) => {
      if (
        videoElement.readyState >= 2 &&
        videoElement.videoWidth > 0 &&
        videoElement.videoHeight > 0
      ) {
        resolve();
      } else {
        videoElement.addEventListener(
          'canplay',
          () => {
            if (videoElement.videoWidth > 0 && videoElement.videoHeight > 0) resolve();
          },
          { once: true },
        );
      }
    });

    // 2. Camera calibration
    this.calibration = new CameraCalibration(videoElement.videoWidth, videoElement.videoHeight);
    console.log('[GlassesViewer] Camera calibration:', this.calibration.getIntrinsics());

    // 3. FaceMeshRunner
    this.faceMeshRunner = new FaceMeshRunner(videoElement);
    await this.faceMeshRunner.start();
    console.log('[GlassesViewer] FaceMeshRunner started');

    // 4. FaceGeometryEstimator — pass alignment config through
    this.geometryEstimator = new FaceGeometryEstimator(
      this.calibration.getIntrinsics(),
      videoElement.videoWidth,
      videoElement.videoHeight,
      this.options.alignmentConfig,
    );

    // 5. Three.js scene manager (OrthographicCamera, lighting included)
    this.sceneManager = new ThreeSceneManager(this.options.container);
    this.sceneManager.videoWidth = videoElement.videoWidth;
    this.sceneManager.videoHeight = videoElement.videoHeight;
    // Align the orthographic frustum & drawing buffer with the actual video resolution
    this.sceneManager.updateForVideo(videoElement.videoWidth, videoElement.videoHeight);

    // Apply custom pixel ratio if provided
    if (this.options.render?.pixelRatio) {
      this.sceneManager.renderer.setPixelRatio(
        Math.min(this.options.render.pixelRatio, window.devicePixelRatio),
      );
    }

    // 6. Load GLB model — await before starting loop
    if (this.options.model) {
      await this.loadModel(this.options.model.url);
    } else {
      console.warn('[GlassesViewer] No model specified');
    }

    // 7. Start render loop
    if (this._destroyed) return;
    this._running = true;
    this._lastFrameTime = 0;
    this.loop(0);
  }

  private loadModel(url: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader');
      const loader = new GLTFLoader();
      loader.load(
        url,
        (gltf) => {
          this.sceneManager?.setModel(gltf.scene);
          console.log('[GlassesViewer] Model loaded, native width:', this.sceneManager?.modelWidth);
          this.emit('modelLoaded');
          resolve();
        },
        undefined,
        (error) => {
          console.error('[GlassesViewer] Error loading model:', error);
          reject(error);
        },
      );
    });
  }

  private loop = (time: number) => {
    if (!this._running) return;

    // FPS throttling
    if (this._maxFPS > 0) {
      const minInterval = 1000 / this._maxFPS;
      if (time - this._lastFrameTime < minInterval) {
        this._rafId = requestAnimationFrame(this.loop);
        return;
      }
      this._lastFrameTime = time;
    }

    const face = this.faceMeshRunner?.getLastFace();
    if (face && this.sceneManager?.model) {
      if (!this._lastFaceState) {
        console.log('[GlassesViewer] Face detected');
        this._lastFaceState = true;
      }

      const pose = this.geometryEstimator?.estimatePose(face);
      if (pose) {
        if (this.options.debug) {
          console.log('[GlassesViewer] pose:', {
            posX: pose.position.x.toFixed(3),
            posY: pose.position.y.toFixed(3),
            posZ: pose.position.z.toFixed(3),
            scale: pose.scale.toFixed(4),
          });
        }
        PoseApplier.applyPose(this.sceneManager.model, pose);
        this.sceneManager.model.visible = true;
        this.emit('faceDetected');
      }
    } else {
      if (this._lastFaceState) {
        console.log('[GlassesViewer] Face lost');
        this._lastFaceState = false;
        this.emit('faceLost');
      }
      if (this.sceneManager?.model) {
        this.sceneManager.model.visible = false;
      }
    }

    this.sceneManager?.render();
    this._rafId = requestAnimationFrame(this.loop);
  };

  destroy(): void {
    this._destroyed = true;
    this._running = false;
    if (this._rafId !== null) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
    this.camera?.destroy();
    this.faceMeshRunner?.stop();
    this.sceneManager?.destroy();
    this.calibration = undefined;
    this.geometryEstimator = undefined;
    this.listeners = {};
  }

  on(event: string, cb: (...args: unknown[]) => void) {
    this.listeners[event] = this.listeners[event] || [];
    this.listeners[event].push(cb);
  }

  off(event: string, cb: (...args: unknown[]) => void) {
    this.listeners[event] = (this.listeners[event] || []).filter((f) => f !== cb);
  }

  private emit(event: string, ...args: unknown[]) {
    (this.listeners[event] || []).forEach((f) => f(...args));
  }
}

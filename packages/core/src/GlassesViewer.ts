// GlassesViewer.ts
// Versión inicial, solo interfaz y estructura

import { CameraEngine } from './CameraEngine';
import { FaceTracker } from './FaceTracker';
import { AlignmentEngine } from './AlignmentEngine';
import { SceneManager } from './SceneManager';

export interface GlassesViewerOptions {
  container: HTMLElement;
  model?: { url: string; scale?: number; offset?: { x?: number; y?: number; z?: number } };
  tracking?: { smoothingFactor?: number };
  render?: { maxFPS?: number; pixelRatio?: number };
  debug?: boolean;
}

export class GlassesViewer {
  private camera?: CameraEngine;
  private tracker?: FaceTracker;
  private aligner?: AlignmentEngine;
  private scene?: SceneManager;
  private listeners: Record<string, Function[]> = {};

  constructor(public options: GlassesViewerOptions) {}

  async start(): Promise<void> {
    // 1. Initialize camera
    this.camera = new CameraEngine(this.options.container);
    await this.camera.start();
    console.log('[GlassesViewer] Cámara inicializada');

    // Espera a que el video esté listo
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

    // 2. Initialize tracker
    this.tracker = new FaceTracker(videoElement);
    await this.tracker.start();
    console.log('[GlassesViewer] Tracker inicializado');

    // 3. Initialize aligner
    this.aligner = new AlignmentEngine(videoElement.videoWidth, videoElement.videoHeight);
    console.log('[GlassesViewer] Aligner inicializado');

    // 4. Initialize scene
    this.scene = new SceneManager(this.options.container);
    if (this.options.model) {
      console.log('[GlassesViewer] Cargando modelo:', this.options.model.url);
      await this.scene.setModel(this.options.model.url, this.options.model);
      console.log('[GlassesViewer] Modelo cargado');
      this.emit('modelLoaded');
    } else {
      console.warn('[GlassesViewer] No se especificó modelo');
    }

    // 5. Render loop
    if (this.scene) this.scene.start();
    this.loop();
  }

  private loop = () => {
    const landmarks = this.tracker?.getLandmarks();
    if (landmarks) {
      const transform = this.aligner?.computeTransform(landmarks);
      if (transform) {
        this.scene?.applyTransform(transform);
        // Depuración de transform
        console.log('[GlassesViewer] Transform aplicado:', transform);
      } else {
        console.warn('[GlassesViewer] No se pudo calcular transform');
      }
      this.emit('faceDetected');
    } else {
      console.warn('[GlassesViewer] No se detectaron landmarks');
    }
    requestAnimationFrame(this.loop);
  };

  destroy(): void {
    this.camera?.destroy();
    this.tracker?.destroy();
    this.scene?.destroy();
  }

  on(event: string, cb: Function) {
    this.listeners[event] = this.listeners[event] || [];
    this.listeners[event].push(cb);
  }

  off(event: string, cb: Function) {
    this.listeners[event] = (this.listeners[event] || []).filter((f) => f !== cb);
  }

  private emit(event: string, ...args: any[]) {
    (this.listeners[event] || []).forEach((f) => f(...args));
  }
}

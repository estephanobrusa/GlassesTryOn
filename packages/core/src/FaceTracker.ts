// FaceTracker.ts - corregido
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import { SupportedModels } from '@tensorflow-models/face-landmarks-detection';

export class FaceTracker {
  private video: HTMLVideoElement;
  private model: any = null;
  private running = false;
  private lastLandmarks: any = null;
  private rafId: number = 0;

  constructor(video: HTMLVideoElement) {
    this.video = video;
  }

  async start(): Promise<void> {
    this.model = await faceLandmarksDetection.createDetector(SupportedModels.MediaPipeFaceMesh, {
      runtime: 'mediapipe',
      solutionPath: `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh`,
      refineLandmarks: true,
    });

    // Espera un frame real del video antes de empezar
    await this.waitForFirstFrame();

    this.running = true;
    this.trackLoop();
  }

  private waitForFirstFrame(): Promise<void> {
    return new Promise((resolve) => {
      // Si el video ya tiene frames pintados, resolvemos directo
      if (this.video.readyState >= 4 && this.video.videoWidth > 0 && this.video.videoHeight > 0) {
        resolve();
        return;
      }

      const check = () => {
        if (this.video.videoWidth > 0 && this.video.videoHeight > 0) {
          // Usamos requestAnimationFrame para asegurar que el frame
          // esté disponible en la GPU antes de que MediaPipe lo consuma
          requestAnimationFrame(() => resolve());
        } else {
          requestAnimationFrame(check);
        }
      };

      this.video.addEventListener('playing', () => requestAnimationFrame(check), { once: true });
    });
  }

  private async trackLoop() {
    if (!this.running) return;

    if (
      this.model &&
      this.video.readyState >= 2 &&
      !this.video.paused &&
      !this.video.ended &&
      this.video.videoWidth > 0 &&
      this.video.videoHeight > 0
    ) {
      try {
        const faces = await this.model.estimateFaces(this.video);

        if (faces && faces.length > 0) {
          // Con runtime mediapipe, los landmarks están en faces[0].keypoints
          // Convertimos al formato de array [x, y, z] que usa AlignmentEngine
          this.lastLandmarks = faces[0].keypoints.map((kp: any) => [kp.x, kp.y, kp.z ?? 0]);
        } else {
          this.lastLandmarks = null;
        }
      } catch (err) {
        // Silenciamos errores de frame transitorio para no romper el loop
        console.warn('FaceTracker frame skipped:', err);
      }
    }

    this.rafId = requestAnimationFrame(() => this.trackLoop());
  }

  stop(): void {
    this.running = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }

  destroy(): void {
    this.stop();
    this.model = null;
    this.lastLandmarks = null;
  }

  getLandmarks(): any {
    return this.lastLandmarks;
  }
}

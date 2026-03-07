// FaceMeshRunner.ts
// Responsible for initializing and running MediaPipe FaceMesh (WASM)
// Usage: Instantiate with a video element and call start()

/** A single normalized landmark from MediaPipe FaceMesh. */
export interface FaceLandmark {
  x: number;
  y: number;
  z: number;
}

export class FaceMeshRunner {
  private video: HTMLVideoElement;
  private faceMesh: any = null;
  private running = false;
  private lastFace: FaceLandmark[] | null = null;
  private rafId: number | null = null;

  constructor(video: HTMLVideoElement) {
    this.video = video;
  }

  async start(): Promise<void> {
    console.log('[FaceMeshRunner] Importing FaceMesh...');
    const { FaceMesh } = await import('@mediapipe/face_mesh');
    this.faceMesh = new FaceMesh({
      locateFile: (file: string) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/${file}`;
      },
    });
    this.faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
    });
    // Register results callback BEFORE initialize
    this.faceMesh.onResults((results: any) => {
      if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        this.lastFace = results.multiFaceLandmarks[0] as FaceLandmark[];
      } else {
        this.lastFace = null;
      }
    });

    await this.faceMesh.initialize();
    console.log('[FaceMeshRunner] FaceMesh initialized');

    this.running = true;
    this.detectLoop();
  }

  private async detectLoop() {
    if (!this.running) return;
    if (this.faceMesh) {
      try {
        await this.faceMesh.send({ image: this.video });
      } catch (err) {
        console.error('[FaceMeshRunner] Error sending frame:', err);
      }
    }
    if (this.running) {
      this.rafId = requestAnimationFrame(() => this.detectLoop());
    }
  }

  getLastFace(): FaceLandmark[] | null {
    return this.lastFace;
  }

  stop(): void {
    this.running = false;
    // Cancel any pending animation frame to avoid race condition
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.faceMesh) {
      if (typeof this.faceMesh.close === 'function') {
        this.faceMesh.close();
      }
      this.faceMesh = null;
    }
    this.lastFace = null;
  }
}

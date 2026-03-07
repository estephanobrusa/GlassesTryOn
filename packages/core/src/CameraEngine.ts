// CameraEngine.ts
export class CameraEngine {
  private video: HTMLVideoElement;
  private stream?: MediaStream;
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
    this.video = document.createElement('video');
    this.video.autoplay = true;
    this.video.playsInline = true;
    this.video.muted = true;
    // Mirror for selfie view
    this.video.style.display = 'block';
    this.video.style.transform = 'scaleX(-1)';
    this.container.appendChild(this.video);
  }

  async start(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          aspectRatio: { ideal: 16 / 9 },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      this.video.srcObject = this.stream;
      await this.video.play();
    } catch (err) {
      throw new Error('error accessing camera: ' + err);
    }
  }

  stop(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = undefined;
    }
    this.video.pause();
    this.video.srcObject = null;
  }

  destroy(): void {
    this.stop();
    if (this.video.parentElement) {
      this.video.parentElement.removeChild(this.video);
    }
  }

  getVideoElement(): HTMLVideoElement {
    return this.video;
  }
}

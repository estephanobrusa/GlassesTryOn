// SceneManager.ts
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export class SceneManager {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private model: THREE.Object3D | null = null;
  private container: HTMLElement;
  private animationId: number = 0;

  constructor(container: HTMLElement) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000,
    );
    this.camera.position.set(0, 0, 50);
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);

    // Ajusta el CSS del contenedor para superposición
    container.style.position = 'relative';
    // Ajusta el CSS del video si existe
    const video = container.querySelector('video');
    if (video) {
      video.style.position = 'absolute';
      video.style.top = '0';
      video.style.left = '0';
      video.style.width = '100%';
      video.style.height = '100%';
      video.style.zIndex = '1';
    }
    // Ajusta el CSS del canvas
    this.renderer.domElement.style.position = 'absolute';
    this.renderer.domElement.style.top = '0';
    this.renderer.domElement.style.left = '0';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.zIndex = '2';
    container.appendChild(this.renderer.domElement);

    // Luz básica
    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambient);
    const directional = new THREE.DirectionalLight(0xffffff, 0.6);
    directional.position.set(0, 50, 50);
    this.scene.add(directional);
  }

  start(): void {
    const renderLoop = () => {
      this.renderer.render(this.scene, this.camera);
      this.animationId = requestAnimationFrame(renderLoop);
    };
    renderLoop();
  }

  stop(): void {
    if (this.animationId) cancelAnimationFrame(this.animationId);
  }

  async setModel(
    url: string,
    config?: { scale?: number; offset?: { x?: number; y?: number; z?: number } },
  ): Promise<void> {
    // Elimina modelo anterior
    if (this.model) {
      this.scene.remove(this.model);
      this.model = null;
      console.log('[SceneManager] Modelo anterior eliminado');
    }
    // Carga GLB/GLTF
    const loader = new GLTFLoader();
    console.log('[SceneManager] Intentando cargar modelo:', url);
    return new Promise((resolve, reject) => {
      loader.load(
        url,
        (gltf) => {
          this.model = gltf.scene;
          if (config?.scale) this.model.scale.setScalar(config.scale);
          if (config?.offset) {
            this.model.position.set(
              config.offset.x || 0,
              config.offset.y || 0,
              config.offset.z || 0,
            );
          }
          this.scene.add(this.model);
          resolve();
        },
        undefined,
        reject,
      );
    });
  }

  applyTransform(transform: { position: any; quaternion: any; scale: any }): void {
    if (!this.model || !transform) return;
    // Posición
    if (transform.position) {
      this.model.position.set(transform.position.x, transform.position.y, transform.position.z);
    }
    // Rotación (quaternion)
    if (transform.quaternion) {
      this.model.quaternion.set(
        transform.quaternion[0],
        transform.quaternion[1],
        transform.quaternion[2],
        transform.quaternion[3],
      );
    }
    // Escala
    if (transform.scale) {
      this.model.scale.setScalar(transform.scale);
    }
  }

  destroy(): void {
    this.stop();
    if (this.model) {
      this.scene.remove(this.model);
      this.model = null;
    }
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}

// ThreeSceneManager.ts
// Manages the Three.js scene, orthographic camera, lighting, and model.
// Uses a centered OrthographicCamera matching the negated-pixel coordinate
// system from FaceGeometryEstimator (like the reference project).

import * as THREE from 'three';

export class ThreeSceneManager {
  public scene: THREE.Scene;
  public camera: THREE.OrthographicCamera;
  public renderer: THREE.WebGLRenderer;
  public model: THREE.Object3D | null = null;
  public modelWidth: number = 1;
  public containerWidth: number;
  public containerHeight: number;
  public videoWidth: number = 640;
  public videoHeight: number = 480;

  constructor(container: HTMLElement) {
    const w = container.offsetWidth || 640;
    const h = container.offsetHeight || 480;
    this.containerWidth = w;
    this.containerHeight = h;

    this.scene = new THREE.Scene();

    // Orthographic camera centered at origin.
    // FaceGeometryEstimator outputs negated pixel coords: x in [-w, 0], y in [-h, 0].
    // Camera frustum covers that range with some margin.
    this.camera = new THREE.OrthographicCamera(-w, 0, 0, -h, 0.1, 2000);
    this.camera.position.set(0, 0, 1000);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // --- Lighting ---
    const ambient = new THREE.AmbientLight(0xffffff, 1.0);
    this.scene.add(ambient);
    const directional = new THREE.DirectionalLight(0xffffff, 0.8);
    directional.position.set(0, 0, 1000);
    this.scene.add(directional);

    // --- Container styling ---
    container.style.position = 'relative';
    container.style.overflow = 'hidden';

    const video = container.querySelector('video');
    if (video) {
      video.style.position = 'absolute';
      video.style.top = '0';
      video.style.left = '0';
      video.style.width = '100%';
      video.style.height = '100%';
      video.style.zIndex = '1';
      // cover: preserve camera aspect ratio, crop edges rather than distort face
      video.style.objectFit = 'cover';
    }

    this.renderer.domElement.style.position = 'absolute';
    this.renderer.domElement.style.top = '0';
    this.renderer.domElement.style.left = '0';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.zIndex = '2';
    this.renderer.domElement.style.pointerEvents = 'none';
    // No CSS mirror needed here — the negation in FaceGeometryEstimator.toV()
    // already flips coordinates horizontally to match the selfie-mirrored video.
    container.appendChild(this.renderer.domElement);
  }

  /**
   * Reconfigure camera frustum and drawing buffer to match the video resolution.
   * Must be called once the actual video dimensions are known so that
   * negated-pixel landmark positions map 1-to-1 onto the orthographic frustum.
   */
  updateForVideo(videoWidth: number, videoHeight: number) {
    this.videoWidth = videoWidth;
    this.videoHeight = videoHeight;

    // Camera frustum must cover the same range as the negated landmark coords
    this.camera.left = -videoWidth;
    this.camera.right = 0;
    this.camera.top = 0;
    this.camera.bottom = -videoHeight;
    this.camera.updateProjectionMatrix();

    // Drawing buffer at video resolution; CSS (100 % / 100 %) handles display size
    this.renderer.setSize(videoWidth, videoHeight, false);
  }

  setModel(model: THREE.Object3D) {
    // Compute bounding box to know the model's native width
    const bbox = new THREE.Box3().setFromObject(model);
    this.modelWidth = bbox.max.x - bbox.min.x || 1;

    console.log('[ThreeSceneManager] Model bbox:', {
      min: { x: bbox.min.x.toFixed(3), y: bbox.min.y.toFixed(3), z: bbox.min.z.toFixed(3) },
      max: { x: bbox.max.x.toFixed(3), y: bbox.max.y.toFixed(3), z: bbox.max.z.toFixed(3) },
      width: this.modelWidth.toFixed(3),
    });

    // Anchor pivot at the geometric center of the bounding box.
    // The glasses bridge (nose rest) is at the vertical center of the model,
    // so centering the pivot here aligns the bridge with the nose bridge landmark.
    const center = new THREE.Vector3();
    bbox.getCenter(center);
    model.position.sub(center); // offset children so bridge center is at pivot

    // Wrap in a group so position/rotation/scale apply from (0,0,0)
    const wrapper = new THREE.Group();
    wrapper.add(model);

    this.model = wrapper;
    this.scene.add(wrapper);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
    if (this.model) {
      this.scene.remove(this.model);
      this.model.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose?.();
        if (mesh.material) {
          const mat = mesh.material;
          if (Array.isArray(mat)) mat.forEach((m: THREE.Material) => m.dispose?.());
          else (mat as THREE.Material).dispose?.();
        }
      });
      this.model = null;
    }
    this.scene.clear();
  }
}

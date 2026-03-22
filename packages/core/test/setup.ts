// @ts-nocheck
// Vitest global mocks setup para core GlassesTryON
// environment: 'jsdom' in vitest.config.ts already provides document/window globals
// ts-nocheck: mock factories intentionally violate THREE.js type shapes
import { vi } from 'vitest';

// Mock básico de three.js (solo clases usadas)
vi.mock('three', () => ({
  Vector3: class {
    constructor(x = 0, y = 0, z = 0) {
      this.x = x;
      this.y = y;
      this.z = z;
      this.clone = () => new this.constructor(this.x, this.y, this.z);
      this.add = this.multiplyScalar = this.sub = () => this;
      this.distanceTo = () => 1;
      this.length = () => 1;
      this.normalize = () => this;
      this.cross = () => this;
      this.addScaledVector = () => this;
      this.copy = () => this;
      this.lerp = () => this;
      this.negate = () => this;
    }
  },
  Quaternion: class {
    constructor() {
      this.x = 0;
      this.y = 0;
      this.z = 0;
      this.w = 1;
      this.setFromRotationMatrix = () => this;
      this.setFromAxisAngle = () => this;
      this.multiply = () => this;
      this.dot = () => 1;
      this.slerp = () => this;
      this.clone = () => new this.constructor();
      this.copy = () => this;
    }
  },
  Matrix4: class {
    makeBasis() {
      return this;
    }
  },
  Box3: class {
    constructor() {
      this.min = { x: 0, y: 0, z: 0 };
      this.max = { x: 1, y: 1, z: 1 };
    }
    setFromObject() {
      return this;
    }
    getCenter(v) {
      v.x = 0.5;
      v.y = 0.5;
      v.z = 0.5;
      return v;
    }
  },
  AmbientLight: class {},
  DirectionalLight: class {
    constructor() {
      this.position = { set: () => {} };
    }
  },
  Group: class {
    add() {}
    traverse(fn) {
      fn(this);
    }
    remove() {}
  },
  Scene: class {
    add() {}
    remove() {}
    clear() {}
  },
  OrthographicCamera: class {
    constructor(l, r, t, b, _near, _far) {
      this.position = { set: () => {} };
      this.updateProjectionMatrix = () => {};
      this.left = l;
      this.right = r;
      this.top = t;
      this.bottom = b;
    }
  },
  WebGLRenderer: class {
    constructor() {
      this.domElement = { style: {} };
    }
    setClearColor() {}
    setSize() {}
    setPixelRatio() {}
    render() {}
    dispose() {}
  },
  Object3D: class {
    constructor() {
      this.position = { copy: () => {}, sub: () => {}, set: () => {} };
      this.quaternion = { copy: () => {} };
      this.scale = { setScalar: () => {} };
      this.updateWorldMatrix = () => {};
      this.visible = true;
      this.traverse = (fn) => fn(this);
    }
  },
}));

// Mock global del DOM y mediaDevices/camera
if (!global.navigator) global.navigator = {};
global.navigator.mediaDevices = {
  getUserMedia: vi.fn().mockResolvedValue({
    getTracks: () => [{ stop: vi.fn() }],
  }),
};

global.document.createElement = (type) => {
  if (type === 'video')
    return {
      autoplay: true,
      playsInline: true,
      muted: true,
      style: {},
      pause: vi.fn(),
      play: vi.fn().mockResolvedValue(undefined),
      addEventListener: vi.fn((_, cb) => cb()),
      removeEventListener: vi.fn(),
      videoWidth: 640,
      videoHeight: 480,
      srcObject: null,
      parentElement: { removeChild: vi.fn() },
    };
  return {};
};

// Mock dinámico MediaPipe FaceMesh
globalThis.importModule = vi.fn((path) =>
  path.includes('@mediapipe/face_mesh')
    ? Promise.resolve({
        FaceMesh: function () {
          this.setOptions = vi.fn();
          this.onResults = vi.fn();
          this.initialize = vi.fn().mockResolvedValue(undefined);
          this.send = vi.fn().mockResolvedValue(undefined);
          this.close = vi.fn();
        },
      })
    : Promise.reject('module not found'),
);

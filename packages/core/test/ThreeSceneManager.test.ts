import { describe, it, expect, vi } from 'vitest';
import { ThreeSceneManager } from '../src/ThreeSceneManager';
import * as THREE from 'three';

// THREE is mocked in setup.ts

describe('ThreeSceneManager', () => {
  function makeContainer(overrides?: Partial<HTMLElement>): HTMLElement {
    return {
      offsetWidth: 640,
      offsetHeight: 480,
      style: {} as CSSStyleDeclaration,
      querySelector: vi.fn(() => null),
      appendChild: vi.fn(),
      ...overrides,
    } as unknown as HTMLElement;
  }

  describe('constructor', () => {
    it('constructs without throwing', () => {
      const container = makeContainer();
      expect(() => new ThreeSceneManager(container)).not.toThrow();
    });

    it('stores containerWidth from offsetWidth', () => {
      const container = makeContainer({ offsetWidth: 800 } as any);
      const mgr = new ThreeSceneManager(container);
      expect(mgr.containerWidth).toBe(800);
    });

    it('stores containerHeight from offsetHeight', () => {
      const container = makeContainer({ offsetHeight: 600 } as any);
      const mgr = new ThreeSceneManager(container);
      expect(mgr.containerHeight).toBe(600);
    });

    it('falls back to 640×480 when offsetWidth/offsetHeight are 0', () => {
      const container = makeContainer({ offsetWidth: 0, offsetHeight: 0 } as any);
      const mgr = new ThreeSceneManager(container);
      expect(mgr.containerWidth).toBe(640);
      expect(mgr.containerHeight).toBe(480);
    });

    it('creates a scene, camera, and renderer', () => {
      const container = makeContainer();
      const mgr = new ThreeSceneManager(container);
      expect(mgr.scene).toBeDefined();
      expect(mgr.camera).toBeDefined();
      expect(mgr.renderer).toBeDefined();
    });

    it('model is null initially', () => {
      const container = makeContainer();
      const mgr = new ThreeSceneManager(container);
      expect(mgr.model).toBeNull();
    });

    it('sets up container style', () => {
      const container = makeContainer();
      new ThreeSceneManager(container);
      expect((container.style as any).position).toBe('relative');
      expect((container.style as any).overflow).toBe('hidden');
    });

    it('appends renderer domElement to container', () => {
      const container = makeContainer();
      new ThreeSceneManager(container);
      expect(container.appendChild).toHaveBeenCalled();
    });

    it('styles video element if present in container', () => {
      const videoEl = { style: {} as any };
      const container = makeContainer({ querySelector: vi.fn(() => videoEl) } as any);
      new ThreeSceneManager(container);
      expect(videoEl.style.position).toBe('absolute');
      expect(videoEl.style.zIndex).toBe('1');
    });
  });

  describe('updateForVideo()', () => {
    it('updates videoWidth and videoHeight', () => {
      const mgr = new ThreeSceneManager(makeContainer());
      mgr.updateForVideo(1280, 720);
      expect(mgr.videoWidth).toBe(1280);
      expect(mgr.videoHeight).toBe(720);
    });

    it('updates camera frustum to match video dimensions', () => {
      const mgr = new ThreeSceneManager(makeContainer());
      mgr.updateForVideo(1280, 720);
      expect(mgr.camera.left).toBe(-1280);
      expect(mgr.camera.right).toBe(0);
      expect(mgr.camera.top).toBe(0);
      expect(mgr.camera.bottom).toBe(-720);
    });

    it('calls camera.updateProjectionMatrix()', () => {
      const mgr = new ThreeSceneManager(makeContainer());
      const spy = vi.spyOn(mgr.camera, 'updateProjectionMatrix');
      mgr.updateForVideo(640, 480);
      expect(spy).toHaveBeenCalled();
    });

    it('calls renderer.setSize with video dimensions', () => {
      const mgr = new ThreeSceneManager(makeContainer());
      const spy = vi.spyOn(mgr.renderer, 'setSize');
      mgr.updateForVideo(640, 480);
      expect(spy).toHaveBeenCalledWith(640, 480, false);
    });
  });

  describe('setModel()', () => {
    it('assigns model to this.model', () => {
      const mgr = new ThreeSceneManager(makeContainer());
      const model = new THREE.Object3D();
      mgr.setModel(model);
      expect(mgr.model).not.toBeNull();
    });

    it('adds model wrapper to scene', () => {
      const mgr = new ThreeSceneManager(makeContainer());
      const spy = vi.spyOn(mgr.scene, 'add');
      const model = new THREE.Object3D();
      mgr.setModel(model);
      expect(spy).toHaveBeenCalled();
    });

    it('uses bbox width when non-zero', () => {
      const mgr = new ThreeSceneManager(makeContainer());
      const model = new THREE.Object3D();
      // The mock Box3 returns min.x=0, max.x=1, so width = 1
      mgr.setModel(model);
      expect(mgr.modelWidth).toBe(1);
    });
  });

  describe('render()', () => {
    it('calls renderer.render with scene and camera', () => {
      const mgr = new ThreeSceneManager(makeContainer());
      const spy = vi.spyOn(mgr.renderer, 'render');
      mgr.render();
      expect(spy).toHaveBeenCalledWith(mgr.scene, mgr.camera);
    });
  });

  describe('destroy()', () => {
    it('calls renderer.dispose()', () => {
      const mgr = new ThreeSceneManager(makeContainer());
      const spy = vi.spyOn(mgr.renderer, 'dispose');
      mgr.destroy();
      expect(spy).toHaveBeenCalled();
    });

    it('calls scene.clear()', () => {
      const mgr = new ThreeSceneManager(makeContainer());
      const spy = vi.spyOn(mgr.scene, 'clear');
      mgr.destroy();
      expect(spy).toHaveBeenCalled();
    });

    it('sets model to null after destroy', () => {
      const mgr = new ThreeSceneManager(makeContainer());
      const model = new THREE.Object3D();
      mgr.setModel(model);
      mgr.destroy();
      expect(mgr.model).toBeNull();
    });

    it('removes model from scene when model exists', () => {
      const mgr = new ThreeSceneManager(makeContainer());
      const model = new THREE.Object3D();
      mgr.setModel(model);
      const spy = vi.spyOn(mgr.scene, 'remove');
      mgr.destroy();
      expect(spy).toHaveBeenCalled();
    });

    it('traverses model children during destroy', () => {
      const mgr = new ThreeSceneManager(makeContainer());
      const model = new THREE.Object3D();
      mgr.setModel(model);
      // model is a Group wrapper; traverse is called
      expect(() => mgr.destroy()).not.toThrow();
    });

    it('handles destroy with no model set (model is null)', () => {
      const mgr = new ThreeSceneManager(makeContainer());
      expect(() => mgr.destroy()).not.toThrow();
    });
  });
});

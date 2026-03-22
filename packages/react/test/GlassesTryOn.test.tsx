import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { GlassesTryOn } from '../src/GlassesTryOn';
import { GlassesViewer } from 'glasses-tryon-core';

// GlassesViewer is mocked in test/setup.ts

describe('GlassesTryOn', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders a div container without throwing', () => {
      const { container } = render(<GlassesTryOn model="test.glb" />);
      expect(container.firstChild).not.toBeNull();
    });

    it('renders a div element', () => {
      const { container } = render(<GlassesTryOn model="test.glb" />);
      expect(container.firstChild?.nodeName).toBe('DIV');
    });

    it('renders with 100% width and height styles', () => {
      const { container } = render(<GlassesTryOn model="test.glb" />);
      const div = container.firstChild as HTMLElement;
      expect(div.style.width).toBe('100%');
      expect(div.style.height).toBe('100%');
    });
  });

  describe('GlassesViewer lifecycle', () => {
    it('creates a GlassesViewer on mount', async () => {
      await act(async () => {
        render(<GlassesTryOn model="test.glb" />);
      });
      expect(GlassesViewer).toHaveBeenCalled();
    });

    it('calls start() on mount', async () => {
      let viewerInstance: any;
      (GlassesViewer as any).mockImplementation(function (this: any, opts: any) {
        this.opts = opts;
        this.listeners = {};
        this.on = vi.fn((event: string, cb: () => void) => {
          this.listeners[event] = cb;
        });
        this.start = vi.fn().mockResolvedValue(undefined);
        this.destroy = vi.fn();
        viewerInstance = this;
      });

      await act(async () => {
        render(<GlassesTryOn model="test.glb" />);
      });

      expect(viewerInstance.start).toHaveBeenCalled();
    });

    it('calls destroy() on unmount', async () => {
      let viewerInstance: any;
      (GlassesViewer as any).mockImplementation(function (this: any, opts: any) {
        this.opts = opts;
        this.listeners = {};
        this.on = vi.fn();
        this.start = vi.fn().mockResolvedValue(undefined);
        this.destroy = vi.fn();
        viewerInstance = this;
      });

      const { unmount } = await act(async () => {
        return render(<GlassesTryOn model="test.glb" />);
      });

      await act(async () => {
        unmount();
      });

      expect(viewerInstance.destroy).toHaveBeenCalled();
    });

    it('passes model URL to GlassesViewer', async () => {
      let capturedOpts: any;
      (GlassesViewer as any).mockImplementation(function (this: any, opts: any) {
        capturedOpts = opts;
        this.on = vi.fn();
        this.start = vi.fn().mockResolvedValue(undefined);
        this.destroy = vi.fn();
      });

      await act(async () => {
        render(<GlassesTryOn model="my-glasses.glb" />);
      });

      expect(capturedOpts.model.url).toBe('my-glasses.glb');
    });

    it('passes maxFPS to GlassesViewer', async () => {
      let capturedOpts: any;
      (GlassesViewer as any).mockImplementation(function (this: any, opts: any) {
        capturedOpts = opts;
        this.on = vi.fn();
        this.start = vi.fn().mockResolvedValue(undefined);
        this.destroy = vi.fn();
      });

      await act(async () => {
        render(<GlassesTryOn model="test.glb" maxFPS={60} />);
      });

      expect(capturedOpts.render.maxFPS).toBe(60);
    });

    it('passes modelConfig scale to alignmentConfig', async () => {
      let capturedOpts: any;
      (GlassesViewer as any).mockImplementation(function (this: any, opts: any) {
        capturedOpts = opts;
        this.on = vi.fn();
        this.start = vi.fn().mockResolvedValue(undefined);
        this.destroy = vi.fn();
      });

      await act(async () => {
        render(<GlassesTryOn model="test.glb" modelConfig={{ scale: 1.5 }} />);
      });

      expect(capturedOpts.alignmentConfig.glassesScaleFactor).toBe(1.5);
    });

    it('passes modelConfig offset z to alignmentConfig', async () => {
      let capturedOpts: any;
      (GlassesViewer as any).mockImplementation(function (this: any, opts: any) {
        capturedOpts = opts;
        this.on = vi.fn();
        this.start = vi.fn().mockResolvedValue(undefined);
        this.destroy = vi.fn();
      });

      await act(async () => {
        render(<GlassesTryOn model="test.glb" modelConfig={{ offset: { z: 15 } }} />);
      });

      expect(capturedOpts.alignmentConfig.glassesZ).toBe(15);
    });

    it('registers faceDetected event listener', async () => {
      let onMock: any;
      (GlassesViewer as any).mockImplementation(function (this: any, opts: any) {
        this.opts = opts;
        onMock = vi.fn();
        this.on = onMock;
        this.start = vi.fn().mockResolvedValue(undefined);
        this.destroy = vi.fn();
      });

      await act(async () => {
        render(<GlassesTryOn model="test.glb" />);
      });

      expect(onMock).toHaveBeenCalledWith('faceDetected', expect.any(Function));
    });
  });

  describe('onFaceDetected callback', () => {
    it('calls onFaceDetected when faceDetected event fires', async () => {
      const onFaceDetected = vi.fn();
      let viewerInstance: any;

      (GlassesViewer as any).mockImplementation(function (this: any, opts: any) {
        this.opts = opts;
        this.listeners = {} as Record<string, () => void>;
        this.on = vi.fn((event: string, cb: () => void) => {
          this.listeners[event] = cb;
        });
        this.start = vi.fn().mockResolvedValue(undefined);
        this.destroy = vi.fn();
        this.emit = (event: string) => {
          if (this.listeners[event]) this.listeners[event]();
        };
        viewerInstance = this;
      });

      await act(async () => {
        render(<GlassesTryOn model="test.glb" onFaceDetected={onFaceDetected} />);
      });

      act(() => {
        viewerInstance.emit('faceDetected');
      });

      expect(onFaceDetected).toHaveBeenCalled();
    });

    it('uses a no-op when onFaceDetected is not provided', async () => {
      let capturedCb: any;
      (GlassesViewer as any).mockImplementation(function (this: any, opts: any) {
        this.opts = opts;
        this.on = vi.fn((event: string, cb: () => void) => {
          capturedCb = cb;
        });
        this.start = vi.fn().mockResolvedValue(undefined);
        this.destroy = vi.fn();
      });

      await act(async () => {
        render(<GlassesTryOn model="test.glb" />);
      });

      // Should not throw when called
      expect(() => capturedCb && capturedCb()).not.toThrow();
    });
  });

  describe('prop changes trigger re-initialization', () => {
    it('recreates viewer when model prop changes', async () => {
      const constructorSpy = vi.fn();
      (GlassesViewer as any).mockImplementation(function (this: any, opts: any) {
        constructorSpy(opts);
        this.opts = opts;
        this.on = vi.fn();
        this.start = vi.fn().mockResolvedValue(undefined);
        this.destroy = vi.fn();
      });

      const { rerender } = await act(async () => {
        return render(<GlassesTryOn model="model1.glb" />);
      });

      await act(async () => {
        rerender(<GlassesTryOn model="model2.glb" />);
      });

      // Constructor called twice (once per model)
      expect(constructorSpy).toHaveBeenCalledTimes(2);
    });

    it('recreates viewer when maxFPS prop changes', async () => {
      const constructorSpy = vi.fn();
      (GlassesViewer as any).mockImplementation(function (this: any, opts: any) {
        constructorSpy(opts);
        this.opts = opts;
        this.on = vi.fn();
        this.start = vi.fn().mockResolvedValue(undefined);
        this.destroy = vi.fn();
      });

      const { rerender } = await act(async () => {
        return render(<GlassesTryOn model="test.glb" maxFPS={30} />);
      });

      await act(async () => {
        rerender(<GlassesTryOn model="test.glb" maxFPS={60} />);
      });

      expect(constructorSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('edge cases', () => {
    it('renders without optional props', () => {
      expect(() => render(<GlassesTryOn model="test.glb" />)).not.toThrow();
    });

    it('handles start() rejection gracefully', async () => {
      (GlassesViewer as any).mockImplementation(function (this: any, opts: any) {
        this.opts = opts;
        this.on = vi.fn();
        this.start = vi.fn().mockRejectedValue(new Error('start failed'));
        this.destroy = vi.fn();
      });

      // Should not crash the component render
      await act(async () => {
        expect(() => render(<GlassesTryOn model="test.glb" />)).not.toThrow();
      });
    });

    it('enables debug mode by default', async () => {
      let capturedOpts: any;
      (GlassesViewer as any).mockImplementation(function (this: any, opts: any) {
        capturedOpts = opts;
        this.on = vi.fn();
        this.start = vi.fn().mockResolvedValue(undefined);
        this.destroy = vi.fn();
      });

      await act(async () => {
        render(<GlassesTryOn model="test.glb" />);
      });

      expect(capturedOpts.debug).toBe(true);
    });
  });
});

// environment: 'jsdom' in vitest.config.ts already provides document/window globals
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { CameraEngine } from '../src/CameraEngine';

describe('CameraEngine', () => {
  let container: { appendChild: ReturnType<typeof vi.fn>; querySelector: ReturnType<typeof vi.fn> };
  beforeEach(() => {
    container = { appendChild: vi.fn(), querySelector: vi.fn() };
  });

  it('should construct and append video', () => {
    const engine = new CameraEngine(container as unknown as HTMLElement);
    expect(container.appendChild).toHaveBeenCalled();
    expect(engine.getVideoElement()).toBeDefined();
  });

  it('start(): sets video.srcObject, calls play', async () => {
    const engine = new CameraEngine(container as unknown as HTMLElement);
    await engine.start();
    const video = engine.getVideoElement();
    expect(video.srcObject).not.toBeNull();
    expect((video as any).play).toHaveBeenCalled();
  });

  it('start(): throws if camera error', async () => {
    (global.navigator.mediaDevices.getUserMedia as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      'fail',
    );
    const engine = new CameraEngine(container as unknown as HTMLElement);
    await expect(engine.start()).rejects.toThrow(/error accessing camera/);
  });

  it('stop(): stops tracks, pauses and clears video', async () => {
    const engine = new CameraEngine(container as unknown as HTMLElement);
    await engine.start();
    const video = engine.getVideoElement();
    engine.stop();
    expect((video as any).pause).toHaveBeenCalled();
    expect(video.srcObject).toBeNull();
  });

  it('destroy(): calls stop & removes video', async () => {
    const engine = new CameraEngine(container as unknown as HTMLElement);
    await engine.start();
    const video = engine.getVideoElement();
    engine.destroy();
    expect((video as any).pause).toHaveBeenCalled();
    expect((video.parentElement as any).removeChild).toHaveBeenCalledWith(video);
  });
});

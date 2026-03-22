// Vitest setup para mocks en paquete react GlassesTryON
import { vi } from 'vitest';

// Mock (proxy) del core: clases mínimas necesarias para GlassesTryOn
// Using vi.fn() constructor so tests can use mockImplementation
const GlassesViewerMock = vi.fn(function (this: any, opts: any) {
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
});

vi.mock('glasses-tryon-core', () => ({
  GlassesViewer: GlassesViewerMock,
}));

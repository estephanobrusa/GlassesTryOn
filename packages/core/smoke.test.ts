import { describe, it, expect } from 'vitest';
import * as exported from './dist/index.js';

describe('smoke', () => {
  it('should export GlassesViewer', () => {
    expect(exported).toHaveProperty('GlassesViewer');
  });
});

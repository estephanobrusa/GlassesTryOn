import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/App.tsx'],
  format: ['esm', 'cjs'],
  dts: true,
  outDir: 'dist',
  sourcemap: true,
});

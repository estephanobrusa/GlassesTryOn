import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    coverage: {
      provider: 'v8',
      threshold: { lines: 60, statements: 60, functions: 60, branches: 60 },
      reporter: ['text', 'html'],
    },
  },
});

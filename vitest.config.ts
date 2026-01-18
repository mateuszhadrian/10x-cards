import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // Test environment - jsdom for DOM testing
    environment: 'jsdom',

    // Setup files to run before each test
    setupFiles: ['./tests/setup/vitest.setup.ts'],

    // Global test utilities
    globals: true,

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.config.*',
        '**/*.d.ts',
        'dist/',
        '.astro/',
        'src/env.d.ts',
        'src/db/database.types.ts', // Generated types
      ],
      // Thresholds - configure when coverage is important
      // thresholds: {
      //   lines: 80,
      //   functions: 80,
      //   branches: 80,
      //   statements: 80,
      // },
    },

    // Include/exclude patterns
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', '.astro', 'e2e'],

    // Test timeout
    testTimeout: 10000,

    // Watch mode - ignore certain files
    watchExclude: ['**/node_modules/**', '**/dist/**', '**/.astro/**'],

    // Reporter
    reporters: ['verbose'],

    // Parallel execution (Vitest 4+ format - poolOptions removed, now top-level)
    pool: 'threads',
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@db': path.resolve(__dirname, './src/db'),
    },
  },
});

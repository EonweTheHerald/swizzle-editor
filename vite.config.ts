import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3001,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: mode !== 'production',
    // PixiJS alone is ~529 KB minified — suppress the warning for expected large chunks.
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // Isolate the heavy PixiJS + Swizzle runtime from app code.
          'pixi': ['pixi.js'],
          'swizzle': ['@eonwetheherald/swizzle'],
          // Isolate vendor React + UI libs.
          'vendor': ['react', 'react-dom', 'zustand', 'sonner'],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: ['node_modules/', 'tests/', '**/*.spec.ts', '**/*.spec.tsx'],
    },
  },
}));

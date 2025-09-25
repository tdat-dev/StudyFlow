import { defineConfig, coverageConfigDefaults } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [...coverageConfigDefaults.exclude, 'src/__tests__/**'],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/components': resolve(__dirname, './src/components'),
      '@/lib': resolve(__dirname, './src/lib'),
      '@/services': resolve(__dirname, './src/services'),
      '@/types': resolve(__dirname, './src/types'),
      '@/hooks': resolve(__dirname, './src/hooks'),
      '@/utils': resolve(__dirname, './src/utils'),
    },
  },
});

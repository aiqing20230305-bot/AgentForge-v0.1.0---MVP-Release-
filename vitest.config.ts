import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    // Exclude E2E tests (Playwright)
    exclude: [
      'node_modules/**',
      'dist/**',
      'tests/**', // Playwright E2E tests
      'backend/**',
      'electron/**',
      '.prophet/**',
    ],
    // Only include files in src/ directory
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        '*.config.ts',
        '*.config.js',
        'dist/',
        'backend/',
        'electron/',
        '.prophet/',
        'scripts/',
        '**/*.d.ts',
        '**/__tests__/**',
      ],
      // Coverage thresholds
      lines: 70,
      functions: 70,
      branches: 70,
      statements: 70,
    },
    // Performance settings
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})

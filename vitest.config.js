import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.js'],
    globals: true,
    // Tell Vitest to use a quiet reporter for cleaner output
    reporters: ['default'],
    // Exit on first failure if debugging
    bail: process.env.CI ? 0 : false,
  },
});
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    coverage: {
      reporter: ['text', 'lcov'],
      provider: 'v8',
      reportsDirectory: 'coverage',
      include: ['src/server/**/*.ts'],
    },
  },
});

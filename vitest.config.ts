import { defineConfig } from 'vitest/config';

const network = process.env['MIDNIGHT_NETWORK'] ?? 'local';
const isRemote = network !== 'local';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    testTimeout: 10 * 60_000,
    hookTimeout: isRemote ? 150 * 60_000 : 15 * 60_000,
    include: ['src/**/*.test.ts'],
    reporters: ['default'],
    sequence: { concurrent: false },
    fileParallelism: false,
    disableConsoleIntercept: true,
  },
});

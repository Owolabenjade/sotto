// SPDX-License-Identifier: Apache-2.0
// Adapted from midnight-examples (examples/leaderboard/ui/vite.config.ts).
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';

const here = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: here,
  envDir: here,
  // FetchZkConfigProvider requests <origin>/keys/<circuit>.prover etc., which is
  // the layout of contract/managed/sotto. `vite build` copies it into dist/.
  publicDir: path.resolve(here, '../contract/managed/sotto'),
  build: {
    outDir: path.resolve(here, 'dist'),
    emptyOutDir: true,
    target: 'esnext',
    commonjsOptions: { transformMixedEsModules: true },
  },
  plugins: [react(), wasm(), topLevelAwait()],
  optimizeDeps: {
    esbuildOptions: { target: 'esnext' },
    exclude: ['@midnightntwrk/ledger-v9', '@midnightntwrk/onchain-runtime-v4', '@midnight-ntwrk/midnight-js-protocol'],
  },
  server: {
    port: 3000,
    fs: { allow: [path.resolve(here, '..')] },
  },
});

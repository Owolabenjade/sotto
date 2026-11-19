// SPDX-License-Identifier: Apache-2.0
import { Buffer } from 'buffer';
(globalThis as unknown as { Buffer: typeof Buffer }).Buffer = Buffer;

import { lazy, StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { WarmupPage } from './warmup';
import { contractFromLocation, prefetchState } from './prefetch';
import './fonts.css';
import './styles.css';

// Ask the indexer for the channel now, while the runtime downloads.
prefetchState(contractFromLocation(import.meta.env.VITE_CONTRACT_ADDRESS ?? ''));

// The app pulls in the Midnight runtime (several MB of WebAssembly). Load it
// behind the warm-up frame so the first paint never waits for it.
const App = lazy(() => import('./App'));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={<WarmupPage />}>
      <App />
    </Suspense>
  </StrictMode>,
);

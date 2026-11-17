// SPDX-License-Identifier: Apache-2.0
// Browser-safe export of the compiled contract (no node:* imports). The UI
// serves contract/managed/sotto as its public directory, so the keys and ZKIR
// are fetched from the site root.
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/v9/compact-js';
import { Contract } from './managed/sotto/contract/index.js';
import { witnesses } from './witnesses.js';

export { Contract, ledger, pureCircuits, CaseStatus, type Ledger } from './managed/sotto/contract/index.js';
export { witnesses, createSottoPrivateState, type SottoPrivateState } from './witnesses.js';

export const CompiledSottoContract = CompiledContract.make('SottoContract', Contract).pipe(
  CompiledContract.withWitnesses(witnesses),
  CompiledContract.withCompiledFileAssets('./managed/sotto'),
);

// SPDX-License-Identifier: Apache-2.0
// Witnesses: the off-chain inputs the Sotto circuits ask for. Runs in the
// browser too, so no node:* imports here.
import { type Ledger, type Witnesses, CaseStatus } from './managed/sotto/contract/index.js';
import { type WitnessContext } from '@midnight-ntwrk/midnight-js-protocol/v9/compact-runtime';

// One secret per participant: the officer's (whose hash is officerPk) or a
// member's (whose hash is their enrolled member key). It never leaves this
// private state.
export type SottoPrivateState = {
  readonly secretKey: Uint8Array;
};

export const createSottoPrivateState = (secretKey: Uint8Array): SottoPrivateState => {
  if (secretKey.length !== 32) throw new Error('secretKey must be 32 bytes');
  return { secretKey };
};

export const witnesses: Witnesses<SottoPrivateState> = {
  secretKey: ({ privateState }) => [privateState, privateState.secretKey],
  // The path is read from the members tree of the state the circuit runs
  // against, so it matches the root fileReport checks. A revoked member's
  // leaf has been overwritten, so no path exists for them.
  memberPath: ({ privateState, ledger }, key) => {
    const path = ledger.members.findPathForLeaf(key);
    if (path === undefined) throw new Error('This credential is not a current member');
    return [privateState, path];
  },
};

export { CaseStatus };
export type { Ledger, Witnesses, WitnessContext };

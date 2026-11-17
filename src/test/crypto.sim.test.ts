// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from 'vitest';
import { PAD_BLOCK, newBoxKeys, newSecretKey, open, reporterBoxKeys, seal } from '../crypto.js';

const ADDR = 'ab'.repeat(32);
const ID = new Uint8Array(32).fill(3);
const ctx = { contractAddress: ADDR, caseId: ID, seq: 0 };

describe('sealed messages', () => {
  it('round-trips to the intended recipient only', () => {
    const officer = newBoxKeys();
    const blob = seal('Invoices from vendor X are inflated by 20%.', officer.publicKey, ctx);
    expect(open(blob, officer, ctx)).toBe('Invoices from vendor X are inflated by 20%.');
    expect(open(blob, newBoxKeys(), ctx)).toBeUndefined();
  });

  it('cannot be replayed into another case, slot or contract', () => {
    const officer = newBoxKeys();
    const blob = seal('hello', officer.publicKey, ctx);
    expect(open(blob, officer, { ...ctx, seq: 1 })).toBeUndefined();
    expect(open(blob, officer, { ...ctx, caseId: new Uint8Array(32).fill(4) })).toBeUndefined();
    expect(open(blob, officer, { ...ctx, contractAddress: 'cd'.repeat(32) })).toBeUndefined();
  });

  it('hides the message length within a padding bucket', () => {
    const k = newBoxKeys().publicKey;
    expect(seal('a', k, ctx).length).toBe(seal('a'.repeat(PAD_BLOCK - 10), k, ctx).length);
    expect(seal('a'.repeat(PAD_BLOCK), k, ctx).length).toBeGreaterThan(seal('a', k, ctx).length);
  });

  it('derives the same reporter box from the secret, and different boxes per case', () => {
    const sk = newSecretKey();
    expect(reporterBoxKeys(sk, ID).publicKey).toEqual(reporterBoxKeys(sk, ID).publicKey);
    expect(reporterBoxKeys(sk, ID).publicKey).not.toEqual(reporterBoxKeys(sk, new Uint8Array(32)).publicKey);
  });
});

// SPDX-License-Identifier: Apache-2.0
// Off-chain cryptography for Sotto. Runs in Node and in the browser.
//
// Messages are sealed boxes: an ephemeral X25519 key agrees a secret with the
// recipient's box key, HKDF turns it into an XChaCha20-Poly1305 key, and the
// associated data binds the ciphertext to (contract, case, message number), so
// it can't be replayed into another case or deployment. Plaintext is padded
// to a multiple of PAD_BLOCK bytes, so the ledger shows a length bucket, not
// the message length.
import { x25519 } from '@noble/curves/ed25519.js';
import { xchacha20poly1305 } from '@noble/ciphers/chacha.js';
import { hkdf } from '@noble/hashes/hkdf.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { randomBytes } from '@noble/hashes/utils.js';
import { pureCircuits } from '../contract/managed/sotto/contract/index.js';

const VERSION = 1;
const NONCE = 24;
export const PAD_BLOCK = 512;
export const MAX_PLAINTEXT = 8 * PAD_BLOCK - 4;

const enc = new TextEncoder();
const dec = new TextDecoder();

const concat = (...parts: Uint8Array[]): Uint8Array => {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const p of parts) {
    out.set(p, at);
    at += p.length;
  }
  return out;
};

const u32 = (n: number): Uint8Array => {
  const b = new Uint8Array(4);
  new DataView(b.buffer).setUint32(0, n);
  return b;
};

export const hexToBytes = (hex: string): Uint8Array => {
  const h = hex.startsWith('0x') ? hex.slice(2) : hex;
  if (h.length % 2 !== 0 || /[^0-9a-f]/i.test(h)) throw new Error('Not a hex string');
  return Uint8Array.from(h.match(/../g) ?? [], (x) => parseInt(x, 16));
};
export const bytesToHex = (b: Uint8Array): string => Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');

// ---- Identities ----

export const newSecretKey = (): Uint8Array => randomBytes(32);
export const officerKey = (sk: Uint8Array): Uint8Array => pureCircuits.officerKey(sk);
export const memberKey = (sk: Uint8Array): Uint8Array => pureCircuits.memberKey(sk);
export const reporterTag = (sk: Uint8Array, caseId: Uint8Array): Uint8Array => pureCircuits.reporterTag(sk, caseId);
export const messageKey = (caseId: Uint8Array, seq: number | bigint): Uint8Array =>
  pureCircuits.messageKey(caseId, BigInt(seq));

/** The contract address as the 32 bytes kernel.self() hashes. */
export const instanceBytes = (contractAddress: string): Uint8Array => {
  const b = hexToBytes(contractAddress);
  return b.length > 32 ? b.subarray(b.length - 32) : b;
};

/** The case id a member's report in `period` gets on this contract. */
export const caseId = (sk: Uint8Array, period: bigint, contractAddress: string): Uint8Array =>
  pureCircuits.caseNullifier(sk, period, instanceBytes(contractAddress));

export const periodOf = (unixSeconds: number, periodSecs: bigint): bigint => BigInt(unixSeconds) / periodSecs;

// ---- Box keys ----

export type BoxKeys = { secretKey: Uint8Array; publicKey: Uint8Array };

export const newBoxKeys = (): BoxKeys => {
  const { secretKey, publicKey } = x25519.keygen();
  return { secretKey, publicKey };
};

/**
 * The reporter's box key for one case, derived from their secret: the member
 * can always recover the thread from the secret alone, and two cases' box keys
 * are unlinkable.
 */
export const reporterBoxKeys = (sk: Uint8Array, id: Uint8Array): BoxKeys => {
  const secretKey = hkdf(sha256, sk, id, enc.encode('sotto:reporter-box'), 32);
  return { secretKey, publicKey: x25519.getPublicKey(secretKey) };
};

// ---- Sealing ----

export type MessageContext = { contractAddress: string; caseId: Uint8Array; seq: number };

const aadOf = (ctx: MessageContext, header: Uint8Array): Uint8Array =>
  concat(header, enc.encode('sotto:msg'), instanceBytes(ctx.contractAddress), ctx.caseId, u32(ctx.seq));

const pad = (plain: Uint8Array): Uint8Array => {
  if (plain.length > MAX_PLAINTEXT) throw new Error(`Message is longer than ${MAX_PLAINTEXT} bytes`);
  const size = Math.ceil((plain.length + 4) / PAD_BLOCK) * PAD_BLOCK;
  const out = new Uint8Array(size);
  out.set(u32(plain.length), 0);
  out.set(plain, 4);
  return out;
};

const unpad = (padded: Uint8Array): Uint8Array => {
  const n = new DataView(padded.buffer, padded.byteOffset).getUint32(0);
  if (n > padded.length - 4) throw new Error('Bad padding');
  return padded.slice(4, 4 + n);
};

const keyFor = (shared: Uint8Array, ephPub: Uint8Array, recipient: Uint8Array): Uint8Array =>
  hkdf(sha256, shared, concat(ephPub, recipient), enc.encode('sotto:seal'), 32);

/** Seals `text` to `recipient` (an X25519 public key) for one message slot. */
export const seal = (text: string, recipient: Uint8Array, ctx: MessageContext): Uint8Array => {
  const eph = x25519.utils.randomSecretKey();
  const ephPub = x25519.getPublicKey(eph);
  const header = concat(Uint8Array.of(VERSION), ephPub);
  const key = keyFor(x25519.getSharedSecret(eph, recipient), ephPub, recipient);
  const nonce = randomBytes(NONCE);
  const ct = xchacha20poly1305(key, nonce, aadOf(ctx, header)).encrypt(pad(enc.encode(text)));
  return concat(header, nonce, ct);
};

/** Opens a sealed message, or returns undefined if it isn't for this key and slot. */
export const open = (blob: Uint8Array, box: BoxKeys, ctx: MessageContext): string | undefined => {
  if (blob.length < 1 + 32 + NONCE + 16 || blob[0] !== VERSION) return undefined;
  const header = blob.subarray(0, 33);
  const ephPub = blob.subarray(1, 33);
  try {
    const key = keyFor(x25519.getSharedSecret(box.secretKey, ephPub), ephPub, box.publicKey);
    const plain = xchacha20poly1305(key, blob.subarray(33, 33 + NONCE), aadOf(ctx, header)).decrypt(
      blob.subarray(33 + NONCE),
    );
    return dec.decode(unpad(plain));
  } catch {
    return undefined;
  }
};

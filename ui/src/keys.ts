// SPDX-License-Identifier: Apache-2.0
// Local key handling. A member's secret is generated in this browser and never
// sent anywhere; only its hash (the member key) goes to the officer. Keys live
// in localStorage and can be exported as a file.
import { bytesToHex, hexToBytes, memberKey, newSecretKey } from '../../src/crypto';

const MEMBER = 'sotto.member.v1';
const OFFICER = 'sotto.officer.v1';

const get = (k: string): string | null => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};
const put = (k: string, v: string | null) => {
  try {
    if (v === null) localStorage.removeItem(k);
    else localStorage.setItem(k, v);
  } catch {
    /* private mode: keys live for this page only */
  }
};

export type MemberCredential = { secretKey: Uint8Array; memberKeyHex: string };

export function loadMember(): MemberCredential | null {
  const hex = get(MEMBER);
  if (!hex) return null;
  try {
    const secretKey = hexToBytes(hex);
    return { secretKey, memberKeyHex: bytesToHex(memberKey(secretKey)) };
  } catch {
    return null;
  }
}

export function createMember(): MemberCredential {
  const secretKey = newSecretKey();
  put(MEMBER, bytesToHex(secretKey));
  return { secretKey, memberKeyHex: bytesToHex(memberKey(secretKey)) };
}

export function importMember(hex: string): MemberCredential {
  const secretKey = hexToBytes(hex.trim());
  if (secretKey.length !== 32) throw new Error('A credential is 64 hex characters');
  put(MEMBER, bytesToHex(secretKey));
  return { secretKey, memberKeyHex: bytesToHex(memberKey(secretKey)) };
}

export const forgetMember = () => put(MEMBER, null);

export type OfficerKeys = { secretKey: Uint8Array; boxSecretKey: Uint8Array };

export function loadOfficer(): OfficerKeys | null {
  const raw = get(OFFICER);
  if (!raw) return null;
  try {
    return parseOfficer(raw);
  } catch {
    return null;
  }
}

/** Accepts the officer block of a key file: { "secretKey": hex, "boxSecretKey": hex }. */
export function parseOfficer(json: string): OfficerKeys {
  const o = JSON.parse(json);
  const src = o.officer ?? o;
  const secretKey = hexToBytes(String(src.secretKey));
  const boxSecretKey = hexToBytes(String(src.boxSecretKey));
  if (secretKey.length !== 32 || boxSecretKey.length !== 32) throw new Error('Keys must be 32 bytes each');
  return { secretKey, boxSecretKey };
}

export function saveOfficer(json: string): OfficerKeys {
  const k = parseOfficer(json);
  put(OFFICER, JSON.stringify({ secretKey: bytesToHex(k.secretKey), boxSecretKey: bytesToHex(k.boxSecretKey) }));
  return k;
}

export const forgetOfficer = () => put(OFFICER, null);

export function download(name: string, text: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

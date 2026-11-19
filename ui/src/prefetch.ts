// SPDX-License-Identifier: Apache-2.0
// Starts the indexer request for the channel's state at first paint, in
// parallel with the Midnight runtime download. Plain fetch, no WebAssembly, so
// main.tsx can call it before the app module loads; ledger.ts takes the
// answer from here the first time.
export const INDEXER_URL = import.meta.env.VITE_INDEXER_URL ?? 'https://indexer.preview.midnight.network/api/v4/graphql';
const QUERY = `query ContractState($address: HexEncoded!) { contractAction(address: $address) { state } }`;

const inflight = new Map<string, Promise<string>>();

export function fetchStateHex(address: string): Promise<string> {
  return (async () => {
    const res = await fetch(INDEXER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: QUERY, variables: { address } }),
    });
    if (!res.ok) throw new Error(`The indexer answered ${res.status}`);
    const gql = await res.json();
    if (gql.errors) throw new Error(gql.errors[0]?.message ?? 'Indexer query failed');
    const hex = gql.data?.contractAction?.state;
    if (!hex) throw new Error('No Sotto channel at this address on this network');
    return hex as string;
  })();
}

/** Kick off the first read early. */
export function prefetchState(address: string) {
  if (address && !inflight.has(address)) {
    const p = fetchStateHex(address);
    p.catch(() => inflight.delete(address));
    inflight.set(address, p);
  }
}

/** The early read if one is waiting (used once), otherwise a fresh read. */
export function takeStateHex(address: string): Promise<string> {
  const early = inflight.get(address);
  if (early) {
    inflight.delete(address);
    return early;
  }
  return fetchStateHex(address);
}

export const contractFromLocation = (fallback: string): string => {
  const c = new URLSearchParams(window.location.search).get('c');
  return c && /^[0-9a-f]{64,}$/i.test(c) ? c : fallback;
};

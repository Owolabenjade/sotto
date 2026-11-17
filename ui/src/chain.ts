// SPDX-License-Identifier: Apache-2.0
// Connects to the Lace wallet through the DApp Connector API and submits Sotto
// circuit calls. Lace proves and pays; the page never sees the wallet's keys,
// and the Sotto secret stays in this page's private state.
// Provider wiring adapted from midnight-examples (leaderboard BrowserLeaderboardManager).
import * as ledgerV9 from '@midnight-ntwrk/midnight-js-protocol/v9';
import { fromHex, toHex } from '@midnight-ntwrk/midnight-js-protocol/v9/compact-runtime';
import { submitCallTx } from '@midnight-ntwrk/midnight-js-contracts';
import { type ConnectedAPI, type InitialAPI } from '@midnight-ntwrk/dapp-connector-api';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { dappConnectorProofProvider } from '@midnight-ntwrk/midnight-js-dapp-connector-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import {
  createLedger9MidnightProvider,
  createLedger9WalletProvider,
  type LedgerTransaction,
  type MidnightProviders,
} from '@midnight-ntwrk/midnight-js-types';
import { type NetworkId, setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import semver from 'semver';
import { inMemoryPrivateStateProvider } from './in-memory-private-state-provider';
import { CompiledSottoContract, createSottoPrivateState } from '../../contract/browser';
import { NETWORK } from './ledger';

export type Circuit =
  | 'enrol'
  | 'revoke'
  | 'fileReport'
  | 'acknowledge'
  | 'officerMessage'
  | 'closeCase'
  | 'reporterMessage';

type Providers = MidnightProviders<any>;

let providers: Promise<Providers> | undefined;

const findWallet = (): InitialAPI | undefined => {
  const w = (window as unknown as { midnight?: Record<string, unknown> }).midnight;
  if (!w) return undefined;
  return Object.values(w).find(
    (x): x is InitialAPI => !!x && typeof x === 'object' && 'apiVersion' in x && semver.satisfies((x as InitialAPI).apiVersion, '4.x'),
  );
};

export const walletAvailable = (): boolean => findWallet() !== undefined;

async function connect(): Promise<ConnectedAPI> {
  for (let i = 0; i < 30 && !findWallet(); i++) await new Promise((r) => setTimeout(r, 100));
  const initial = findWallet();
  if (!initial) throw new Error('No Midnight wallet found. Install Lace and switch it to the Preview network.');
  return initial.connect(NETWORK);
}

async function build(): Promise<Providers> {
  setNetworkId(NETWORK as NetworkId);
  const api = await connect();
  const config = await api.getConfiguration();
  const shielded = await api.getShieldedAddresses();
  const zkConfigProvider = new FetchZkConfigProvider<Circuit>(window.location.origin, { fetchFunc: fetch.bind(window) });
  return {
    privateStateProvider: inMemoryPrivateStateProvider(),
    zkConfigProvider,
    proofProvider: await dappConnectorProofProvider(api, zkConfigProvider, ledgerV9.CostModel.initialCostModel()),
    publicDataProvider: indexerPublicDataProvider(
      config.indexerUri,
      config.indexerWsUri,
      WebSocket as unknown as Parameters<typeof indexerPublicDataProvider>[2],
    ),
    walletProvider: createLedger9WalletProvider({
      getCoinPublicKey: () => shielded.shieldedCoinPublicKey as ledgerV9.CoinPublicKey,
      getEncryptionPublicKey: () => shielded.shieldedEncryptionPublicKey as ledgerV9.EncPublicKey,
      balanceTx: async (tx: LedgerTransaction<'Unbound', 'v9'>) => {
        const r = await api.balanceUnsealedTransaction(toHex(tx.serialize()));
        return ledgerV9.Transaction.deserialize('signature', 'proof', 'binding', fromHex(r.tx));
      },
    }),
    midnightProvider: createLedger9MidnightProvider(async (tx: LedgerTransaction<'Finalized', 'v9'>) => {
      const s = tx.serialize();
      await api.submitTransaction(toHex(s));
      return ledgerV9.Transaction.deserialize('signature', 'proof', 'binding', s).identifiers()[0];
    }),
    config: { networkId: NETWORK, ttlSeconds: 3600 },
  } as unknown as Providers;
}

export const connectWallet = (): Promise<Providers> => (providers ??= build().catch((e) => {
  providers = undefined;
  throw e;
}));

/** Proves and submits one circuit call as the holder of `secretKey`. */
export async function callCircuit(address: string, secretKey: Uint8Array, circuitId: Circuit, args: unknown[]): Promise<void> {
  const p = await connectWallet();
  const id = `sotto-${circuitId}`;
  await p.privateStateProvider.forContract(address as never).set(id, createSottoPrivateState(secretKey));
  await submitCallTx(p, { compiledContract: CompiledSottoContract, contractAddress: address, privateStateId: id, circuitId, args } as never);
}

/** A caller-supplied timestamp a little behind the wall clock, inside the contract's slack. */
export const stampNow = (): bigint => BigInt(Math.floor(Date.now() / 1000) - 30);

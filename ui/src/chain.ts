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
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
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

// Wallet discovery as the Midnight docs describe it: current Lace builds inject
// under a random key in window.midnight (no fixed `mnLace`) with rdns
// io.lace.wallet, so scan every entry and match on the connector API major
// version, preferring Lace.
type Injected = InitialAPI & { rdns?: string; name?: string };
const SUPPORTED_API_MAJOR = 4;
const LOCAL_PROOF_SERVER = 'http://localhost:6300';

const injectedWallets = (): Injected[] => {
  const w = (window as unknown as { midnight?: Record<string, unknown> }).midnight;
  if (!w) return [];
  return Object.values(w).filter((x): x is Injected => !!x && typeof x === 'object' && 'apiVersion' in x);
};

const majorOf = (v: unknown): number => Number(String(v).replace(/^v/, '').split('.')[0]);

const findWallet = (): Injected | undefined => {
  const ok = injectedWallets().filter((x) => majorOf(x.apiVersion) === SUPPORTED_API_MAJOR);
  return ok.find((x) => x.rdns === 'io.lace.wallet') ?? ok[0];
};

export const walletAvailable = (): boolean => findWallet() !== undefined;

async function connect(): Promise<ConnectedAPI> {
  for (let i = 0; i < 30 && !findWallet(); i++) await new Promise((r) => setTimeout(r, 100));
  const initial = findWallet();
  if (!initial) {
    const seen = injectedWallets().map((x) => `${x.name ?? x.rdns ?? 'unnamed wallet'} (connector API ${x.apiVersion})`);
    console.info('[sotto] window.midnight entries:', seen);
    throw new Error(
      seen.length === 0
        ? 'No Midnight wallet is injected into this page. Check that Lace is installed in this browser and allowed on this site, then reload.'
        : `Found ${seen.join(', ')}, but Sotto needs DApp connector API ${SUPPORTED_API_MAJOR}.x. Update Lace and reload.`,
    );
  }
  console.info('[sotto] connecting to', initial.name ?? initial.rdns, 'connector API', initial.apiVersion);
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
    // Lace 2.1.0+ proves through getProvingProvider(); older builds lack it, and
    // the docs say to fall back to the local proof server then.
    proofProvider:
      typeof (api as { getProvingProvider?: unknown }).getProvingProvider === 'function'
        ? await dappConnectorProofProvider(api, zkConfigProvider, ledgerV9.CostModel.initialCostModel())
        : httpClientProofProvider(LOCAL_PROOF_SERVER, zkConfigProvider),
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

export type Progress = (step: string) => void;

/** Proves and submits one circuit call as the holder of `secretKey`. */
export async function callCircuit(
  address: string,
  secretKey: Uint8Array,
  circuitId: Circuit,
  args: unknown[],
  progress: Progress = () => {},
): Promise<void> {
  progress('Connecting to Lace');
  const p = await connectWallet();
  const id = `sotto-${circuitId}`;
  await p.privateStateProvider.forContract(address as never).set(id, createSottoPrivateState(secretKey));
  progress('Lace is generating the zero-knowledge proof and will ask you to approve. This takes about a minute.');
  await submitCallTx(p, { compiledContract: CompiledSottoContract, contractAddress: address, privateStateId: id, circuitId, args } as never);
  progress('Accepted. Reading the updated ledger');
}

/** A caller-supplied timestamp a little behind the wall clock, inside the contract's slack. */
export const stampNow = (): bigint => BigInt(Math.floor(Date.now() / 1000) - 30);

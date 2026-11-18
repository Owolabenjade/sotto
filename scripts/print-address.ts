// SPDX-License-Identifier: Apache-2.0
// Prints the unshielded address of a role's wallet without syncing it, so it
// can be funded ahead of time.  MIDNIGHT_NETWORK=preview npx vite-node scripts/print-address.ts BOB
import pino from 'pino';
import { loadEnv } from 'vite';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { type EnvironmentConfiguration } from '@midnight-ntwrk/testkit-js';
import { MidnightWalletProvider, resolveWallet } from '../src/wallet.js';
import { getConfig } from '../src/config.js';

const network = process.env['MIDNIGHT_NETWORK'] ?? 'preview';
Object.assign(process.env, { ...loadEnv(network, process.cwd(), ''), ...process.env });
const role = process.argv[2] ?? 'BOB';
const config = getConfig();
setNetworkId(config.networkId);
const env: EnvironmentConfiguration = {
  walletNetworkId: config.networkId,
  networkId: config.networkId,
  indexer: config.indexer,
  indexerWS: config.indexerWS,
  node: config.node,
  nodeWS: config.nodeWS,
  faucet: config.faucet,
  proofServer: config.proofServer,
};
const w = await MidnightWalletProvider.build(pino({ level: 'warn' }), env, resolveWallet(network, role).secret);
console.log(`${role} ${String(w.unshieldedKeystore.getBech32Address())}`);
process.exit(0);

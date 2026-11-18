// SPDX-License-Identifier: Apache-2.0
// Officer actions from the command line, for a channel deployed by
// preview-setup.ts. Reads the officer secrets from .demo/<network>.json and
// pays with the ALICE wallet from .env.<network>.
//
//   MIDNIGHT_NETWORK=preview npx vite-node scripts/officer.ts enrol <memberKeyHex>
//   MIDNIGHT_NETWORK=preview npx vite-node scripts/officer.ts cases
//   MIDNIGHT_NETWORK=preview npx vite-node scripts/officer.ts ack <caseIdHex>
import fs from 'node:fs';
import path from 'node:path';
import { WebSocket } from 'ws';
import pino from 'pino';
import { loadEnv } from 'vite';
import { x25519 } from '@noble/curves/ed25519.js';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { submitCallTx } from '@midnight-ntwrk/midnight-js-contracts';
import { type EnvironmentConfiguration } from '@midnight-ntwrk/testkit-js';
import { MidnightWalletProvider, resolveWallet, syncWallet } from '../src/wallet.js';
import { getConfig } from '../src/config.js';
import { buildProviders, ledgerState, type SottoCircuits } from '../src/providers.js';
import { createSottoPrivateState } from '../contract/witnesses.js';
import { CompiledSottoContract, ledger, zkConfigPath } from '../contract/index.js';
import { bytesToHex, hexToBytes, messageKey, open } from '../src/crypto.js';

// @ts-expect-error WebSocket global for the indexer client
globalThis.WebSocket = WebSocket;

const network = process.env['MIDNIGHT_NETWORK'] ?? 'preview';
Object.assign(process.env, { ...loadEnv(network, process.cwd(), ''), ...process.env });
const [cmd, arg] = process.argv.slice(2);
const demo = JSON.parse(fs.readFileSync(path.resolve('.demo', `${network}.json`), 'utf8'));
const address: string = demo.address;
const officerSk = hexToBytes(demo.officer.secretKey);
const boxSecret = hexToBytes(demo.officer.boxSecretKey);
const box = { secretKey: boxSecret, publicKey: x25519.getPublicKey(boxSecret) };
const logger = pino({ level: 'warn', transport: { target: 'pino-pretty' } });
const config = getConfig();
const stampNow = () => BigInt(Math.floor(Date.now() / 1000) - 30);

const main = async () => {
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
  const w = await MidnightWalletProvider.build(logger, env, resolveWallet(network, 'ALICE').secret);
  await w.start();
  await syncWallet(logger, w.wallet, 60 * 60_000);
  const p = buildProviders(w, zkConfigPath, config);
  await p.privateStateProvider.forContract(address).set('OfficerState', createSottoPrivateState(officerSk));
  const call = (circuitId: SottoCircuits, args: unknown[]) =>
    submitCallTx(p, { compiledContract: CompiledSottoContract, contractAddress: address, privateStateId: 'OfficerState', circuitId, args } as never);
  const read = async () => ledger(ledgerState(await p.publicDataProvider.queryContractState(address)));

  if (cmd === 'enrol') {
    if (!arg || !/^[0-9a-f]{64}$/i.test(arg)) throw new Error('Usage: officer.ts enrol <64-hex member key>');
    await call('enrol', [hexToBytes(arg)]);
    console.log(`Enrolled ${arg}. Members now: ${(await read()).enrolled}`);
  } else if (cmd === 'ack') {
    await call('acknowledge', [hexToBytes(arg!), stampNow()]);
    console.log(`Acknowledged ${arg}`);
  } else if (cmd === 'cases') {
    const l = await read();
    for (const [id, c] of l.cases) {
      const idHex = bytesToHex(id);
      console.log(`\nCase ${idHex} status=${c.status} opened=${new Date(Number(c.openedAt) * 1000).toISOString()} messages=${c.messageCount}`);
      for (let seq = 0; seq < Number(c.messageCount); seq++) {
        const k = messageKey(id, seq);
        const who = l.fromReporter.lookup(k) ? 'reporter' : 'officer';
        const text = open(l.messages.lookup(k), box, { contractAddress: address, caseId: id, seq });
        console.log(`  [${seq}] ${who}: ${text ?? '(sealed to the reporter)'}`);
      }
    }
  } else {
    throw new Error('Commands: enrol <memberKey> | cases | ack <caseId>');
  }
  await w.stop();
};

main().then(
  () => process.exit(0),
  (e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  },
);

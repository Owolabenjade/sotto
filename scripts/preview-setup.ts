// SPDX-License-Identifier: Apache-2.0
// Deploys a demo Sotto channel to a remote network and seeds it, so the public
// page has a live contract to read. Fees are paid by two funded wallets from
// .env.<network> (MIDNIGHT_<NET>_ALICE_SEED for the officer, _BOB_SEED for the
// members). Secrets for the demo identities go to .demo/<network>.json
// (gitignored); the public address goes to deployments/<network>.json.
//
//   MIDNIGHT_NETWORK=preview npx vite-node scripts/preview-setup.ts
import fs from 'node:fs';
import path from 'node:path';
import { WebSocket } from 'ws';
import pino from 'pino';
import { loadEnv } from 'vite';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { deployContract, submitCallTx } from '@midnight-ntwrk/midnight-js-contracts';
import { type EnvironmentConfiguration } from '@midnight-ntwrk/testkit-js';
import { MidnightWalletProvider, resolveWallet, syncWallet, waitForNightThenDust } from '../src/wallet.js';
import { getConfig } from '../src/config.js';
import { buildProviders, ledgerState, type SottoCircuits, type SottoProviders } from '../src/providers.js';
import { createSottoPrivateState } from '../contract/witnesses.js';
import { CompiledSottoContract, ledger, zkConfigPath } from '../contract/index.js';
import { bytesToHex, caseId, memberKey, newBoxKeys, newSecretKey, periodOf, reporterBoxKeys, seal } from '../src/crypto.js';

// @ts-expect-error WebSocket global for the indexer client
globalThis.WebSocket = WebSocket;

const network = process.env['MIDNIGHT_NETWORK'] ?? 'preview';
Object.assign(process.env, { ...loadEnv(network, process.cwd(), ''), ...process.env });

const DAY = 24 * 3600;
const PERIOD = BigInt(30 * DAY);
const ACK = BigInt(7 * DAY);
const FEEDBACK = BigInt(90 * DAY);
const SLACK = 900n;
const MEMBERS = 5;

const logger = pino({ level: 'info', transport: { target: 'pino-pretty' } });
const stampNow = () => BigInt(Math.floor(Date.now() / 1000) - 30);
const config = getConfig();

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

const wallet = async (role: string) => {
  const w = await MidnightWalletProvider.build(logger, env, resolveWallet(network, role).secret);
  await w.start();
  await syncWallet(logger, w.wallet, 120 * 60_000);
  await waitForNightThenDust(logger, w.wallet, w.unshieldedKeystore, env, config.faucet, { label: role });
  return w;
};

const main = async () => {
  setNetworkId(config.networkId);
  const officerWallet = await wallet('ALICE');
  const memberWallet = await wallet('BOB');
  const officer = buildProviders(officerWallet, zkConfigPath, config);
  const member = buildProviders(memberWallet, zkConfigPath, config);

  const officerSk = newSecretKey();
  const officerBox = newBoxKeys();
  const memberSks = Array.from({ length: MEMBERS }, () => newSecretKey());
  const org = new TextEncoder().encode('Acme Logistics GmbH'.padEnd(32, '\0'));

  logger.info('Deploying...');
  const deployed = await deployContract(officer, {
    compiledContract: CompiledSottoContract,
    privateStateId: 'OfficerState',
    initialPrivateState: createSottoPrivateState(officerSk),
    args: [org, officerBox.publicKey, PERIOD, ACK, FEEDBACK, SLACK],
  } as never);
  const address = deployed.deployTxData.public.contractAddress;
  logger.info(`Deployed at ${address}`);

  // Save secrets before anything else can fail.
  const demoFile = path.resolve('.demo', `${network}.json`);
  fs.mkdirSync(path.dirname(demoFile), { recursive: true });
  const save = (extra: Record<string, unknown> = {}) =>
    fs.writeFileSync(
      demoFile,
      JSON.stringify(
        {
          network,
          address,
          officer: { secretKey: bytesToHex(officerSk), boxSecretKey: bytesToHex(officerBox.secretKey) },
          members: memberSks.map((sk, i) => ({ index: i, secretKey: bytesToHex(sk), memberKey: bytesToHex(memberKey(sk)) })),
          ...extra,
        },
        null,
        2,
      ),
    );
  save();

  const call = (p: SottoProviders, id: string, circuitId: SottoCircuits, args: unknown[]) =>
    submitCallTx(p, { compiledContract: CompiledSottoContract, contractAddress: address, privateStateId: id, circuitId, args } as never);

  for (const [i, sk] of memberSks.entries()) {
    await call(officer, 'OfficerState', 'enrol', [memberKey(sk)]);
    logger.info(`Enrolled member ${i}`);
  }

  // One sealed demo report from member 3, so the public page has a case.
  const t = stampNow();
  const period = periodOf(Number(t), PERIOD);
  const id = caseId(memberSks[3], period, address);
  await member.privateStateProvider.forContract(address).set('Member3State', createSottoPrivateState(memberSks[3]));
  const body = seal('Demo report: forklift safety checks in warehouse B are being skipped on night shifts.', officerBox.publicKey, {
    contractAddress: address,
    caseId: id,
    seq: 0,
  });
  await call(member, 'Member3State', 'fileReport', [t, period, body, reporterBoxKeys(memberSks[3], id).publicKey]);
  logger.info(`Demo case filed: ${bytesToHex(id)}`);
  save({ demoCase: { member: 3, caseId: bytesToHex(id), period: period.toString() } });

  const state = await officer.publicDataProvider.queryContractState(address);
  const l = ledger(ledgerState(state));
  logger.info(`Ledger: enrolled=${l.enrolled} cases=${l.caseCount}`);

  fs.mkdirSync('deployments', { recursive: true });
  fs.writeFileSync(
    path.join('deployments', `${network}.json`),
    JSON.stringify({ network, contractAddress: address, deployedAt: new Date().toISOString() }, null, 2) + '\n',
  );
  await officerWallet.stop();
  await memberWallet.stop();
};

main().then(
  () => process.exit(0),
  (e) => {
    logger.error(e);
    process.exit(1);
  },
);

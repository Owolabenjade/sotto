// SPDX-License-Identifier: Apache-2.0
// End-to-end on a real network (local devnet by default): real proofs, real
// transactions, ledger read back from the indexer. This is the demo path.
//   npm run env:up && npm run test:local
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { WebSocket } from 'ws';
import pino from 'pino';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { deployContract, submitCallTx } from '@midnight-ntwrk/midnight-js-contracts';
import type { ContractAddress } from '@midnight-ntwrk/midnight-js-protocol/v9/compact-runtime';
import { type EnvironmentConfiguration } from '@midnight-ntwrk/testkit-js';
import { MidnightWalletProvider, resolveWallet, syncWallet, waitForNightThenDust } from '../wallet.js';
import { getConfig } from '../config.js';
import { buildProviders, ledgerState, type SottoCircuits, type SottoProviders } from '../providers.js';
import { createSottoPrivateState } from '../../contract/witnesses.js';
import { CaseStatus, CompiledSottoContract, ledger, zkConfigPath } from '../../contract/index.js';
import {
  caseId as deriveCaseId,
  memberKey,
  messageKey,
  newBoxKeys,
  newSecretKey,
  open,
  periodOf,
  reporterBoxKeys,
  seal,
} from '../crypto.js';

// @ts-expect-error WebSocket global assignment for apollo
globalThis.WebSocket = WebSocket;

const DAY = 24 * 3600;
const PERIOD = BigInt(30 * DAY);
const ACK = BigInt(7 * DAY);
const FEEDBACK = BigInt(90 * DAY);
const SLACK = 900n;

const OFFICER_ID = 'OfficerState';
const MEMBER_IDS = ['Member0State', 'Member1State', 'Member2State'] as const;
const OFFICER_SK = newSecretKey();
const OFFICER_BOX = newBoxKeys();
const MEMBER_SKS = MEMBER_IDS.map(() => newSecretKey());
const ORG = new TextEncoder().encode('acme-gmbh'.padEnd(32, '\0'));

// Timestamps lag the wall clock a little so they are never ahead of block time.
const stampNow = () => BigInt(Math.floor(Date.now() / 1000) - 30);

const logger = pino({ level: process.env['LOG_LEVEL'] ?? 'info', transport: { target: 'pino-pretty' } });
const network = process.env['MIDNIGHT_NETWORK'] ?? 'local';

describe(`Sotto end to end (${network})`, () => {
  // One wallet pays for the officer; a second, unrelated wallet pays for the
  // members, as a sponsor would. Each identity is its own private-state id.
  let officerWallet: MidnightWalletProvider;
  let memberWallet: MidnightWalletProvider;
  let officer: SottoProviders;
  let member: SottoProviders;
  let address: ContractAddress;
  let reportedCase: Uint8Array;

  const config = getConfig();
  const isRemote = network !== 'local';
  const syncTimeoutMs = Number(process.env['MIDNIGHT_SYNC_TIMEOUT_MS'] ?? (isRemote ? 120 * 60_000 : 10 * 60_000));

  const queryLedger = async () => {
    const state = await officer.publicDataProvider.queryContractState(address);
    expect(state).not.toBeNull();
    return ledger(ledgerState(state));
  };

  const call = (p: SottoProviders, privateStateId: string, circuitId: SottoCircuits, args: unknown[]) =>
    submitCallTx(p, { compiledContract: CompiledSottoContract, contractAddress: address, privateStateId, circuitId, args } as never);

  const asMember = async (i: number) => {
    await member.privateStateProvider.forContract(address).set(MEMBER_IDS[i], createSottoPrivateState(MEMBER_SKS[i]));
    return MEMBER_IDS[i];
  };

  const buildWallet = async (role: string) => {
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
    const setup = resolveWallet(network, role);
    const w = await MidnightWalletProvider.build(logger, env, setup.secret);
    await w.start();
    await syncWallet(logger, w.wallet, syncTimeoutMs);
    if (isRemote) await waitForNightThenDust(logger, w.wallet, w.unshieldedKeystore, env, config.faucet, { label: setup.role });
    return w;
  };

  beforeAll(async () => {
    setNetworkId(config.networkId);
    officerWallet = await buildWallet('ALICE');
    memberWallet = await buildWallet('BOB');
    officer = buildProviders(officerWallet, zkConfigPath, config);
    member = buildProviders(memberWallet, zkConfigPath, config);
  });

  afterAll(async () => {
    await officerWallet?.stop();
    await memberWallet?.stop();
  });

  it('deploys a channel for one organisation', async () => {
    const deployed = await deployContract(officer, {
      compiledContract: CompiledSottoContract,
      privateStateId: OFFICER_ID,
      initialPrivateState: createSottoPrivateState(OFFICER_SK),
      args: [ORG, OFFICER_BOX.publicKey, PERIOD, ACK, FEEDBACK, SLACK],
    } as never);
    address = deployed.deployTxData.public.contractAddress;
    logger.info(`Sotto deployed at ${address}`);
    expect(address.length).toBeGreaterThan(0);
  });

  it('enrols three members by key only', async () => {
    for (const sk of MEMBER_SKS) await call(officer, OFFICER_ID, 'enrol', [memberKey(sk)]);
    const l = await queryLedger();
    expect(l.enrolled).toBe(3n);
  });

  it('accepts an anonymous report from a member, sealed to the officer', async () => {
    const t = stampNow();
    const period = periodOf(Number(t), PERIOD);
    const id = deriveCaseId(MEMBER_SKS[1], period, address);
    const body = seal('Q3 safety inspections at plant 2 were signed off without being done.', OFFICER_BOX.publicKey, {
      contractAddress: address,
      caseId: id,
      seq: 0,
    });
    await call(member, await asMember(1), 'fileReport', [t, period, body, reporterBoxKeys(MEMBER_SKS[1], id).publicKey]);
    const l = await queryLedger();
    expect(l.caseCount).toBe(1n);
    expect(l.cases.member(id)).toBe(true);
    reportedCase = id;
    // The officer can read it.
    const blob = l.messages.lookup(messageKey(id, 0));
    expect(open(blob, OFFICER_BOX, { contractAddress: address, caseId: id, seq: 0 })).toMatch(/plant 2/);
  });

  it('rejects a second report from the same member in the same period', async () => {
    const t = stampNow();
    const period = periodOf(Number(t), PERIOD);
    const id = deriveCaseId(MEMBER_SKS[1], period, address);
    const body = seal('again', OFFICER_BOX.publicKey, { contractAddress: address, caseId: id, seq: 0 });
    await expect(
      call(member, await asMember(1), 'fileReport', [t, period, body, reporterBoxKeys(MEMBER_SKS[1], id).publicKey]),
    ).rejects.toThrow();
  });

  it('acknowledges on time and runs a two-way anonymous thread', async () => {
    await call(officer, OFFICER_ID, 'acknowledge', [reportedCase, stampNow()]);
    const question = seal('Which inspector signed?', reporterBoxKeys(MEMBER_SKS[1], reportedCase).publicKey, {
      contractAddress: address,
      caseId: reportedCase,
      seq: 1,
    });
    await call(officer, OFFICER_ID, 'officerMessage', [reportedCase, stampNow(), question]);
    const answer = seal('The night-shift lead, on 14 October.', OFFICER_BOX.publicKey, {
      contractAddress: address,
      caseId: reportedCase,
      seq: 2,
    });
    await call(member, await asMember(1), 'reporterMessage', [reportedCase, stampNow(), answer]);

    const l = await queryLedger();
    expect(l.ackOnTime).toBe(1n);
    const c = l.cases.lookup(reportedCase);
    expect(c.status).toBe(CaseStatus.ACKNOWLEDGED);
    expect(c.messageCount).toBe(3n);
    const box = reporterBoxKeys(MEMBER_SKS[1], reportedCase);
    expect(open(l.messages.lookup(messageKey(reportedCase, 1)), box, { contractAddress: address, caseId: reportedCase, seq: 1 })).toBe(
      'Which inspector signed?',
    );
  });

  it('rejects a revoked member', async () => {
    await call(officer, OFFICER_ID, 'revoke', [memberKey(MEMBER_SKS[2]), 2n]);
    const t = stampNow();
    const period = periodOf(Number(t), PERIOD);
    const id = deriveCaseId(MEMBER_SKS[2], period, address);
    const body = seal('x', OFFICER_BOX.publicKey, { contractAddress: address, caseId: id, seq: 0 });
    await expect(
      call(member, await asMember(2), 'fileReport', [t, period, body, reporterBoxKeys(MEMBER_SKS[2], id).publicKey]),
    ).rejects.toThrow();
    expect((await queryLedger()).revokedCount).toBe(1n);
  });
});

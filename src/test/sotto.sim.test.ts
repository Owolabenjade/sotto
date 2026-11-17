// SPDX-License-Identifier: Apache-2.0
// In-memory tests: the compiled contract runs with compact-runtime, with no
// network and no proofs. Every guard gets a negative test here, plus the
// privacy invariants. `npm run compile:fast && npm run test:sim`.

import { randomBytes } from 'node:crypto';
import { beforeEach, describe, expect, it } from 'vitest';
import { Sim, assertNotInPublicState, expectRejects, findInPublicState } from './sim.js';
import { CaseStatus, Contract, ledger, pureCircuits } from '../../contract/managed/sotto/contract/index.js';
import { createSottoPrivateState, witnesses } from '../../contract/witnesses.js';

const DAY = 24 * 3600;
const PERIOD = 30 * DAY;
const ACK = 7 * DAY;
const FEEDBACK = 90 * DAY;
const SLACK = 900;
// Start of period 1000, so period arithmetic is easy to read.
const P0 = 1000n;
const T0 = Number(P0) * PERIOD + 3600;

const sk = (): Uint8Array => new Uint8Array(randomBytes(32));
const bytes = (s: string): Uint8Array => new TextEncoder().encode(s);
const org = new Uint8Array(32).fill(7);
const officerBox = new Uint8Array(32).fill(9);
const reporterBox = new Uint8Array(32).fill(5);

const OFFICER = sk();
const ALICE = sk();
const BOB = sk();
const CAROL = sk();
const OUTSIDER = sk();

type S = Awaited<ReturnType<typeof deploy>>;

const deploy = () =>
  Sim.deploy({
    contract: new Contract(witnesses),
    ledger,
    privateState: createSottoPrivateState(OFFICER),
    args: [org, officerBox, BigInt(PERIOD), BigInt(ACK), BigInt(FEEDBACK), BigInt(SLACK)],
  });

const memberKey = (s: Uint8Array) => pureCircuits.memberKey(s);
const as = (sim: S, secret: Uint8Array) => {
  sim.privateState = createSottoPrivateState(secret);
  return sim;
};
const file = (sim: S, who: Uint8Array, t = T0, period = P0, body = 'report') =>
  as(sim, who).at(t).call('fileReport', BigInt(t), period, bytes(body), reporterBox);

let sim: S;

beforeEach(async () => {
  sim = await deploy();
  sim.at(T0);
  for (const m of [ALICE, BOB, CAROL]) await as(sim, OFFICER).call('enrol', memberKey(m));
});

describe('deployment and registry', () => {
  it('stores the officer key and configuration, never the officer secret', async () => {
    const fresh = await deploy();
    const l = fresh.ledger();
    expect(l.officerPk).toEqual(pureCircuits.officerKey(OFFICER));
    expect(l.periodSecs).toBe(BigInt(PERIOD));
    expect(l.ackSecs).toBe(BigInt(ACK));
    assertNotInPublicState(l, { officerSecret: OFFICER });
  });

  it('enrols members by key only', () => {
    const l = sim.ledger();
    expect(l.enrolled).toBe(3n);
    expect(l.memberKeys.member(memberKey(ALICE))).toBe(true);
    assertNotInPublicState(l, { alice: ALICE, bob: BOB, carol: CAROL });
  });

  it('rejects enrolment by anyone but the officer', async () => {
    await expectRejects(() => as(sim, ALICE).call('enrol', memberKey(OUTSIDER)), 'Only the officer');
  });

  it('rejects a duplicate enrolment', async () => {
    await expectRejects(() => as(sim, OFFICER).call('enrol', memberKey(ALICE)), 'Already enrolled');
  });

  it('rejects revocation by anyone but the officer, and of a non-member', async () => {
    await expectRejects(() => as(sim, ALICE).call('revoke', memberKey(BOB), 1n), 'Only the officer');
    await expectRejects(() => as(sim, OFFICER).call('revoke', memberKey(OUTSIDER), 0n), 'Not a member');
  });
});

describe('filing a report', () => {
  it('opens a case for a current member, without revealing which one', async () => {
    const { result: caseId, ledger: l } = await file(sim, BOB);
    expect(l.caseCount).toBe(1n);
    expect(l.cases.member(caseId)).toBe(true);
    const c = l.cases.lookup(caseId);
    expect(c.status).toBe(CaseStatus.OPEN);
    expect(c.openedAt).toBe(BigInt(T0));
    expect(c.messageCount).toBe(1n);
    // The case id is the nullifier, not the member key.
    expect(caseId).toEqual(pureCircuits.caseNullifier(BOB, P0, sim.address.length ? caseIdInstance(sim) : new Uint8Array(32)));
    // No member key, no secret anywhere in the case records.
    for (const m of [ALICE, BOB, CAROL]) {
      expect(findInPublicState({ cases: l.cases, messages: l.messages }, memberKey(m))).toBeNull();
    }
    assertNotInPublicState(l, { bob: BOB });
  });

  it('stores the report ciphertext as message 0, from the reporter', async () => {
    const { result: caseId, ledger: l } = await file(sim, ALICE, T0, P0, 'sealed-bytes');
    const k = pureCircuits.messageKey(caseId, 0n);
    expect(l.messages.lookup(k)).toEqual(bytes('sealed-bytes'));
    expect(l.fromReporter.lookup(k)).toBe(true);
    expect(l.messageAt.lookup(k)).toBe(BigInt(T0));
  });

  it('allows one report per member per period', async () => {
    await file(sim, ALICE);
    await expectRejects(() => file(sim, ALICE, T0 + 60), 'Already reported this period');
  });

  it('gives a member an unlinkable case id in the next period', async () => {
    const { result: first } = await file(sim, ALICE);
    const t1 = T0 + PERIOD;
    const { result: second, ledger: l } = await file(sim, ALICE, t1, P0 + 1n);
    expect(second).not.toEqual(first);
    expect(l.caseCount).toBe(2n);
  });

  it('lets different members report in the same period', async () => {
    await file(sim, ALICE);
    await file(sim, BOB);
    expect(sim.ledger().caseCount).toBe(2n);
  });

  it('rejects a non-member', async () => {
    await expectRejects(() => file(sim, OUTSIDER), 'not a current member');
  });

  it('rejects a lying witness that offers another member\'s path', async () => {
    const lying = {
      ...witnesses,
      memberPath: ({ privateState, ledger: l }: any) => [privateState, l.members.findPathForLeaf(memberKey(ALICE))],
    };
    const s = await Sim.deploy({
      contract: new Contract(lying as typeof witnesses),
      ledger,
      privateState: createSottoPrivateState(OFFICER),
      args: [org, officerBox, BigInt(PERIOD), BigInt(ACK), BigInt(FEEDBACK), BigInt(SLACK)],
    });
    s.at(T0);
    await as(s as unknown as S, OFFICER).call('enrol', memberKey(ALICE));
    await expectRejects(() => file(s as unknown as S, OUTSIDER), 'Path is not for this member');
  });

  it('rejects a revoked member, even with a path from before revocation', async () => {
    const stale = sim.ledger().members.findPathForLeaf(memberKey(BOB));
    await as(sim, OFFICER).call('revoke', memberKey(BOB), 1n);
    expect(sim.ledger().revokedCount).toBe(1n);
    // Honest witness: no path exists any more.
    await expectRejects(() => file(sim, BOB), 'not a current member');
    // Lying witness replaying the old path: the root check fails.
    const replay = { ...witnesses, memberPath: ({ privateState }: any) => [privateState, stale] };
    const s2 = sim as unknown as { contract: Contract<any> };
    (s2 as any).contract = new Contract(replay as typeof witnesses);
    await expectRejects(() => file(sim, BOB), 'Not a current member');
    // Other members are unaffected.
    (s2 as any).contract = new Contract(witnesses);
    await file(sim, ALICE);
  });

  it('rejects a period that does not contain the block time', async () => {
    await expectRejects(() => file(sim, ALICE, T0, P0 + 1n), 'Period has not started');
    await expectRejects(() => file(sim, ALICE, T0, P0 - 1n), 'Period has ended');
  });

  it('rejects a timestamp in the future or older than the slack', async () => {
    await expectRejects(() => as(sim, ALICE).at(T0).call('fileReport', BigInt(T0 + 10), P0, bytes('x'), reporterBox), 'in the future');
    await expectRejects(() => as(sim, ALICE).at(T0 + SLACK).call('fileReport', BigInt(T0), P0, bytes('x'), reporterBox), 'too old');
  });
});

describe('the response clock', () => {
  it('counts an acknowledgement within the window as on time', async () => {
    const { result: id } = await file(sim, ALICE);
    const t = T0 + ACK - 60;
    const { ledger: l } = await as(sim, OFFICER).at(t).call('acknowledge', id, BigInt(t));
    expect(l.ackOnTime).toBe(1n);
    expect(l.ackLate).toBe(0n);
    const c = l.cases.lookup(id);
    expect(c.status).toBe(CaseStatus.ACKNOWLEDGED);
    expect(c.ackAt).toBe(BigInt(t));
  });

  it('counts a late acknowledgement as late', async () => {
    const { result: id } = await file(sim, ALICE);
    const t = T0 + ACK + 60;
    const { ledger: l } = await as(sim, OFFICER).at(t).call('acknowledge', id, BigInt(t));
    expect(l.ackOnTime).toBe(0n);
    expect(l.ackLate).toBe(1n);
  });

  it('rejects acknowledgement by a non-officer, twice, or of a missing case', async () => {
    const { result: id } = await file(sim, ALICE);
    await expectRejects(() => as(sim, ALICE).call('acknowledge', id, BigInt(T0)), 'Only the officer');
    await as(sim, OFFICER).call('acknowledge', id, BigInt(T0));
    await expectRejects(() => as(sim, OFFICER).call('acknowledge', id, BigInt(T0)), 'Case is not open');
    await expectRejects(() => as(sim, OFFICER).call('acknowledge', new Uint8Array(32), BigInt(T0)), 'No such case');
  });

  it('closes on time or late against the feedback window', async () => {
    const { result: a } = await file(sim, ALICE);
    const { result: b } = await file(sim, BOB);
    await as(sim, OFFICER).call('acknowledge', a, BigInt(T0));
    await as(sim, OFFICER).call('acknowledge', b, BigInt(T0));
    const onTime = T0 + FEEDBACK - 60;
    await as(sim, OFFICER).at(onTime).call('closeCase', a, BigInt(onTime));
    const late = T0 + FEEDBACK + 60;
    const { ledger: l } = await as(sim, OFFICER).at(late).call('closeCase', b, BigInt(late));
    expect(l.closedOnTime).toBe(1n);
    expect(l.closedLate).toBe(1n);
    expect(l.cases.lookup(a).status).toBe(CaseStatus.CLOSED);
  });

  it('rejects closing an unacknowledged case', async () => {
    const { result: id } = await file(sim, ALICE);
    await expectRejects(() => as(sim, OFFICER).call('closeCase', id, BigInt(T0)), 'Acknowledge the case first');
  });
});

describe('the anonymous thread', () => {
  it('lets the officer and the reporter exchange messages', async () => {
    const { result: id } = await file(sim, CAROL);
    await as(sim, OFFICER).call('acknowledge', id, BigInt(T0));
    await as(sim, OFFICER).call('officerMessage', id, BigInt(T0), bytes('question'));
    const { ledger: l } = await as(sim, CAROL).call('reporterMessage', id, BigInt(T0), bytes('answer'));
    const c = l.cases.lookup(id);
    expect(c.messageCount).toBe(3n);
    expect(l.fromReporter.lookup(pureCircuits.messageKey(id, 1n))).toBe(false);
    expect(l.fromReporter.lookup(pureCircuits.messageKey(id, 2n))).toBe(true);
    expect(l.messages.lookup(pureCircuits.messageKey(id, 2n))).toEqual(bytes('answer'));
    assertNotInPublicState(l, { carol: CAROL, officer: OFFICER });
    expect(findInPublicState({ cases: l.cases, messages: l.messages }, memberKey(CAROL))).toBeNull();
  });

  it('rejects an officer message before acknowledgement, or from a non-officer', async () => {
    const { result: id } = await file(sim, CAROL);
    await expectRejects(() => as(sim, OFFICER).call('officerMessage', id, BigInt(T0), bytes('q')), 'Acknowledge the case first');
    await as(sim, OFFICER).call('acknowledge', id, BigInt(T0));
    await expectRejects(() => as(sim, ALICE).call('officerMessage', id, BigInt(T0), bytes('q')), 'Only the officer');
  });

  it('rejects a reply from anyone but the reporter', async () => {
    const { result: id } = await file(sim, CAROL);
    await expectRejects(() => as(sim, ALICE).call('reporterMessage', id, BigInt(T0), bytes('x')), 'Not the reporter');
    await expectRejects(() => as(sim, OFFICER).call('reporterMessage', id, BigInt(T0), bytes('x')), 'Not the reporter');
  });

  it('lets a reporter answer after being revoked, but not after closure', async () => {
    const { result: id } = await file(sim, BOB);
    await as(sim, OFFICER).call('revoke', memberKey(BOB), 1n);
    await as(sim, BOB).call('reporterMessage', id, BigInt(T0), bytes('still here'));
    await as(sim, OFFICER).call('acknowledge', id, BigInt(T0));
    await as(sim, OFFICER).call('closeCase', id, BigInt(T0));
    await expectRejects(() => as(sim, BOB).call('reporterMessage', id, BigInt(T0), bytes('x')), 'Case is closed');
  });
});

// The case id binds kernel.self(); the sim's contract address is its instance.
function caseIdInstance(s: S): Uint8Array {
  return Buffer.from(s.address, 'hex').subarray(-32);
}

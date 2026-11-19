// SPDX-License-Identifier: Apache-2.0
// Reads the channel's public ledger from the indexer with a plain fetch: no
// wallet, no keys. Pattern from midnight-examples (leaderboard useLeaderboard).
import { ContractState, fromHex } from '@midnight-ntwrk/midnight-js-protocol/v9/compact-runtime';
import { CaseStatus, ledger, type Ledger } from '../../contract/browser';
import { bytesToHex, messageKey } from '../../src/crypto';

import { takeStateHex } from './prefetch';

export const NETWORK = import.meta.env.VITE_NETWORK_ID ?? 'preview';
export { INDEXER_URL } from './prefetch';
export const DEFAULT_CONTRACT = import.meta.env.VITE_CONTRACT_ADDRESS ?? '';
export const ORG_NAME = import.meta.env.VITE_ORG_NAME ?? '';

export async function fetchLedger(address: string): Promise<Ledger> {
  const hex = await takeStateHex(address);
  return ledger(ContractState.deserialize(fromHex(hex)).data);
}

export type Message = { seq: number; fromReporter: boolean; at: number; blob: Uint8Array };

export type CaseView = {
  id: Uint8Array;
  idHex: string;
  openedAt: number;
  ackAt: number | null;
  closedAt: number | null;
  status: 'open' | 'acknowledged' | 'closed';
  messageCount: number;
  ackDue: number;
  feedbackDue: number;
  reporterBox: Uint8Array;
};

export type ChannelView = {
  orgName: string;
  enrolled: number;
  revoked: number;
  cases: CaseView[];
  ackSecs: number;
  feedbackSecs: number;
  periodSecs: number;
  officerBox: Uint8Array;
  ackOnTime: number;
  ackLate: number;
  closedOnTime: number;
  closedLate: number;
  /** Open cases whose acknowledgement deadline has passed (computed now). */
  overdue: number;
  awaitingAck: number;
};

const statusOf = (s: CaseStatus): CaseView['status'] =>
  s === CaseStatus.OPEN ? 'open' : s === CaseStatus.ACKNOWLEDGED ? 'acknowledged' : 'closed';

const orgFromBytes = (b: Uint8Array): string => new TextDecoder().decode(b).replace(/\0+$/, '');

export function viewOf(l: Ledger, nowSecs = Math.floor(Date.now() / 1000)): ChannelView {
  const ackSecs = Number(l.ackSecs);
  const feedbackSecs = Number(l.feedbackSecs);
  const cases: CaseView[] = [];
  for (const [id, c] of l.cases) {
    const openedAt = Number(c.openedAt);
    const ackAt = c.ackAt === 0n ? null : Number(c.ackAt);
    // Art. 9(1)(f): three months from the acknowledgement, or from day 7 if it was late or missing.
    const clockStart = ackAt !== null && ackAt <= openedAt + ackSecs ? ackAt : openedAt + ackSecs;
    cases.push({
      id,
      idHex: bytesToHex(id),
      openedAt,
      ackAt,
      closedAt: c.closedAt === 0n ? null : Number(c.closedAt),
      status: statusOf(c.status),
      messageCount: Number(c.messageCount),
      ackDue: openedAt + ackSecs,
      feedbackDue: clockStart + feedbackSecs,
      reporterBox: c.reporterBox,
    });
  }
  cases.sort((a, b) => b.openedAt - a.openedAt);
  const open = cases.filter((c) => c.status === 'open');
  return {
    orgName: ORG_NAME || orgFromBytes(l.orgId),
    enrolled: Number(l.enrolled) - Number(l.revokedCount),
    revoked: Number(l.revokedCount),
    cases,
    ackSecs,
    feedbackSecs,
    periodSecs: Number(l.periodSecs),
    officerBox: l.officerBox,
    ackOnTime: Number(l.ackOnTime),
    ackLate: Number(l.ackLate),
    closedOnTime: Number(l.closedOnTime),
    closedLate: Number(l.closedLate),
    overdue: open.filter((c) => c.ackDue < nowSecs).length,
    awaitingAck: open.length,
  };
}

export function threadOf(l: Ledger, c: CaseView): Message[] {
  const out: Message[] = [];
  for (let seq = 0; seq < c.messageCount; seq++) {
    const k = messageKey(c.id, seq);
    if (!l.messages.member(k)) continue;
    out.push({
      seq,
      fromReporter: l.fromReporter.lookup(k),
      at: Number(l.messageAt.lookup(k)),
      blob: l.messages.lookup(k),
    });
  }
  return out;
}

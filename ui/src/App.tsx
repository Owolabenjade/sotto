// SPDX-License-Identifier: Apache-2.0
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { type Ledger } from '../../contract/browser';
import {
  bytesToHex,
  caseId as deriveCaseId,
  hexToBytes,
  open,
  reporterBoxKeys,
  seal,
  periodOf,
} from '../../src/crypto';
import { x25519 } from '@noble/curves/ed25519.js';
import { DEFAULT_CONTRACT, NETWORK, fetchLedger, threadOf, viewOf, type CaseView, type ChannelView } from './ledger';
import { callCircuit, stampNow } from './chain';
import {
  createMember,
  download,
  forgetMember,
  forgetOfficer,
  importMember,
  loadMember,
  loadOfficer,
  saveOfficer,
  type MemberCredential,
  type OfficerKeys,
} from './keys';

type Route = 'clock' | 'report' | 'officer';

const routeFromHash = (): Route => {
  const h = window.location.hash.replace(/^#\/?/, '');
  return h === 'report' || h === 'officer' ? h : 'clock';
};

const contractFromUrl = (): string => {
  const c = new URLSearchParams(window.location.search).get('c');
  return c && /^[0-9a-f]{64,}$/i.test(c) ? c : DEFAULT_CONTRACT;
};

// ---- formatting ----

const DAY = 86400;
const fmtDate = (s: number) =>
  new Date(s * 1000).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const fmtSpan = (secs: number) => {
  const a = Math.abs(secs);
  if (a < 3600) return `${Math.max(1, Math.round(a / 60))} min`;
  if (a < 2 * DAY) return `${Math.round(a / 3600)} h`;
  return `${Math.round(a / DAY)} days`;
};
const shortId = (hex: string) => `${hex.slice(0, 6)}…${hex.slice(-4)}`;
const nowSecs = () => Math.floor(Date.now() / 1000);

// ---- data hook ----

function useChannel(address: string) {
  const [l, setL] = useState<Ledger | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [readAt, setReadAt] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    try {
      setL(await fetchLedger(address));
      setReadAt(nowSecs());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    void refresh();
    const t = setInterval(refresh, 20_000);
    return () => clearInterval(t);
  }, [refresh]);

  const view = useMemo(() => (l ? viewOf(l) : null), [l, readAt]);
  return { l, view, error, readAt, loading, refresh };
}

// ---- shared bits ----

function Button(props: {
  children: ReactNode;
  onClick: () => unknown | Promise<unknown>;
  busyLabel?: string;
  kind?: 'primary' | 'quiet';
  disabled?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  return (
    <span className="action">
      <button
        className={props.kind === 'quiet' ? 'btn quiet' : 'btn'}
        disabled={busy || props.disabled}
        onClick={async () => {
          setBusy(true);
          setErr(null);
          try {
            await props.onClick();
          } catch (e) {
            setErr(e instanceof Error ? e.message : String(e));
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? props.busyLabel ?? 'Working…' : props.children}
      </button>
      {err && (
        <span className="error" role="alert">
          {err}
        </span>
      )}
    </span>
  );
}

const StatusTag = ({ c }: { c: CaseView }) => {
  if (c.status === 'closed') return <span className="tag">Closed</span>;
  if (c.status === 'acknowledged') return <span className="tag ok">Acknowledged</span>;
  return c.ackDue < nowSecs() ? <span className="tag late">Overdue</span> : <span className="tag">Awaiting acknowledgement</span>;
};

// ---- public response clock ----

function Clock({ view, address, readAt }: { view: ChannelView; address: string; readAt: number | null }) {
  const acked = view.ackOnTime + view.ackLate;
  const closed = view.closedOnTime + view.closedLate;
  return (
    <section>
      <h1 className="display">
        {view.cases.length === 0
          ? `${view.orgName} has a verified whistleblowing channel. No reports yet.`
          : view.ackLate + view.overdue === 0
            ? `${view.orgName} has acknowledged every report on time.`
            : `${view.orgName} has ${view.ackLate + view.overdue} ${view.ackLate + view.overdue === 1 ? 'report' : 'reports'} acknowledged late or still overdue.`}
      </h1>
      <p className="lede">
        Every number on this page is read from the public Midnight ledger. Nobody, including the company, can see who filed a report or
        what it says. Anyone can see whether it was answered in time.
      </p>

      <dl className="figures">
        <div>
          <dt>Reports received</dt>
          <dd>{view.cases.length}</dd>
        </div>
        <div>
          <dt>Acknowledged on time</dt>
          <dd>
            {view.ackOnTime}
            {acked > 0 && <small> of {acked}</small>}
          </dd>
        </div>
        <div>
          <dt>Overdue now</dt>
          <dd className={view.overdue > 0 ? 'late' : undefined}>{view.overdue}</dd>
        </div>
        <div>
          <dt>Closed with feedback within {fmtSpan(view.feedbackSecs)}</dt>
          <dd>
            {view.closedOnTime}
            {closed > 0 && <small> of {closed}</small>}
          </dd>
        </div>
      </dl>

      <h2>Cases</h2>
      {view.cases.length === 0 ? (
        <p className="empty">No reports yet. When an employee files one, it appears here within a minute, with its deadline.</p>
      ) : (
        <table className="cases">
          <thead>
            <tr>
              <th>Case</th>
              <th>Opened</th>
              <th>Acknowledged</th>
              <th>Status</th>
              <th className="num">Messages</th>
            </tr>
          </thead>
          <tbody>
            {view.cases.map((c) => (
              <tr key={c.idHex}>
                <td className="mono">{shortId(c.idHex)}</td>
                <td>{fmtDate(c.openedAt)}</td>
                <td>
                  {c.ackAt
                    ? `after ${fmtSpan(c.ackAt - c.openedAt)}`
                    : c.ackDue >= nowSecs()
                      ? `due in ${fmtSpan(c.ackDue - nowSecs())}`
                      : `${fmtSpan(nowSecs() - c.ackDue)} late`}
                </td>
                <td>
                  <StatusTag c={c} />
                </td>
                <td className="num">{c.messageCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p className="provenance">
        {view.enrolled} current members registered by key{view.revoked > 0 ? `, ${view.revoked} revoked` : ''}. Read from Midnight {NETWORK}
        {readAt ? ` at ${new Date(readAt * 1000).toLocaleTimeString()}` : ''}. Contract <span className="mono">{shortId(address)}</span>.
        Times are proved to within 15 minutes of block time.
      </p>
    </section>
  );
}

// ---- member: report ----

const SENT = 'sotto.sent.v1';
const sentKey = (caseHex: string, seq: number) => `${caseHex}:${seq}`;
const loadSent = (): Record<string, string> => {
  try {
    return JSON.parse(localStorage.getItem(SENT) ?? '{}');
  } catch {
    return {};
  }
};
const remember = (caseHex: string, seq: number, text: string) => {
  try {
    localStorage.setItem(SENT, JSON.stringify({ ...loadSent(), [sentKey(caseHex, seq)]: text }));
  } catch {
    /* ignore */
  }
};

function Report({ l, view, address, refresh }: { l: Ledger; view: ChannelView; address: string; refresh: () => Promise<void> }) {
  const [cred, setCred] = useState<MemberCredential | null>(loadMember);
  const [text, setText] = useState('');
  const [importing, setImporting] = useState('');

  if (!cred) {
    return (
      <section className="narrow">
        <h1>Report as a verified insider</h1>
        <p className="lede">
          Your credential is a secret made in this browser. Only its fingerprint goes to your compliance officer, who registers it. Reports
          you file prove you are a current member without saying which one, and the officer can't work out who you are from the
          fingerprint.
        </p>
        <Button onClick={() => setCred(createMember())}>Create my credential</Button>
        <details className="aside">
          <summary>I already have a credential</summary>
          <label>
            Credential (64 hex characters)
            <input value={importing} onChange={(e) => setImporting(e.target.value)} spellCheck={false} />
          </label>
          <Button kind="quiet" onClick={() => setCred(importMember(importing))}>
            Use this credential
          </Button>
        </details>
      </section>
    );
  }

  const enrolled = l.memberKeys.member(hexToBytes(cred.memberKeyHex));
  const t = nowSecs();
  const period = periodOf(t, BigInt(view.periodSecs));
  const myCases = [0n, 1n, 2n, 3n, 4n, 5n]
    .map((back) => deriveCaseId(cred.secretKey, period - back, address))
    .map((id) => view.cases.find((c) => c.idHex === bytesToHex(id)))
    .filter((c): c is CaseView => !!c);
  const filedThisPeriod = myCases.some((c) => c.openedAt >= Number(period) * view.periodSecs);

  const file = async () => {
    const ts = stampNow();
    const p = periodOf(Number(ts), BigInt(view.periodSecs));
    const id = deriveCaseId(cred.secretKey, p, address);
    const blob = seal(text, view.officerBox, { contractAddress: address, caseId: id, seq: 0 });
    await callCircuit(address, cred.secretKey, 'fileReport', [ts, p, blob, reporterBoxKeys(cred.secretKey, id).publicKey]);
    remember(bytesToHex(id), 0, text);
    setText('');
    await refresh();
  };

  return (
    <section className="narrow">
      <h1>Your reports</h1>
      <div className="credential">
        <div>
          <span className="label">Member key to give your officer</span>
          <span className="mono wrap">{cred.memberKeyHex}</span>
        </div>
        <p>{enrolled ? 'Registered as a current member of this channel.' : 'Not registered yet. Send the member key above to your compliance officer.'}</p>
        <span className="row">
          <Button kind="quiet" onClick={() => download('sotto-credential.txt', bytesToHex(cred.secretKey))}>
            Back up credential
          </Button>
          <Button
            kind="quiet"
            onClick={() => {
              forgetMember();
              setCred(null);
            }}
          >
            Remove from this browser
          </Button>
        </span>
      </div>

      {enrolled && !filedThisPeriod && (
        <div className="compose">
          <label htmlFor="report">What happened</label>
          <textarea
            id="report"
            rows={7}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Describe what you saw, when and where. Leave out details that only you could know if they would identify you."
          />
          <p className="hint">
            Sealed in this browser to the officer's key. The ledger stores only ciphertext, padded so its length gives nothing away. One report
            per {fmtSpan(view.periodSecs)}.
          </p>
          <Button onClick={file} busyLabel="Proving membership and filing…" disabled={text.trim().length < 10}>
            Seal and file report
          </Button>
        </div>
      )}
      {enrolled && filedThisPeriod && <p className="hint">You have filed this period's report. You can still answer the officer below.</p>}

      {myCases.map((c) => (
        <CaseThread key={c.idHex} l={l} c={c} address={address} as={{ kind: 'reporter', secretKey: cred.secretKey }} refresh={refresh} />
      ))}
    </section>
  );
}

// ---- thread, shared by reporter and officer ----

type Viewer = { kind: 'reporter'; secretKey: Uint8Array } | { kind: 'officer'; keys: OfficerKeys };

function CaseThread({ l, c, address, as, refresh }: { l: Ledger; c: CaseView; address: string; as: Viewer; refresh: () => Promise<void> }) {
  const [reply, setReply] = useState('');
  const sent = loadSent();
  const box =
    as.kind === 'reporter'
      ? reporterBoxKeys(as.secretKey, c.id)
      : { secretKey: as.keys.boxSecretKey, publicKey: x25519.getPublicKey(as.keys.boxSecretKey) };
  const messages = threadOf(l, c).map((m) => {
    const ctx = { contractAddress: address, caseId: c.id, seq: m.seq };
    const mine = as.kind === 'reporter' ? m.fromReporter : !m.fromReporter;
    const text = open(m.blob, box, ctx) ?? (mine ? sent[sentKey(c.idHex, m.seq)] : undefined);
    return { ...m, text, mine };
  });

  const send = async () => {
    const ts = stampNow();
    const seq = c.messageCount;
    const ctx = { contractAddress: address, caseId: c.id, seq };
    if (as.kind === 'reporter') {
      await callCircuit(address, as.secretKey, 'reporterMessage', [c.id, ts, seal(reply, l.officerBox, ctx)]);
    } else {
      await callCircuit(address, as.keys.secretKey, 'officerMessage', [c.id, ts, seal(reply, c.reporterBox, ctx)]);
    }
    remember(c.idHex, seq, reply);
    setReply('');
    await refresh();
  };

  const canReply = as.kind === 'reporter' ? c.status !== 'closed' : c.status === 'acknowledged';

  return (
    <article className="case">
      <header>
        <span className="mono">Case {shortId(c.idHex)}</span>
        <StatusTag c={c} />
        <span className="muted">opened {fmtDate(c.openedAt)}</span>
      </header>
      <ol className="thread">
        {messages.map((m) => (
          <li key={m.seq} className={m.fromReporter ? 'from-reporter' : 'from-officer'}>
            <span className="who">
              {m.fromReporter ? (as.kind === 'reporter' ? 'You' : 'Reporter') : as.kind === 'officer' ? 'You' : 'Compliance officer'}
              <span className="muted"> · {fmtDate(m.at)}</span>
            </span>
            <p>{m.text ?? <span className="muted">Sealed. Only the recipient can read this.</span>}</p>
          </li>
        ))}
      </ol>
      {as.kind === 'officer' && (
        <div className="row">
          {c.status === 'open' && (
            <Button onClick={async () => { await callCircuit(address, as.keys.secretKey, 'acknowledge', [c.id, stampNow()]); await refresh(); }} busyLabel="Acknowledging…">
              Acknowledge receipt
            </Button>
          )}
          {c.status === 'acknowledged' && (
            <Button kind="quiet" onClick={async () => { await callCircuit(address, as.keys.secretKey, 'closeCase', [c.id, stampNow()]); await refresh(); }} busyLabel="Closing…">
              Close with feedback given
            </Button>
          )}
        </div>
      )}
      {canReply && (
        <div className="compose">
          <textarea rows={3} value={reply} onChange={(e) => setReply(e.target.value)} placeholder={as.kind === 'officer' ? 'Ask a follow-up question' : 'Answer the officer'} />
          <Button onClick={send} busyLabel="Sealing and sending…" disabled={reply.trim().length === 0}>
            {as.kind === 'officer' ? 'Send to reporter' : 'Send to officer'}
          </Button>
        </div>
      )}
    </article>
  );
}

// ---- officer console ----

/** A leaf's index from its Merkle path (the goes_left bits, leaf to root). */
const leafIndex = (path: { path: { goes_left: boolean }[] }): bigint =>
  path.path.reduce((acc, step, i) => (step.goes_left ? acc : acc | (1n << BigInt(i))), 0n);

function Officer({ l, view, address, refresh }: { l: Ledger; view: ChannelView; address: string; refresh: () => Promise<void> }) {
  const [keys, setKeys] = useState<OfficerKeys | null>(loadOfficer);
  const [keyFile, setKeyFile] = useState('');
  const [newMember, setNewMember] = useState('');

  if (!keys) {
    return (
      <section className="narrow">
        <h1>Officer console</h1>
        <p className="lede">Load the officer key file for this channel. It stays in this browser.</p>
        <textarea rows={6} value={keyFile} onChange={(e) => setKeyFile(e.target.value)} placeholder='{ "secretKey": "…", "boxSecretKey": "…" }' spellCheck={false} />
        <Button onClick={() => setKeys(saveOfficer(keyFile))}>Load officer keys</Button>
      </section>
    );
  }

  const members = Array.from(l.memberKeys as unknown as Iterable<Uint8Array>);

  return (
    <section>
      <h1>Officer console</h1>
      <div className="split">
        <div>
          <h2>Cases</h2>
          {view.cases.length === 0 && <p className="empty">No reports yet.</p>}
          {view.cases.map((c) => (
            <CaseThread key={c.idHex} l={l} c={c} address={address} as={{ kind: 'officer', keys }} refresh={refresh} />
          ))}
        </div>
        <aside>
          <h2>Members</h2>
          <label>
            Member key from an employee
            <input value={newMember} onChange={(e) => setNewMember(e.target.value)} spellCheck={false} placeholder="64 hex characters" />
          </label>
          <Button
            onClick={async () => {
              await callCircuit(address, keys.secretKey, 'enrol', [hexToBytes(newMember.trim())]);
              setNewMember('');
              await refresh();
            }}
            busyLabel="Registering…"
            disabled={!/^[0-9a-f]{64}$/i.test(newMember.trim())}
          >
            Register member
          </Button>
          <ul className="members">
            {members.map((k) => {
              const path = l.members.findPathForLeaf(k);
              return (
                <li key={bytesToHex(k)}>
                  <span className="mono">{shortId(bytesToHex(k))}</span>
                  {path && (
                    <Button
                      kind="quiet"
                      busyLabel="Revoking…"
                      onClick={async () => {
                        await callCircuit(address, keys.secretKey, 'revoke', [k, leafIndex(path as never)]);
                        await refresh();
                      }}
                    >
                      Revoke
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
          <Button
            kind="quiet"
            onClick={() => {
              forgetOfficer();
              setKeys(null);
            }}
          >
            Unload officer keys
          </Button>
        </aside>
      </div>
    </section>
  );
}

// ---- shell ----

export default function App() {
  const [route, setRoute] = useState<Route>(routeFromHash);
  const [address] = useState(contractFromUrl);
  const { l, view, error, readAt, loading, refresh } = useChannel(address);

  useEffect(() => {
    const on = () => setRoute(routeFromHash());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);

  const nav = (r: Route, label: string) => (
    <a href={`#/${r}`} aria-current={route === r ? 'page' : undefined}>
      {label}
    </a>
  );

  return (
    <>
      <header className="top">
        <a className="wordmark" href="#/clock">
          Sotto
        </a>
        <nav>
          {nav('clock', 'Response clock')}
          {nav('report', 'Report')}
          {nav('officer', 'Officer')}
        </nav>
      </header>
      <main>
        {!address && <p className="error">No channel address. Add ?c=&lt;contract address&gt; to the URL.</p>}
        {address && error && !l && (
          <div className="notice">
            <p className="error">Couldn't read the channel: {error}</p>
            <Button kind="quiet" onClick={refresh}>
              Try again
            </Button>
          </div>
        )}
        {address && !l && !error && <p className="muted">{loading ? 'Reading the ledger from the Midnight indexer…' : ''}</p>}
        {l && view && route === 'clock' && <Clock view={view} address={address} readAt={readAt} />}
        {l && view && route === 'report' && <Report l={l} view={view} address={address} refresh={refresh} />}
        {l && view && route === 'officer' && <Officer l={l} view={view} address={address} refresh={refresh} />}
      </main>
      <footer>
        <p>
          Sotto is open source (Apache-2.0) and runs on <a href="https://midnight.network">Midnight</a>. Filing and answering need the Lace
          wallet on the {NETWORK} network; reading this page needs nothing.
        </p>
      </footer>
    </>
  );
}

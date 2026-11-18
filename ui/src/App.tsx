// SPDX-License-Identifier: Apache-2.0
import { useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { x25519 } from '@noble/curves/ed25519.js';
import { type Ledger } from '../../contract/browser';
import { bytesToHex, caseId as deriveCaseId, hexToBytes, open, periodOf, reporterBoxKeys, seal } from '../../src/crypto';
import { DEFAULT_CONTRACT, NETWORK, fetchLedger, threadOf, viewOf, type CaseView, type ChannelView } from './ledger';
import { callCircuit, stampNow, type Progress } from './chain';
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
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

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

// ---- shared controls ----

/**
 * A button for an operation that may take a minute. While it runs, the button
 * names the operation and a live region below it reports each step with the
 * elapsed time; on failure it says what failed.
 */
function Action(props: {
  children: ReactNode;
  run: (progress: Progress) => unknown | Promise<unknown>;
  busyLabel?: string;
  kind?: 'primary' | 'quiet';
  disabled?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const started = useRef(0);

  useEffect(() => {
    if (!busy) return;
    const t = setInterval(() => setElapsed(Math.round((Date.now() - started.current) / 1000)), 1000);
    return () => clearInterval(t);
  }, [busy]);

  return (
    <span className="action">
      <button
        type="button"
        className={props.kind === 'quiet' ? 'btn quiet' : 'btn'}
        disabled={busy || props.disabled}
        aria-busy={busy}
        onClick={async () => {
          started.current = Date.now();
          setElapsed(0);
          setBusy(true);
          setErr(null);
          setStep(null);
          try {
            await props.run((s) => setStep(s));
            setStep(null);
          } catch (e) {
            setErr(e instanceof Error ? e.message : String(e));
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? props.busyLabel ?? 'Working…' : props.children}
      </button>
      <span className="status-line" aria-live="polite">
        {busy && step && (
          <>
            {step} <span className="muted">· {elapsed}s</span>
          </>
        )}
      </span>
      {err && (
        <span className="error" role="alert">
          {err}
        </span>
      )}
    </span>
  );
}

function Field(props: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
  mono?: boolean;
}) {
  const id = useId();
  const common = {
    id,
    value: props.value,
    placeholder: props.placeholder,
    spellCheck: !props.mono,
    className: props.mono ? 'mono-input' : undefined,
    'aria-describedby': props.hint ? `${id}-hint` : undefined,
  };
  return (
    <div className="field">
      <label htmlFor={id}>{props.label}</label>
      {props.rows ? (
        <textarea rows={props.rows} {...common} onChange={(e) => props.onChange(e.target.value)} />
      ) : (
        <input {...common} onChange={(e) => props.onChange(e.target.value)} />
      )}
      {props.hint && (
        <p className="hint" id={`${id}-hint`}>
          {props.hint}
        </p>
      )}
    </div>
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
  const behind = view.ackLate + view.overdue;
  const headline =
    view.cases.length === 0
      ? `${view.orgName} runs a verified whistleblowing channel. No reports yet.`
      : behind === 0
        ? `${view.orgName} has acknowledged every report on time.`
        : `${view.orgName} has ${plural(behind, 'report', 'reports')} acknowledged late or still overdue.`;

  return (
    <section>
      <h1 className="display">{headline}</h1>
      <p className="lede">
        Every figure here is read from the public Midnight ledger. Nobody, including {view.orgName}, can see who filed a report or what it
        says. Anyone can see whether it was answered in time.
      </p>

      <dl className="figures">
        <div>
          <dt>Reports received</dt>
          <dd>{view.cases.length}</dd>
        </div>
        <div>
          <dt>Acknowledged within {fmtSpan(view.ackSecs)}</dt>
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
          <dt>Feedback within {fmtSpan(view.feedbackSecs)} of acknowledgement</dt>
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
        <div className="table-wrap">
          <table className="cases">
            <caption className="sr-only">Cases with their response times</caption>
            <thead>
              <tr>
                <th scope="col">Case</th>
                <th scope="col">Opened</th>
                <th scope="col">Acknowledgement</th>
                <th scope="col">Status</th>
                <th scope="col" className="num">
                  Messages
                </th>
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
        </div>
      )}

      <h2>What the ledger shows, and what it never shows</h2>
      <div className="ledger-split">
        <div>
          <h3>Public</h3>
          <ul>
            <li>When each report arrived, proved to within 15 minutes of block time</li>
            <li>When it was acknowledged and closed, and whether that was on time</li>
            <li>That the reporter was a current member at the time</li>
            <li>Fingerprints of registered members, and how many were revoked</li>
          </ul>
        </div>
        <div>
          <h3>Never public</h3>
          <ul>
            <li>Which member filed a report</li>
            <li>What any report or reply says: it is sealed to its recipient</li>
            <li>A member's secret, which never leaves their browser</li>
            <li>Whether two reports in different 30-day periods came from the same person</li>
          </ul>
        </div>
      </div>

      <p className="provenance">
        {plural(view.enrolled, 'current member', 'current members')} registered
        {view.revoked > 0 ? `, ${view.revoked} revoked` : ''}. Read from Midnight {NETWORK}
        {readAt ? ` at ${new Date(readAt * 1000).toLocaleTimeString()}` : ''}, contract <span className="mono">{shortId(address)}</span>.
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
    /* private mode: the sent copy lives for this page only */
  }
};

function Report({ l, view, address, refresh }: { l: Ledger; view: ChannelView; address: string; refresh: () => Promise<void> }) {
  const [cred, setCred] = useState<MemberCredential | null>(loadMember);
  const [text, setText] = useState('');
  const [importing, setImporting] = useState('');
  const [importErr, setImportErr] = useState<string | null>(null);

  if (!cred) {
    return (
      <section className="narrow">
        <h1>Report as a verified insider</h1>
        <ol className="steps">
          <li>Create a credential. It is a secret made in this browser and never sent anywhere.</li>
          <li>Give your compliance officer its fingerprint, the member key. They register it once.</li>
          <li>File reports. Each one proves you are a current member without saying which one.</li>
        </ol>
        <p className="hint">
          The officer can't work out who you are from the member key, and can't tell which reports are yours. Back up the credential: without it
          you can't read replies.
        </p>
        <Action run={() => setCred(createMember())}>Create my credential</Action>
        <details className="aside">
          <summary>I already have a credential</summary>
          <Field label="Credential" hint="64 hex characters, from your backup file." value={importing} onChange={setImporting} mono />
          <button
            type="button"
            className="btn quiet"
            onClick={() => {
              try {
                setCred(importMember(importing));
              } catch (e) {
                setImportErr(e instanceof Error ? e.message : String(e));
              }
            }}
          >
            Use this credential
          </button>
          {importErr && (
            <p className="error" role="alert">
              {importErr}
            </p>
          )}
        </details>
      </section>
    );
  }

  const enrolled = l.memberKeys.member(hexToBytes(cred.memberKeyHex));
  const period = periodOf(nowSecs(), BigInt(view.periodSecs));
  const myCases = [0n, 1n, 2n, 3n, 4n, 5n]
    .map((back) => bytesToHex(deriveCaseId(cred.secretKey, period - back, address)))
    .map((hex) => view.cases.find((c) => c.idHex === hex))
    .filter((c): c is CaseView => !!c);
  const filedThisPeriod = myCases.some((c) => c.openedAt >= Number(period) * view.periodSecs);

  const file = async (progress: Progress) => {
    progress('Sealing your report in this browser');
    const ts = stampNow();
    const p = periodOf(Number(ts), BigInt(view.periodSecs));
    const id = deriveCaseId(cred.secretKey, p, address);
    const blob = seal(text, view.officerBox, { contractAddress: address, caseId: id, seq: 0 });
    await callCircuit(address, cred.secretKey, 'fileReport', [ts, p, blob, reporterBoxKeys(cred.secretKey, id).publicKey], progress);
    remember(bytesToHex(id), 0, text);
    setText('');
    await refresh();
  };

  return (
    <section className="narrow">
      <h1>Your reports</h1>
      <div className="credential">
        <p className="label">Your member key, for your compliance officer</p>
        <p className="mono wrap">{cred.memberKeyHex}</p>
        <p className={enrolled ? 'ok-text' : 'hint'}>
          {enrolled ? 'Registered as a current member of this channel.' : 'Not registered yet. Send the member key above to your compliance officer.'}
        </p>
        <span className="row">
          <button type="button" className="btn quiet" onClick={() => navigator.clipboard?.writeText(cred.memberKeyHex)}>
            Copy member key
          </button>
          <button type="button" className="btn quiet" onClick={() => download('sotto-credential.txt', bytesToHex(cred.secretKey))}>
            Back up credential
          </button>
          <button
            type="button"
            className="btn quiet"
            onClick={() => {
              forgetMember();
              setCred(null);
            }}
          >
            Remove from this browser
          </button>
        </span>
      </div>

      {enrolled && !filedThisPeriod && (
        <div className="compose">
          <Field
            label="What happened"
            rows={7}
            value={text}
            onChange={setText}
            placeholder="What you saw, when and where."
            hint={`Sealed in this browser to the officer's key. The ledger stores only ciphertext, padded so its length gives nothing away. Leave out details only you could know. One report per ${fmtSpan(view.periodSecs)}.`}
          />
          <Action run={file} busyLabel="Filing…" disabled={text.trim().length < 10}>
            Seal and file report
          </Action>
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
  const officer = as.kind === 'officer';
  const box = officer
    ? { secretKey: as.keys.boxSecretKey, publicKey: x25519.getPublicKey(as.keys.boxSecretKey) }
    : reporterBoxKeys(as.secretKey, c.id);
  const messages = threadOf(l, c).map((m) => {
    const ctx = { contractAddress: address, caseId: c.id, seq: m.seq };
    const mine = officer ? !m.fromReporter : m.fromReporter;
    const text = open(m.blob, box, ctx) ?? (mine ? sent[sentKey(c.idHex, m.seq)] : undefined);
    return { ...m, text };
  });

  const send = async (progress: Progress) => {
    progress('Sealing your message in this browser');
    const seq = c.messageCount;
    const ctx = { contractAddress: address, caseId: c.id, seq };
    if (as.kind === 'reporter') {
      await callCircuit(address, as.secretKey, 'reporterMessage', [c.id, stampNow(), seal(reply, l.officerBox, ctx)], progress);
    } else {
      await callCircuit(address, as.keys.secretKey, 'officerMessage', [c.id, stampNow(), seal(reply, c.reporterBox, ctx)], progress);
    }
    remember(c.idHex, seq, reply);
    setReply('');
    await refresh();
  };

  const canReply = officer ? c.status === 'acknowledged' : c.status !== 'closed';
  const deadline = c.ackAt
    ? `Acknowledged after ${fmtSpan(c.ackAt - c.openedAt)}`
    : c.ackDue >= nowSecs()
      ? `Acknowledgement due in ${fmtSpan(c.ackDue - nowSecs())}`
      : `Acknowledgement ${fmtSpan(nowSecs() - c.ackDue)} late`;

  return (
    <article className="case" aria-label={`Case ${shortId(c.idHex)}`}>
      <header>
        <span className="mono">Case {shortId(c.idHex)}</span>
        <StatusTag c={c} />
        <span className="muted">
          Opened {fmtDate(c.openedAt)} · {deadline}
        </span>
      </header>
      <ol className="thread">
        {messages.map((m) => (
          <li key={m.seq} className={m.fromReporter ? 'from-reporter' : 'from-officer'}>
            <span className="who">
              {m.fromReporter ? (officer ? 'Reporter' : 'You') : officer ? 'You' : 'Compliance officer'}
              <span className="muted"> · {fmtDate(m.at)}</span>
            </span>
            <p>{m.text ?? <span className="muted">Sealed to the other side. Only they can read it.</span>}</p>
          </li>
        ))}
      </ol>
      {officer && (
        <div className="row">
          {c.status === 'open' && (
            <Action
              busyLabel="Acknowledging…"
              run={async (progress) => {
                await callCircuit(address, as.keys.secretKey, 'acknowledge', [c.id, stampNow()], progress);
                await refresh();
              }}
            >
              Acknowledge receipt
            </Action>
          )}
          {c.status === 'acknowledged' && (
            <Action
              kind="quiet"
              busyLabel="Closing…"
              run={async (progress) => {
                await callCircuit(address, as.keys.secretKey, 'closeCase', [c.id, stampNow()], progress);
                await refresh();
              }}
            >
              Close: feedback given
            </Action>
          )}
        </div>
      )}
      {canReply && (
        <div className="compose">
          <Field
            label={officer ? 'Follow-up question to the reporter' : 'Your answer to the officer'}
            rows={3}
            value={reply}
            onChange={setReply}
          />
          <Action run={send} busyLabel="Sending…" disabled={reply.trim().length === 0}>
            {officer ? 'Seal and send to reporter' : 'Seal and send to officer'}
          </Action>
        </div>
      )}
      {officer && c.status === 'open' && <p className="hint">Acknowledge the case before you can write to the reporter.</p>}
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
  const [keyErr, setKeyErr] = useState<string | null>(null);
  const [newMember, setNewMember] = useState('');

  if (!keys) {
    return (
      <section className="narrow">
        <h1>Officer console</h1>
        <p className="lede">Load the officer key file for this channel. The keys stay in this browser.</p>
        <Field label="Officer key file" hint='JSON with "secretKey" and "boxSecretKey".' rows={6} value={keyFile} onChange={setKeyFile} mono />
        <button
          type="button"
          className="btn"
          onClick={() => {
            try {
              setKeys(saveOfficer(keyFile));
            } catch (e) {
              setKeyErr(e instanceof Error ? e.message : String(e));
            }
          }}
        >
          Load officer keys
        </button>
        {keyErr && (
          <p className="error" role="alert">
            Couldn't read the key file: {keyErr}
          </p>
        )}
      </section>
    );
  }

  const members = Array.from(l.memberKeys as unknown as Iterable<Uint8Array>);
  const waiting = view.cases.filter((c) => c.status === 'open');
  const valid = /^[0-9a-f]{64}$/i.test(newMember.trim());

  return (
    <section>
      <h1>Officer console</h1>
      <p className="lede">
        {waiting.length === 0
          ? 'Nothing waiting for acknowledgement.'
          : `${plural(waiting.length, 'case is', 'cases are')} waiting for acknowledgement. The oldest is due ${
              waiting.at(-1)!.ackDue >= nowSecs() ? `in ${fmtSpan(waiting.at(-1)!.ackDue - nowSecs())}` : 'now'
            }.`}
      </p>
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
          <Field label="Member key from an employee" hint="64 hex characters." value={newMember} onChange={setNewMember} mono />
          <Action
            busyLabel="Registering…"
            disabled={!valid}
            run={async (progress) => {
              await callCircuit(address, keys.secretKey, 'enrol', [hexToBytes(newMember.trim())], progress);
              setNewMember('');
              await refresh();
            }}
          >
            Register member
          </Action>
          <ul className="members" aria-label="Registered members">
            {members.map((k) => {
              const path = l.members.findPathForLeaf(k);
              return (
                <li key={bytesToHex(k)}>
                  <span className="mono">{shortId(bytesToHex(k))}</span>
                  {path && (
                    <Action
                      kind="quiet"
                      busyLabel="Revoking…"
                      run={async (progress) => {
                        await callCircuit(address, keys.secretKey, 'revoke', [k, leafIndex(path as never)], progress);
                        await refresh();
                      }}
                    >
                      Revoke
                    </Action>
                  )}
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            className="btn quiet"
            onClick={() => {
              forgetOfficer();
              setKeys(null);
            }}
          >
            Unload officer keys
          </button>
        </aside>
      </div>
    </section>
  );
}

// ---- shell ----

export default function App() {
  const [route, setRoute] = useState<Route>(routeFromHash);
  const [address] = useState(contractFromUrl);
  const { l, view, error, loading, readAt, refresh } = useChannel(address);

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
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className="top">
        <a className="wordmark" href="#/clock">
          Sotto
        </a>
        <nav aria-label="Sections">
          {nav('clock', 'Response clock')}
          {nav('report', 'Report')}
          {nav('officer', 'Officer')}
        </nav>
      </header>
      <main id="main">
        {!address && <p className="error">No channel address. Add ?c=&lt;contract address&gt; to the URL.</p>}
        {address && error && !l && (
          <div className="notice">
            <p className="error" role="alert">
              Couldn't read the channel from the Midnight indexer: {error}
            </p>
            <Action kind="quiet" run={refresh}>
              Try again
            </Action>
          </div>
        )}
        {address && !l && !error && (
          <p className="muted" aria-live="polite">
            {loading ? 'Reading the channel from the Midnight indexer…' : ''}
          </p>
        )}
        {l && view && route === 'clock' && <Clock view={view} address={address} readAt={readAt} />}
        {l && view && route === 'report' && <Report l={l} view={view} address={address} refresh={refresh} />}
        {l && view && route === 'officer' && <Officer l={l} view={view} address={address} refresh={refresh} />}
      </main>
      <footer>
        <p>
          Sotto is open source (<a href="https://github.com/Owolabenjade/sotto">Apache-2.0</a>) and runs on{' '}
          <a href="https://midnight.network">Midnight</a>. Reading this page needs nothing. Filing and answering need the Lace wallet on the{' '}
          {NETWORK} network.
        </p>
      </footer>
    </>
  );
}

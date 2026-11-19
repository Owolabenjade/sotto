// SPDX-License-Identifier: Apache-2.0
// Sotto UI. Visual world: a nixie-tube laboratory counter. On the public
// counter the world owns the page; on the Report and Officer screens it lends
// type, palette, density and one move (numerals that cross-fade when a value
// changes).
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
import { IconCheck, IconChevron, IconCopy, IconDownload, IconLock, IconSend } from './icons';
import { Instrument, type Channel } from './tubes';
import { DARK_COUNTER, FileSwitch, LiveClock, Station, WarmupDesk, routeFromHash, type Route } from './warmup';

const DEMO_ORG = (import.meta.env.VITE_DEMO_ORG ?? '1') === '1';

const contractFromUrl = (): string => {
  const c = new URLSearchParams(window.location.search).get('c');
  return c && /^[0-9a-f]{64,}$/i.test(c) ? c : DEFAULT_CONTRACT;
};

// ---- formatting ----

const DAY = 86400;
const nowSecs = () => Math.floor(Date.now() / 1000);
const fmtDay = (s: number) => new Date(s * 1000).toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
const fmtTime = (s: number) => new Date(s * 1000).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
const fmtWhen = (s: number) => `${fmtDay(s)} ${fmtTime(s)}`;
const fmtSpan = (secs: number) => {
  const a = Math.abs(secs);
  if (a < 3600) return `${Math.max(1, Math.round(a / 60))} min`;
  if (a < 2 * DAY) return `${Math.round(a / 3600)} h`;
  return `${Math.round(a / DAY)} d`;
};
const fmtSpanLong = (secs: number) => fmtSpan(secs).replace(/ d$/, ' days').replace(/ h$/, ' hours');
const shortId = (hex: string) => `${hex.slice(0, 6)}…${hex.slice(-4)}`;
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

// ---- data ----

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


// ---- controls ----

/** A button for an operation that may take a minute, with step-by-step progress. */
function Action(props: {
  children: ReactNode;
  run: (progress: Progress) => unknown | Promise<unknown>;
  busyLabel?: string;
  kind?: 'primary' | 'quiet';
  disabled?: boolean;
  icon?: ReactNode;
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
        {busy ? <span className="spinner" aria-hidden="true" /> : props.icon}
        <span>{busy ? props.busyLabel ?? 'Working…' : props.children}</span>
      </button>
      <span className="status-line" aria-live="polite">
        {busy && step && (
          <>
            {step} <span className="elapsed">{elapsed}s</span>
          </>
        )}
      </span>
      {err && (
        <span className="error" role="alert">
          {recovery(err)}
        </span>
      )}
    </span>
  );
}

/** The failure in plain words plus what to do next; the raw message stays for support. */
function recovery(err: string): string {
  const next = /lace|wallet|connector|authori/i.test(err)
    ? 'Open Lace, check it is on the Preview network and unlocked, then try again.'
    : /proof|6300|prove/i.test(err)
      ? 'Check that Docker Desktop is running the proof server, then try again.'
      : /dust|fee|balance|insufficient/i.test(err)
        ? 'Your Lace wallet needs tNIGHT and DUST for the fee: fund it from the Preview faucet, wait for DUST, then try again.'
        : 'Wait a minute and try again.';
  return `That didn't go through. ${next} (Details: ${err})`;
}

/** A quick action with visible confirmation: the button flips to its done state for two seconds. */
function DoneButton(props: { label: string; doneLabel: string; announce: string; icon: ReactNode; onClick: () => unknown | Promise<unknown> }) {
  const [done, setDone] = useState(false);
  const [failed, setFailed] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  return (
    <span className="action">
      <button
        type="button"
        className={`btn quiet${done ? ' done' : ''}`}
        onClick={async () => {
          try {
            await props.onClick();
            setFailed(false);
            setDone(true);
            window.clearTimeout(timer.current);
            timer.current = window.setTimeout(() => setDone(false), 2000);
          } catch {
            setFailed(true);
          }
        }}
      >
        <span className="flip-face" key={done ? 'done' : 'idle'}>
          {done ? <IconCheck /> : props.icon}
          <span>{done ? props.doneLabel : props.label}</span>
        </span>
      </button>
      <span className="sr-only" aria-live="polite">
        {done ? props.announce : ''}
      </span>
      {failed && (
        <span className="error" role="alert">
          Your browser blocked this. Select the key and copy it by hand.
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

type Board = 'ontime' | 'due' | 'delayed' | 'closed';

const boardState = (c: CaseView): Board => {
  if (c.status === 'closed') return 'closed';
  if (c.ackAt !== null) return c.ackAt <= c.ackDue ? 'ontime' : 'delayed';
  return c.ackDue < nowSecs() ? 'delayed' : 'due';
};

const STATE_LABEL: Record<Board, string> = { ontime: 'On time', due: 'Waiting', delayed: 'Delayed', closed: 'Closed' };

const Status = ({ c }: { c: CaseView }) => {
  const s = boardState(c);
  return (
    <span className={`status ${s}`}>
      <span className="lamp" aria-hidden="true" />
      {STATE_LABEL[s]}
    </span>
  );
};

// ---- public board ----

function Clock({ view, address, readAt }: { view: ChannelView | null; address: string; readAt: number | null }) {
  // One tree for warm-up and loaded state: the instrument stays mounted, so the
  // first ledger read lights the tubes with the cross-fade instead of a swap.
  if (!view) {
    return (
      <section className="board-page">
        <div className="hero">
          <div className="hero-copy">
            <h1>Warming up the counter.</h1>
            <p className="detail" aria-live="polite">
              Reading this channel from the public Midnight ledger. The tubes light as soon as it answers.
            </p>
          </div>
          <FileSwitch />
        </div>
        <Instrument channels={DARK_COUNTER} label="Response counter, warming up" busy />
      </section>
    );
  }

  const acked = view.ackOnTime + view.ackLate;
  const behind = view.ackLate + view.overdue;
  const waiting = view.cases.filter((c) => c.status === 'open' && c.ackDue >= nowSecs());
  const nextDue = waiting.length > 0 ? Math.min(...waiting.map((c) => c.ackDue)) : null;
  const daysToNext = nextDue !== null ? Math.max(0, Math.ceil((nextDue - nowSecs()) / DAY)) : null;

  const [headline, detail] =
    view.cases.length === 0
      ? ['Channel open. No reports yet.', 'When an employee files a report, the counter starts its 7-day acknowledgement clock within a minute.']
      : behind > 0
        ? [`${plural(behind, 'report', 'reports')} late.`, `${view.overdue} overdue now, ${view.ackLate} acknowledged after the ${fmtSpanLong(view.ackSecs)} deadline.`]
        : nextDue !== null
          ? ['No late reports.', `${plural(waiting.length, 'report is', 'reports are')} waiting for acknowledgement. The next is due in ${fmtSpanLong(nextDue - nowSecs())}.`]
          : ['Every report answered on time.', `${plural(view.cases.length, 'report', 'reports')}, all acknowledged within ${fmtSpanLong(view.ackSecs)}.`];

  const channels: Channel[] = [
    { id: 'reports', label: 'Reports received', short: 'Reports', value: view.cases.length, places: 2, spoken: `Reports received: ${view.cases.length}` },
    {
      id: 'ontime',
      label: 'Acknowledged on time',
      short: 'On time',
      readoutShort: acked > 0 ? `of ${acked}` : `${fmtSpan(view.ackSecs)} window`,
      readout: `${acked > 0 ? `of ${acked} · ` : ''}within ${fmtSpanLong(view.ackSecs)}`,
      value: view.ackOnTime,
      places: 2,
      spoken: `Acknowledged within ${fmtSpanLong(view.ackSecs)}: ${view.ackOnTime}${acked > 0 ? ` of ${acked}` : ''}`,
    },
    {
      id: 'overdue',
      label: 'Overdue now',
      short: 'Overdue',
      value: view.overdue,
      places: 1,
      spoken: `Overdue now: ${view.overdue}`,
      tone: view.overdue > 0 ? 'late' : undefined,
    },
    {
      id: 'days',
      label: daysToNext === null ? 'No deadline running' : 'Days to next deadline',
      short: daysToNext === null ? 'None due' : 'Days left',
      value: daysToNext,
      places: 1,
      spoken: daysToNext === null ? 'No acknowledgement deadline running' : `Days to the next acknowledgement deadline: ${daysToNext}`,
    },
  ];

  return (
    <section className="board-page">
      <div className="hero">
        <div className="hero-copy">
          <h1>{headline}</h1>
          <p className="detail">{detail}</p>
        </div>
        <FileSwitch org={view.orgName} />
      </div>

      <Instrument channels={channels} label="Response counter" />

      <p className="lede after-instrument">
        Every number on this counter is read from the public Midnight ledger. The ledger never shows who filed a report or what it says: only the
        compliance officer can read a report, and nobody, {view.orgName} included, can see who wrote it. Anyone can see whether it was answered in
        time.
      </p>

      <section className="log" aria-labelledby="cases-title">
        <h2 id="cases-title" className="engraved">
          Cases on this channel
        </h2>
        {view.cases.length === 0 ? (
          <p className="empty">No reports yet.</p>
        ) : (
          <table className="cases">
            <caption className="sr-only">Every report on this channel, with its acknowledgement and feedback deadlines</caption>
            <thead>
              <tr>
                <th scope="col">Case</th>
                <th scope="col">Received</th>
                <th scope="col">Acknowledgement</th>
                <th scope="col">Feedback</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {view.cases.map((c) => {
                const late = c.ackAt !== null ? c.ackAt > c.ackDue : nowSecs() > c.ackDue;
                return (
                  <tr key={c.idHex}>
                    <td className="mono case-id" data-label="Case">
                      {shortId(c.idHex)}
                    </td>
                    <td data-label="Received">{fmtWhen(c.openedAt)}</td>
                    <td data-label="Acknowledgement" className={late ? 'late-text' : undefined}>
                      {c.ackAt
                        ? `after ${fmtSpanLong(c.ackAt - c.openedAt)}${late ? `, ${fmtSpanLong(c.ackAt - c.ackDue)} late` : ''}`
                        : late
                          ? `${fmtSpanLong(nowSecs() - c.ackDue)} overdue`
                          : `due ${fmtWhen(c.ackDue)}`}
                    </td>
                    <td data-label="Feedback" className="muted">
                      {c.closedAt ? `given ${fmtDay(c.closedAt)}` : c.ackAt ? `due ${fmtDay(c.feedbackDue)}` : 'starts at acknowledgement'}
                    </td>
                    <td data-label="Status">
                      <Status c={c} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      <div className="readouts">
        <section aria-labelledby="pub">
          <h2 id="pub" className="engraved">
            On the counter, for anyone
          </h2>
          <ul>
            <li>When each report arrived, proved to within 15 minutes of block time</li>
            <li>When it was acknowledged and closed, and whether that was on time</li>
            <li>That the reporter was a current member at the time</li>
            <li>Fingerprints of registered members, and how many were revoked</li>
          </ul>
        </section>
        <section aria-labelledby="sealed">
          <h2 id="sealed" className="engraved">
            Sealed, for nobody else
          </h2>
          <ul>
            <li>Which member filed a report</li>
            <li>What any report or reply says</li>
            <li>A member’s secret, which never leaves their browser</li>
            <li>Whether two reports in different 30-day periods came from the same person</li>
          </ul>
          <p className="planned">
            <span className="planned-tag">Planned</span> The organisation pays each fee (I-012). Today the fee comes from the reporter’s own Lace
            wallet, which can link that wallet’s reports to each other.
          </p>
        </section>
      </div>

      <p className="provenance">
        {plural(view.enrolled, 'current member', 'current members')}
        {view.revoked > 0 ? `, ${view.revoked} revoked` : ''}. Read from Midnight {NETWORK}
        {readAt ? ` at ${new Date(readAt * 1000).toLocaleTimeString()}` : ''}, contract <span className="mono">{shortId(address)}</span>. The counter
        refreshes every 20 seconds.{DEMO_ORG ? ` ${view.orgName} is a demo organisation.` : ''}
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

/** Warms the browser cache with the proving keys a member's circuits need. */
const prefetched = new Set<string>();
function prefetchKeys(circuits: string[]) {
  for (const c of circuits) {
    for (const path of [`keys/${c}.prover`, `keys/${c}.verifier`, `zkir/${c}.bzkir`]) {
      if (prefetched.has(path)) continue;
      prefetched.add(path);
      void fetch(`${window.location.origin}/${path}`)
        .then((r) => r.arrayBuffer())
        .catch(() => prefetched.delete(path));
    }
  }
}

const LaceNote = () => (
  <p className="lace-note">
    <IconLock />
    <span>
      When Lace asks you to approve, it shows the transaction’s public part: the case number, the times and your text as scrambled ciphertext.
      That is exactly what the board will show anyone. Your credential and your words are not in it.
      <span className="planned">
        <span className="planned-tag">Planned</span> The organisation pays the fee (I-012). Today your own Lace wallet pays it, which can link
        your reports to that wallet. A fresh wallet used only for Sotto keeps that link away from the rest of your activity.
      </span>
    </span>
  </p>
);

/** What a member's actions put on the public ledger, set beside the first step (Product Principle 1). */
const ExposureReadout = () => (
  <div className="readouts stacked">
    <section aria-labelledby="r-pub">
      <h2 id="r-pub" className="engraved">
        Public, for anyone
      </h2>
      <ul>
        <li>Your member key, once the officer registers it</li>
        <li>When a report arrived and when it was answered</li>
      </ul>
    </section>
    <section aria-labelledby="r-sealed">
      <h2 id="r-sealed" className="engraved">
        Sealed, for nobody else
      </h2>
      <ul>
        <li>Your credential: it never leaves this browser</li>
        <li>Which reports are yours</li>
        <li>What you write: only the compliance officer can read it</li>
      </ul>
    </section>
  </div>
);

/** The Report screen before a credential exists. Needs no ledger data, so it renders at once. */
function ReportIntro({ onCred }: { onCred: (c: MemberCredential) => void }) {
  const [importing, setImporting] = useState('');
  const [importErr, setImportErr] = useState<string | null>(null);
  const setCred = onCred;
    return (
      <section className="work">
        <h1>Report as a verified insider</h1>
        <div className="work-grid">
        <div className="plate desk-plate">
        <ol className="steps">
          <li>
            <strong>Create a credential.</strong> A secret made in this browser. It never leaves it.
          </li>
          <li>
            <strong>Give your compliance officer the member key.</strong> It is a fingerprint of the credential. They register it once.
          </li>
          <li>
            <strong>File reports.</strong> Each one proves you are a current member without saying which one.
          </li>
        </ol>
        <p className="hint">The officer can't work out who you are from the member key, and can't tell which reports are yours.</p>
        <Action run={() => setCred(createMember())} icon={<IconLock />}>
          Create my credential
        </Action>
        <details className="aside">
          <summary>
            <IconChevron />
            I already have a credential (restore from my backup file)
          </summary>
          <Field
            label="Credential"
            hint="Open your sotto-credential.txt backup file, copy the 64 characters inside and paste them here."
            value={importing}
            onChange={setImporting}
            mono
          />
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
              {importErr}. Check that you pasted all 64 characters from the backup file.
            </p>
          )}
        </details>
        </div>
        <ExposureReadout />
        </div>
      </section>
    );
}

function Report({
  l,
  view,
  address,
  refresh,
  onRemoved,
}: {
  l: Ledger;
  view: ChannelView;
  address: string;
  refresh: () => Promise<void>;
  onRemoved: () => void;
}) {
  const [cred, setCred] = useState<MemberCredential | null>(loadMember);
  const [text, setText] = useState('');
  const [confirmRemove, setConfirmRemove] = useState(false);

  useEffect(() => {
    if (cred) prefetchKeys(['fileReport', 'reporterMessage']);
  }, [cred]);

  if (!cred) {
    return <ReportIntro onCred={setCred} />;
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
    <section className="work">
      <h1>Your reports</h1>
      <div className="work-grid">
        <div>
          <div className={`credential${enrolled ? ' ok' : ''}`}>
            <p className="label">Your member key</p>
            <p className="key mono">{cred.memberKeyHex}</p>
            <p className="state">
              {enrolled ? 'Registered: you can file reports on this channel.' : 'Not registered yet. Send this member key to your compliance officer.'}
            </p>
            <div className="row">
              <DoneButton
                label="Copy member key"
                doneLabel="Copied"
                announce="Member key copied to the clipboard"
                icon={<IconCopy />}
                onClick={() => navigator.clipboard.writeText(cred.memberKeyHex)}
              />
              <DoneButton
                label="Back up credential"
                doneLabel="Saved"
                announce="Credential backup file downloaded"
                icon={<IconDownload />}
                onClick={() => download('sotto-credential.txt', bytesToHex(cred.secretKey))}
              />
              {!confirmRemove && (
                <button type="button" className="btn quiet subtle" onClick={() => setConfirmRemove(true)}>
                  Remove from this browser
                </button>
              )}
            </div>
            {confirmRemove && (
              <div className="confirm" role="alertdialog" aria-labelledby="confirm-title">
                <p id="confirm-title">
                  <strong>Remove your credential from this browser?</strong> Without it you can't read the officer's replies or answer them.
                  You can bring it back only from your backup file.
                </p>
                <div className="row">
                  <button
                    type="button"
                    className="btn danger"
                    onClick={() => {
                      forgetMember();
                      setConfirmRemove(false);
                      setCred(null);
                      onRemoved();
                    }}
                  >
                    Yes, remove it
                  </button>
                  <button type="button" className="btn quiet" onClick={() => setConfirmRemove(false)} autoFocus>
                    Keep it
                  </button>
                </div>
              </div>
            )}
          </div>

          {enrolled && !filedThisPeriod && (
            <div className="compose">
              <Field
                label="What happened"
                rows={7}
                value={text}
                onChange={setText}
                placeholder="What you saw, when and where."
                hint={`Sealed in this browser so only the compliance officer can read it. Leave out details only you could know. One report per ${fmtSpanLong(view.periodSecs)}.`}
              />
              <LaceNote />
              <Action run={file} busyLabel="Filing…" disabled={text.trim().length < 10} icon={<IconSend />}>
                Seal and file report
              </Action>
            </div>
          )}
          {enrolled && filedThisPeriod && (
            <p className="hint">You have filed this period’s report. Your case is on the right; you can still answer the officer there.</p>
          )}
        </div>
        <div>
          <h2 className="work-sub">Your cases</h2>
          {myCases.length === 0 && <p className="empty">No reports from this credential yet.</p>}
          {myCases.map((c) => (
            <CaseThread key={c.idHex} l={l} c={c} address={address} as={{ kind: 'reporter', secretKey: cred.secretKey }} refresh={refresh} />
          ))}
        </div>
      </div>
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
    ? `Acknowledged after ${fmtSpanLong(c.ackAt - c.openedAt)}`
    : c.ackDue >= nowSecs()
      ? `Acknowledgement due in ${fmtSpanLong(c.ackDue - nowSecs())}`
      : `Acknowledgement ${fmtSpanLong(nowSecs() - c.ackDue)} late`;

  return (
    <article className="case" aria-label={`Case ${shortId(c.idHex)}`}>
      <header className="case-head">
        <span className="mono case-no">{shortId(c.idHex)}</span>
        <Status c={c} />
        <span className="muted">
          Opened {fmtWhen(c.openedAt)} · {deadline}
        </span>
      </header>
      <ol className="thread">
        {messages.map((m) => (
          <li key={m.seq} className={m.fromReporter ? 'from-reporter' : 'from-officer'}>
            <span className="who">
              {m.fromReporter ? (officer ? 'Reporter' : 'You') : officer ? 'You' : 'Compliance officer'}
              <span className="muted"> · {fmtWhen(m.at)}</span>
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
          <Field label={officer ? 'Follow-up question to the reporter' : 'Your answer to the officer'} rows={3} value={reply} onChange={setReply} />
          {!officer && <LaceNote />}
          <Action run={send} busyLabel="Sending…" disabled={reply.trim().length === 0} icon={<IconSend />}>
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
      <section className="work">
        <h1>Officer desk</h1>
        <div className="work-grid">
          <div className="plate desk-plate">
            <p className="lede spaced">Load the officer key file for this channel. The keys stay in this browser.</p>
            <Field label="Officer key file" hint='JSON with "secretKey" and "boxSecretKey".' rows={6} value={keyFile} onChange={setKeyFile} mono />
            <button
              type="button"
              className="switch"
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
                Couldn't read the key file: {keyErr}. Paste the whole JSON file, including the braces.
              </p>
            )}
          </div>
          <div className="readouts stacked">
            <section aria-labelledby="o-desk">
              <h2 id="o-desk" className="engraved">
                At this desk
              </h2>
              <ul>
                <li>Register employees by member key, and revoke leavers</li>
                <li>Acknowledge each report within 7 days</li>
                <li>Ask follow-up questions; give feedback within 3 months</li>
              </ul>
            </section>
            <section aria-labelledby="o-never">
              <h2 id="o-never" className="engraved">
                Never at this desk
              </h2>
              <ul>
                <li>Who filed a report</li>
                <li>Any employee's credential</li>
              </ul>
            </section>
          </div>
        </div>
      </section>
    );
  }

  const members = Array.from(l.memberKeys as unknown as Iterable<Uint8Array>);
  const waiting = view.cases.filter((c) => c.status === 'open');
  const valid = /^[0-9a-f]{64}$/i.test(newMember.trim());
  const oldestDue = waiting.length > 0 ? Math.min(...waiting.map((c) => c.ackDue)) : null;
  const daysToOldest = oldestDue !== null ? Math.max(0, Math.ceil((oldestDue - nowSecs()) / DAY)) : null;
  const desk: Channel[] = [
    { id: 'waiting', label: 'Waiting', value: waiting.length, places: 1, spoken: `Waiting for acknowledgement: ${waiting.length}` },
    {
      id: 'overdue',
      label: 'Overdue',
      value: view.overdue,
      places: 1,
      spoken: `Overdue: ${view.overdue}`,
      tone: view.overdue > 0 ? 'late' : undefined,
    },
    {
      id: 'days',
      label: daysToOldest === null ? 'No deadline running' : 'Days to oldest deadline',
      short: daysToOldest === null ? 'None due' : 'Days left',
      value: daysToOldest,
      places: 1,
      spoken: daysToOldest === null ? 'No deadline running' : `Days to the oldest acknowledgement deadline: ${daysToOldest}`,
    },
    { id: 'members', label: 'Members', value: view.enrolled, places: 2, spoken: `Registered members: ${view.enrolled}` },
  ];

  return (
    <section className="work">
      <h1>Officer desk</h1>
      <Instrument channels={desk} label="Officer counter" />
      <p className={`notice${view.overdue > 0 ? ' alarm' : ''}`} role="status">
        {waiting.length === 0
          ? 'Nothing waiting for acknowledgement.'
          : `${plural(waiting.length, 'case is', 'cases are')} waiting for acknowledgement. The oldest is due ${
              waiting.at(-1)!.ackDue >= nowSecs() ? `in ${fmtSpanLong(waiting.at(-1)!.ackDue - nowSecs())}` : 'now'
            }.`}
      </p>
      <div className="work-grid wide-left">
        <div>
          <h2 className="work-sub">Cases</h2>
          {view.cases.length === 0 && <p className="empty">No reports yet.</p>}
          {view.cases.map((c) => (
            <CaseThread key={c.idHex} l={l} c={c} address={address} as={{ kind: 'officer', keys }} refresh={refresh} />
          ))}
        </div>
        <aside>
          <h2 className="work-sub">Members</h2>
          <Field label="Member key from an employee" hint="64 characters." value={newMember} onChange={setNewMember} mono />
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
            className="btn quiet subtle"
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
  const { l, view, error, readAt, refresh } = useChannel(address);
  const [hasCred, setHasCred] = useState(() => loadMember() !== null);

  useEffect(() => {
    const on = () => {
      setRoute(routeFromHash());
      window.scrollTo(0, 0);
    };
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
        <a className="wordmark" href="#/clock" aria-label="Sotto, response counter">
          <span className="mark" aria-hidden="true" />
          Sotto
        </a>
        <Station org={view?.orgName} demo={DEMO_ORG} />
        <nav aria-label="Sections">
          {nav('clock', 'Counter')}
          {nav('report', 'Report')}
          {nav('officer', 'Officer')}
        </nav>
        <span className="net" aria-live="polite">
          <span className={`dot${error ? ' off' : ''}`} aria-hidden="true" />
          Midnight {NETWORK}
          {error ? ' · reconnecting' : ''}
          <LiveClock />
        </span>
      </header>
      <main id="main">
        {!address && <p className="error">No channel address. Add ?c=&lt;contract address&gt; to the URL.</p>}
        {address && error && !l && (
          <div className="notice alarm">
            <p role="alert">Couldn't read the channel from the Midnight indexer: {error}</p>
            <Action kind="quiet" run={refresh}>
              Try again
            </Action>
          </div>
        )}
        {address && route === 'clock' && (l || !error) && <Clock view={view} address={address} readAt={readAt} />}
        {address && route === 'report' && !hasCred && <ReportIntro onCred={() => setHasCred(true)} />}
        {address && !l && !error && ((route === 'report' && hasCred) || route === 'officer') && <WarmupDesk route={route as 'report' | 'officer'} />}
        {l && view && route === 'report' && hasCred && (
          <Report l={l} view={view} address={address} refresh={refresh} onRemoved={() => setHasCred(false)} />
        )}
        {l && view && route === 'officer' && <Officer l={l} view={view} address={address} refresh={refresh} />}
      </main>
      <footer>
        <p>
          Sotto is open source (<a href="https://github.com/Owolabenjade/sotto">Apache-2.0</a>) and runs on{' '}
          <a href="https://midnight.network">Midnight</a>. Reading the counter needs nothing. Filing and answering need the Lace wallet on the{' '}
          {NETWORK} network.
        </p>
      </footer>
    </>
  );
}

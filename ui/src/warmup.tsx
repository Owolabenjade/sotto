// SPDX-License-Identifier: Apache-2.0
// First paint, before the Midnight runtime (WebAssembly) has loaded. Nothing
// here may import that runtime. The frame follows the route, so a #/report
// link never first paints the counter.
import { IconLock } from './icons';
import { Instrument, type Channel } from './tubes';

export type Route = 'clock' | 'report' | 'officer';

export const routeFromHash = (): Route => {
  const h = window.location.hash.replace(/^#\/?/, '');
  return h === 'report' || h === 'officer' ? h : 'clock';
};

export const DARK_COUNTER: Channel[] = [
  { id: 'reports', label: 'Reports received', value: null, places: 2, spoken: '' },
  { id: 'ontime', label: 'Acknowledged on time', value: null, places: 2, spoken: '' },
  { id: 'overdue', label: 'Overdue now', value: null, places: 1, spoken: '' },
  { id: 'days', label: 'Days to next deadline', value: null, places: 1, spoken: '' },
];

export function FileSwitch({ org }: { org?: string }) {
  return (
    <aside className="switch-panel plate" aria-labelledby="file-title">
      <h2 id="file-title">Seen something at {org ?? 'work'}?</h2>
      <p>
        <span className="long">File a sealed report. It proves you work there without saying who you are, and only the compliance officer can read it.</span>
        <span className="short">Prove you work here without saying who you are. Only the officer can read it.</span>
      </p>
      <a className="switch" href="#/report">
        <IconLock />
        <span>File a report</span>
      </a>
      <p className="switch-note">Takes two to three minutes with the Lace wallet.</p>
    </aside>
  );
}

/** The counter's frame with every tube dark. */
export function WarmupCounter() {
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

/** A working screen's frame while it loads. */
export function WarmupDesk({ route }: { route: 'report' | 'officer' }) {
  return (
    <section className="work" aria-busy="true">
      <h1>{route === 'report' ? 'Report as a verified insider' : 'Officer desk'}</h1>
      <div className="plate desk-plate">
        <p className="detail" aria-live="polite">
          {route === 'report' ? 'Opening the report desk. Reading the channel from the Midnight ledger…' : 'Opening the officer desk. Reading the channel from the Midnight ledger…'}
        </p>
      </div>
    </section>
  );
}

/** The whole page before the app module has loaded. */
export function WarmupPage() {
  const route = routeFromHash();
  const link = (r: Route, label: string) => (
    <a href={`#/${r}`} aria-current={route === r ? 'page' : undefined}>
      {label}
    </a>
  );
  return (
    <>
      <header className="top">
        <a className="wordmark" href="#/clock" aria-label="Sotto, response counter">
          <span className="mark" aria-hidden="true" />
          Sotto
        </a>
        <nav aria-label="Sections">
          {link('clock', 'Counter')}
          {link('report', 'Report')}
          {link('officer', 'Officer')}
        </nav>
        <span className="net">
          <span className="dot" aria-hidden="true" />
          Midnight preview
        </span>
      </header>
      <main id="main">{route === 'clock' ? <WarmupCounter /> : <WarmupDesk route={route} />}</main>
    </>
  );
}

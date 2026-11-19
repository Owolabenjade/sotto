// SPDX-License-Identifier: Apache-2.0
// The first paint. This file must not import anything that pulls in the
// Midnight runtime (WebAssembly): it is what the visitor sees while that loads.
import { IconLock } from './icons';
import { Bank } from './tubes';

export function WarmupBody() {
  return (
    <section className="board-page" aria-busy="true">
      <div className="hero">
        <div className="hero-copy">
          <h1>Warming up the counter.</h1>
          <p className="detail" aria-live="polite">
            Reading this channel from the public Midnight ledger. The tubes light as soon as it answers.
          </p>
        </div>
        <aside className="panel switch-panel" aria-labelledby="file-title">
          <h2 id="file-title">Seen something at work?</h2>
          <p>File a sealed report. It proves you work there without saying who you are, and only the compliance officer can read it.</p>
          <a className="btn" href="#/report">
            <IconLock />
            <span>File a report</span>
          </a>
          <p className="switch-note">Takes two to three minutes with the Lace wallet.</p>
        </aside>
      </div>
      <div className="banks" aria-hidden="true">
        {['Reports received', 'Acknowledged on time', 'Overdue now', 'Days to the next deadline'].map((label) => (
          <Bank key={label} value={null} label={label} spoken="" />
        ))}
      </div>
    </section>
  );
}

/** The whole page before the app module has loaded: header, frame, unlit tubes. */
export function WarmupPage() {
  return (
    <>
      <header className="top">
        <a className="wordmark" href="#/clock" aria-label="Sotto, response counter">
          <span className="mark" aria-hidden="true" />
          Sotto
        </a>
        <nav aria-label="Sections">
          <a href="#/clock">Counter</a>
          <a href="#/report">Report</a>
          <a href="#/officer">Officer</a>
        </nav>
        <span className="net">
          <span className="dot" aria-hidden="true" />
          Midnight preview
        </span>
      </header>
      <main id="main">
        <WarmupBody />
      </main>
    </>
  );
}

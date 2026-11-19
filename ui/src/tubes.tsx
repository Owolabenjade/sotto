// SPDX-License-Identifier: Apache-2.0
// The instrument: one blackened-steel housing holding a channel per count.
// Each tube is a drawn IN-14 envelope (assets/tube.svg) with all ten numerals
// stacked inside as live text, the unlit ones faintly visible; the lit layer
// glows. When a value changes (including the first read, when the tubes go
// from dark to lit), the old layer fades as the new one lights: one
// cross-fade. The tubes are hidden from screen readers; each channel speaks
// its value as text.
import type { ReactNode } from 'react';

const NUMERALS = [1, 6, 2, 7, 5, 0, 4, 9, 8, 3]; // physical stacking order of an IN-14 tube

function Tube({ digit }: { digit: number | null }) {
  return (
    <span className={`tube${digit === null ? ' dark' : ''}`} aria-hidden="true">
      {NUMERALS.map((n) => (
        <span key={n} className={`numeral${n === digit ? ' lit' : ''}`}>
          {n}
        </span>
      ))}
    </span>
  );
}

export type Channel = {
  /** Stable id: the same channel keeps its tubes across renders, so values cross-fade. */
  id: string;
  label: string;
  /** Phone label, when the full one would wrap. */
  short?: string;
  /** The sub-readout under the plate, e.g. "of 2 · within 7 days". */
  readout?: ReactNode;
  /** Phone readout. */
  readoutShort?: ReactNode;
  value: number | null;
  /** Minimum tube count; more tubes appear when the value needs them. */
  places?: number;
  spoken: string;
  tone?: 'late';
};

function ChannelView({ c }: { c: Channel }) {
  const min = c.places ?? 1;
  const places = c.value === null ? min : Math.max(min, String(c.value).length);
  const digits = c.value === null ? Array.from({ length: places }, () => null) : String(c.value).padStart(places, '0').split('').map(Number);
  return (
    <div className={`channel${c.tone ? ` ${c.tone}` : ''}`}>
      <span className="sr-only">{c.spoken}</span>
      <div className="tubes">
        {digits.map((d, i) => (
          <Tube key={`${places}-${i}`} digit={d} />
        ))}
      </div>
      <div className="channel-plate" aria-hidden="true">
        <span className="channel-label">
          <span className="full">{c.label}</span>
          <span className="short">{c.short ?? c.label}</span>
        </span>
        {c.readout && (
          <span className="channel-readout">
            <span className="full">{c.readout}</span>
            <span className="short">{c.readoutShort ?? c.readout}</span>
          </span>
        )}
      </div>
    </div>
  );
}

/** One housing, one row of channels. */
export function Instrument({ channels, label, busy }: { channels: Channel[]; label: string; busy?: boolean }) {
  return (
    <div className="instrument" role="group" aria-label={label} aria-busy={busy || undefined}>
      {channels.map((c) => (
        <ChannelView key={c.id} c={c} />
      ))}
    </div>
  );
}

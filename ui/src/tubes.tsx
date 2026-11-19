// SPDX-License-Identifier: Apache-2.0
// Nixie tubes. Each tube holds all ten numerals as stacked layers, the unlit
// ones faintly visible as in a real tube; the lit layer glows. When the value
// changes, the old layer fades out as the new one lights: one cross-fade, no
// flicker. The tubes are decoration for screen readers; the bank carries the
// value as text.
import type { ReactNode } from 'react';

const NUMERALS = [1, 6, 2, 7, 5, 0, 4, 9, 8, 3]; // the physical stacking order of an IN-14 tube

function Tube({ digit }: { digit: number | null }) {
  return (
    <span className={`tube${digit === null ? ' dark' : ''}`} aria-hidden="true">
      <span className="mesh" />
      {NUMERALS.map((n) => (
        <span key={n} className={`numeral${n === digit ? ' lit' : ''}`}>
          {n}
        </span>
      ))}
    </span>
  );
}

/** A bank of tubes showing `value` in `places` fixed decimal places; null leaves every tube unlit. */
export function Bank(props: { value: number | null; places?: number; label: ReactNode; spoken: string; tone?: 'late' }) {
  const places = props.places ?? 2;
  const capped = props.value === null ? null : Math.min(props.value, 10 ** places - 1);
  const digits =
    capped === null ? Array.from({ length: places }, () => null) : String(capped).padStart(places, '0').split('').map(Number);
  return (
    <div className={`bank${props.tone ? ` ${props.tone}` : ''}`}>
      <span className="sr-only">{props.spoken}</span>
      <div className="tubes">
        {digits.map((d, i) => (
          <Tube key={i} digit={d} />
        ))}
      </div>
      <p className="bank-label" aria-hidden="true">
        {props.label}
      </p>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { TypedSequence } from "./Typewriter";

const XS = [100, 125, 150, 175, 200];

/** Five candles drawn with thin lines. Tap each to blow it out. When the last one goes out the room goes dark and the message types. */
export function Cake({ lines }: { lines: string[] }) {
  const [out, setOut] = useState<boolean[]>(() => XS.map(() => false));
  const [night, setNight] = useState(false);
  const [round, setRound] = useState(0);
  const left = out.filter((o) => !o).length;
  const all = left === 0;

  useEffect(() => {
    if (!all) { setNight(false); return; }
    const t = setTimeout(() => setNight(true), 700);
    return () => clearTimeout(t);
  }, [all]);

  const blow = (i: number) => setOut((o) => o.map((v, k) => (k === i ? true : v)));
  const again = () => { setOut(XS.map(() => false)); setRound((r) => r + 1); };

  return (
    <main className="cake-scene" data-night={night}>
      <div className="column cake-col">
        <svg className="cake" viewBox="0 0 300 200" role="group" aria-label="A birthday cake with five candles" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M20 190H280" />
          <path d="M50 190V140H250V190" />
          <path d="M75 140V100H225V140" />
          <path d="M50 160H250M75 120H225" opacity="0.35" />
          {XS.map((x, i) => (
            <g
              key={x}
              className="candle"
              data-out={out[i]}
              role="button"
              tabIndex={0}
              aria-label={out[i] ? `Candle ${i + 1}, blown out` : `Candle ${i + 1}, tap to blow out`}
              onClick={() => blow(i)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); blow(i); } }}
            >
              <rect className="hit" x={x - 12} y="40" width="24" height="64" stroke="none" fill="transparent" />
              <path d={`M${x} 100V74`} />
              <path className="flame" d={`M${x} 56C${x + 6} 64 ${x + 5} 70 ${x} 73 ${x - 5} 70 ${x - 6} 64 ${x} 56Z`} stroke="var(--gold)" fill="var(--gold)" fillOpacity="0.25" />
            </g>
          ))}
        </svg>

        <p className="soft cap" aria-live="polite">
          {all ? " " : left === XS.length ? "Tap the candles to blow them out" : `${left} left…`}
        </p>

        {night && (
          <div className="after">
            <TypedSequence key={round} items={lines.map((text) => ({ text, className: "line" }))} startDelay={900} />
            <p className="actions">
              <Link className="act" href="/hub">Continue</Link>
              <button type="button" className="act quiet" onClick={again}>light them again</button>
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

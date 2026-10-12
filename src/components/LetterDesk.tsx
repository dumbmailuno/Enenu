"use client";

import { useState } from "react";
import { TypedSequence, type SequenceItem } from "./Typewriter";
import { ZoomImage } from "./ZoomImage";

export interface DeskLetter {
  id: string;
  title: string;
  hint: string | null;
  greeting: string | null;
  body: string[];
  sign: string | null;
  /** Ready-to-use image URL (a scan of a handwritten letter), or null. */
  scanUrl: string | null;
}

/** A list of letters. Opening one types it out, one paragraph after another. */
export function LetterDesk({ letters, noun = "opened" }: { letters: DeskLetter[]; noun?: string }) {
  const [cur, setCur] = useState<number | null>(null);
  const [read, setRead] = useState<Set<number>>(() => new Set());

  const show = (i: number) => {
    setCur(i);
    setRead((r) => new Set(r).add(i));
    window.scrollTo({ top: 0 });
  };

  if (!letters.length) return <p className="soft">Nothing here yet.</p>;

  if (cur !== null && letters[cur]) {
    const l = letters[cur];
    const items: SequenceItem[] = [
      { text: l.title, as: "h2", className: "title" },
      ...(l.greeting ? [{ text: l.greeting, className: "hand big" } satisfies SequenceItem] : []),
      ...l.body.map((text): SequenceItem => ({ text, className: "line" })),
      ...(l.sign ? [{ text: l.sign, className: "hand big" } satisfies SequenceItem] : []),
    ];
    return (
      <div className="reader">
        <p className="when">Letter {String(cur + 1).padStart(2, "0")}</p>
        {l.scanUrl && <ZoomImage src={l.scanUrl} alt="A scan of the handwritten letter" ratio="auto" />}
        <TypedSequence key={l.id} items={items} startDelay={900} gap={650} />
        <hr className="rule thin" />
        <div className="actions">
          <button type="button" className="act quiet" disabled={cur === 0} onClick={() => show(cur - 1)}>previous</button>
          <button type="button" className="act quiet" onClick={() => { setCur(null); window.scrollTo({ top: 0 }); }}>back to the letters</button>
          <button type="button" className="act quiet" disabled={cur === letters.length - 1} onClick={() => show(cur + 1)}>next</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <p className="soft count">{read.size} of {letters.length} {noun}</p>
      <ul className="rows">
        {letters.map((l, i) => (
          <li key={l.id}>
            <button type="button" className="row" onClick={() => show(i)}>
              <span className="row-title"><span className="num">{String(i + 1).padStart(2, "0")}</span>{l.title}</span>
              {l.hint && <span className="row-sub hand-sub">{l.hint}</span>}
              {read.has(i) && <span className="mark">read</span>}
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { TypedSequence, type SequenceItem } from "./Typewriter";

interface PortalProps {
  herName: string;
  lines: string[];
  button: string;
  letterTitle: string | null;
  letterBody: string[];
  letterSign: string | null;
}

/** Opening lines type out, then a plain envelope, then the letter types out, then a link on to the cake. */
export function Portal({ herName, lines, button, letterTitle, letterBody, letterSign }: PortalProps) {
  const [linesDone, setLinesDone] = useState(false);
  const [opened, setOpened] = useState(false);
  const [letterDone, setLetterDone] = useState(false);

  const hasLetter = Boolean(letterTitle) || letterBody.length > 0;
  const [first, ...rest] = lines;
  const opening: SequenceItem[] = [
    { text: first ?? `For ${herName}.`, as: "h1", className: "display", speed: 70 },
    ...rest.map((text, i): SequenceItem => ({ text, className: i === rest.length - 1 ? "line soft" : "line" })),
  ];
  const letter: SequenceItem[] = [
    ...(letterTitle ? [{ text: letterTitle, as: "h2", className: "title" } satisfies SequenceItem] : []),
    ...letterBody.map((text): SequenceItem => ({ text, className: "line" })),
    ...(letterSign ? [{ text: letterSign, className: "hand" } satisfies SequenceItem] : []),
  ];

  return (
    <main className="opening">
      <div className="column">
        {!opened ? (
          <>
            <TypedSequence key="opening" items={opening} onAllDone={() => setLinesDone(true)} />
            <div className="reveal" data-show={linesDone}>
              {hasLetter ? (
                <button type="button" className="envelope" onClick={() => setOpened(true)} disabled={!linesDone}>
                  <svg viewBox="0 0 120 80" width="120" height="80" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
                    <rect x="0.5" y="0.5" width="119" height="79" />
                    <path d="M0.5 0.5 60 46 119.5 0.5" />
                  </svg>
                  <span>open the envelope</span>
                </button>
              ) : (
                <Link className="act" href="/cake">{button}</Link>
              )}
            </div>
          </>
        ) : (
          <>
            <TypedSequence key="letter" items={letter} startDelay={900} onAllDone={() => setLetterDone(true)} />
            <div className="reveal" data-show={letterDone}>
              <Link className="act" href="/cake">{button}</Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

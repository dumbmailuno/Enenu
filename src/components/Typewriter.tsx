"use client";

import { useEffect, useRef, useState, type ElementType } from "react";
import { useAudio } from "./AudioProvider";

const PAUSE: Record<string, number> = { ".": 380, "!": 380, "?": 380, "…": 380, ",": 170, "—": 220, "\n": 300 };

export interface TypewriterProps {
  text: string;
  as?: ElementType;
  className?: string;
  /** Milliseconds per character (a little random variation is added). */
  speed?: number;
  /** Wait before this line starts typing. */
  delay?: number;
  active?: boolean;
  skip?: boolean;
  /** Play the pen sound while this line types. */
  scribble?: boolean;
  onDone?: () => void;
}

export function Typewriter({ text, as: Tag = "p", className, speed = 42, delay = 0, active = true, skip = false, scribble = true, onDone }: TypewriterProps) {
  const [n, setN] = useState(0);
  const [done, setDone] = useState(false);
  const finished = useRef(false);
  const { startScribble, stopScribble } = useAudio();
  const doneCb = useRef(onDone);
  doneCb.current = onDone;

  useEffect(() => {
    if (!active || finished.current) return;
    const finish = () => {
      finished.current = true;
      setDone(true);
      stopScribble();
      doneCb.current?.();
    };
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (skip || reduced) { setN(text.length); finish(); return; }
    let i = 0;
    let t: ReturnType<typeof setTimeout> | undefined;
    const step = () => {
      i++;
      setN(i);
      if (i >= text.length) { finish(); return; }
      t = setTimeout(step, speed * (0.7 + Math.random() * 0.7) + (PAUSE[text[i - 1]] ?? 0));
    };
    const begin = setTimeout(() => { if (scribble) startScribble(); step(); }, delay);
    return () => { clearTimeout(begin); if (t) clearTimeout(t); stopScribble(); };
  }, [active, skip, text, speed, delay, scribble, startScribble, stopScribble]);

  return (
    <Tag className={className}>
      <span className="sr-only">{text}</span>
      <span className="tw" aria-hidden="true">
        <span className="tw-ghost">{text}</span>
        <span className="tw-live">
          {text.slice(0, n)}
          {active && !done && <i className="caret" />}
        </span>
      </span>
    </Tag>
  );
}

export interface SequenceItem { text: string; as?: ElementType; className?: string; speed?: number }

/** Types lines one after another. Tap or click anywhere on it to show the rest at once. */
export function TypedSequence({ items, startDelay = 700, gap = 450, className, onAllDone }: { items: SequenceItem[]; startDelay?: number; gap?: number; className?: string; onAllDone?: () => void }) {
  const [cur, setCur] = useState(0);
  const [skip, setSkip] = useState(false);
  return (
    <div className={className} onClick={() => setSkip(true)}>
      {items.map((it, i) => (
        <Typewriter
          key={i}
          {...it}
          active={i <= cur}
          skip={skip}
          delay={i === 0 ? startDelay : gap}
          onDone={() => { setCur((c) => Math.max(c, i + 1)); if (i === items.length - 1) onAllDone?.(); }}
        />
      ))}
    </div>
  );
}

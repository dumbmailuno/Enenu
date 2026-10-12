"use client";

import { useState } from "react";
import { Typewriter } from "./Typewriter";
import type { LittleThing } from "@/types/content";

/** Each line is a prompt. Tap it and what is behind it types out underneath. They stay open once opened. */
export function LittleCards({ items }: { items: LittleThing[] }) {
  const [shown, setShown] = useState<Set<string>>(() => new Set());
  if (!items.length) return <p className="soft">Nothing here yet.</p>;
  return (
    <>
      <p className="soft count">{shown.size} of {items.length} opened</p>
      <ul className="rows">
        {items.map((it) => {
          const on = shown.has(it.id);
          return (
            <li key={it.id}>
              <button type="button" className="row" aria-expanded={on} disabled={on} onClick={() => setShown((s) => new Set(s).add(it.id))}>
                <span className="row-title">{it.prompt}</span>
                {!on && <span className="mark">tap</span>}
              </button>
              {on && (
                <div className="body-in">
                  <Typewriter className="line" text={it.body} delay={250} />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}

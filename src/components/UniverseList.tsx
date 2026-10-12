"use client";

import { useState } from "react";
import { Typewriter } from "./Typewriter";
import { ZoomImage } from "./ZoomImage";
import { niceDate } from "@/lib/format";
import type { UniverseCard } from "@/types/content";

/** A list of titles. Tap one and it opens in place; the memory types itself out. One open at a time. */
export function UniverseList({ cards }: { cards: UniverseCard[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const [seen, setSeen] = useState<Set<string>>(() => new Set());

  const toggle = (id: string) => {
    setOpen((o) => (o === id ? null : id));
    setSeen((s) => new Set(s).add(id));
  };
  const all = cards.length > 0 && seen.size === cards.length;

  if (!cards.length) return <p className="soft">Nothing here yet.</p>;
  return (
    <>
      <p className="soft count">{seen.size} of {cards.length} explored</p>
      <ul className="rows">
        {cards.map((c) => {
          const isOpen = open === c.id;
          return (
            <li key={c.id}>
              <button type="button" className="row" aria-expanded={isOpen} aria-controls={`u-${c.id}`} onClick={() => toggle(c.id)}>
                <span className="row-title">{c.title}</span>
                {c.tag && <span className="row-sub">{c.tag}</span>}
                {seen.has(c.id) && !isOpen && <span className="mark">opened</span>}
              </button>
              {seen.has(c.id) && (
                <div id={`u-${c.id}`} className="body-in" hidden={!isOpen}>
                  {c.photo_path && <ZoomImage path={c.photo_path} alt={c.title} ratio="auto" />}
                  <Typewriter className="line" text={c.body} active={isOpen} delay={300} />
                  {c.event_date && <p className="when">{niceDate(c.event_date)}</p>}
                  {c.note && <p className="hand">{c.note}</p>}
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {all && <p className="hand bonus">You found every star.</p>}
    </>
  );
}

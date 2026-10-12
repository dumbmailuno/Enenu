"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readVisited } from "./Visit";

export const SECTIONS = [
  { slug: "universe", href: "/universe", label: "Our little universe", note: "The jokes, names and moments only we would understand." },
  { slug: "memories", href: "/memories", label: "Memory lane", note: "Photos, notes and ordinary days." },
  { slug: "letters", href: "/letters", label: "Letters to Enenu", note: "Each one has its own time to be opened." },
  { slug: "people", href: "/people", label: "Messages from your people", note: "The friends who recorded something for you." },
  { slug: "little-things", href: "/little-things", label: "The things I love about you", note: "Tap each one." },
  { slug: "just-between-us", href: "/just-between-us", label: "Just between us", note: "This part has a password." },
] as const;

export function HubLinks() {
  const [seen, setSeen] = useState<string[]>([]);
  useEffect(() => { setSeen(readVisited()); }, []);
  const count = SECTIONS.filter((s) => seen.includes(s.slug)).length;

  return (
    <nav aria-label="Sections">
      <p className="soft count">{count} of {SECTIONS.length} explored</p>
      <ul className="rows">
        {SECTIONS.map((s) => (
          <li key={s.slug}>
            <Link className="row" href={s.href}>
              <span className="row-title">{s.label}</span>
              <span className="row-sub">{s.note}</span>
              {seen.includes(s.slug) && <span className="mark">visited</span>}
            </Link>
          </li>
        ))}
      </ul>
      <p className="last">
        <span className="soft">Save this one for last.</span>
        <Link className="act" href="/finale">One last letter</Link>
      </p>
    </nav>
  );
}

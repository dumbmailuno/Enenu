"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAudio } from "./AudioProvider";

const LINKS = [
  { href: "/hub", label: "Happy birthday" },
  { href: "/universe", label: "Our little universe" },
  { href: "/memories", label: "Memory lane" },
  { href: "/letters", label: "Letters to Enenu" },
  { href: "/people", label: "Messages from your people" },
  { href: "/little-things", label: "The things I love about you" },
  { href: "/just-between-us", label: "Just between us" },
  { href: "/finale", label: "One last letter" },
];

export function Menu() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const { muted, toggleMute, unlocked } = useAudio();

  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (path === "/") return null; // the opening has its own quiet chrome

  return (
    <>
      <div className="bar">
        <button type="button" className="textbtn" onClick={toggleMute} aria-pressed={muted}>
          {muted ? "sound off" : unlocked ? "sound on" : "tap for sound"}
        </button>
        <button type="button" className="textbtn" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="site-menu">
          {open ? "close" : "menu"}
        </button>
      </div>
      <nav id="site-menu" className="menu" data-open={open} aria-label="Sections" hidden={!open}>
        <ul>
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} aria-current={path === l.href ? "page" : undefined}>{l.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}

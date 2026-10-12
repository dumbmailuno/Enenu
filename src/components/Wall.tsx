"use client";

import { useEffect, useRef, useState } from "react";
import { Typewriter } from "./Typewriter";

export interface WallFriend {
  id: string;
  name: string;
  collection: "birthday" | "love" | "future";
  isFromMe: boolean;
  intro: string | null;
  note: string | null;
  photo: string | null;
  video: string | null;
  poster: string | null;
  captions: string | null;
}

const GROUPS: { key: WallFriend["collection"]; label: string }[] = [
  { key: "birthday", label: "The birthday wishes" },
  { key: "love", label: "The things we love about you" },
  { key: "future", label: "A message for the future" },
];

function Player({ friend }: { friend: WallFriend }) {
  const ref = useRef<HTMLVideoElement>(null);
  // Stop any download and playback the moment this is closed or changed.
  useEffect(() => {
    const v = ref.current;
    return () => { if (v) { v.pause(); v.removeAttribute("src"); v.load(); } };
  }, [friend.id]);
  if (!friend.video) {
    return friend.photo ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img className="viewer-photo" src={friend.photo} alt={friend.name} />
    ) : (
      <p className="soft">The video is not here yet.</p>
    );
  }
  return (
    <video ref={ref} className="viewer-video" src={friend.video} poster={friend.poster ?? undefined} controls playsInline preload="metadata">
      {friend.captions && <track kind="captions" src={friend.captions} srcLang="en" label="English" default />}
    </video>
  );
}

/** Names by collection. Tap a name to watch. No video loads until it is opened. */
export function Wall({ friends }: { friends: WallFriend[] }) {
  const people = friends.filter((f) => !f.isFromMe);
  const me = friends.find((f) => f.isFromMe) ?? null;
  const [tab, setTab] = useState<"all" | WallFriend["collection"]>("all");
  const [open, setOpen] = useState<WallFriend | null>(null);
  const [seen, setSeen] = useState<Set<string>>(() => new Set());
  const closeRef = useRef<HTMLButtonElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  const shown = tab === "all" ? people : people.filter((f) => f.collection === tab);
  const seq = open?.isFromMe ? [open] : shown;
  const idx = open ? seq.findIndex((f) => f.id === open.id) : -1;

  const show = (f: WallFriend, from?: HTMLElement | null) => {
    if (from) opener.current = from;
    setOpen(f);
    setSeen((s) => new Set(s).add(f.id));
  };
  const close = () => { setOpen(null); opener.current?.focus(); };

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      const inVideo = (e.target as HTMLElement | null)?.tagName === "VIDEO";
      if (inVideo) return;
      if (e.key === "ArrowLeft" && idx > 0) show(seq[idx - 1]);
      if (e.key === "ArrowRight" && idx >= 0 && idx < seq.length - 1) show(seq[idx + 1]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, idx]);

  if (!friends.length) return <p className="soft">Nothing here yet.</p>;

  return (
    <>
      <div className="tabs" role="tablist" aria-label="Collections">
        {[{ key: "all" as const, label: "All" }, ...GROUPS].map((g) => (
          <button key={g.key} type="button" role="tab" aria-selected={tab === g.key} className="tab" onClick={() => setTab(g.key)}>{g.label}</button>
        ))}
      </div>
      <p className="soft count">{people.filter((f) => seen.has(f.id)).length} of {people.length} watched</p>

      {shown.length ? (
        <ul className="rows">
          {shown.map((f) => (
            <li key={f.id}>
              <button type="button" className="row" onClick={(e) => show(f, e.currentTarget)}>
                <span className="row-title">{f.name}</span>
                {f.intro && <span className="row-sub">{f.intro}</span>}
                {seen.has(f.id) && <span className="mark">watched</span>}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="soft">Nothing in this collection yet.</p>
      )}

      {me && (
        <section className="last">
          <hr className="rule" />
          <h2 className="title">One last thing, from me</h2>
          <p className="soft">Save this one for last.</p>
          <button type="button" className="act" onClick={(e) => show(me, e.currentTarget)}>{me.name || "Watch"}</button>
        </section>
      )}

      {open && (
        <div className="viewer" role="dialog" aria-modal="true" aria-labelledby="viewer-name">
          <div className="viewer-in">
            <Player friend={open} />
            <p className="when">{open.isFromMe ? "From me" : GROUPS.find((g) => g.key === open.collection)?.label}</p>
            <h2 id="viewer-name" className="title">{open.name}</h2>
            {open.note && <Typewriter key={open.id} className="line" text={open.note} delay={600} />}
            <div className="actions">
              <button type="button" className="act quiet" disabled={idx <= 0} onClick={() => show(seq[idx - 1])}>previous</button>
              <button ref={closeRef} type="button" className="act" onClick={close}>close</button>
              <button type="button" className="act quiet" disabled={idx < 0 || idx >= seq.length - 1} onClick={() => show(seq[idx + 1])}>next</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

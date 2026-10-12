"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Pen } from "@/lib/pen";

export interface PageAudioConfig { song: string | null; volume: number; scribble: boolean }

interface AudioCtx {
  unlocked: boolean;
  muted: boolean;
  toggleMute: () => void;
  unlock: () => void;
  setPage: (cfg: PageAudioConfig) => void;
  startScribble: () => void;
  stopScribble: () => void;
}

const Ctx = createContext<AudioCtx | null>(null);

export function useAudio(): AudioCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAudio must be used inside <AudioProvider>");
  return v;
}

const fades = new WeakMap<HTMLAudioElement, number>();
function fadeTo(a: HTMLAudioElement, to: number, ms: number, done?: () => void) {
  const prev = fades.get(a);
  if (prev) cancelAnimationFrame(prev);
  const from = a.volume;
  const t0 = performance.now();
  const step = (now: number) => {
    const k = Math.min(1, (now - t0) / ms);
    a.volume = Math.max(0, Math.min(1, from + (to - from) * k));
    if (k < 1) fades.set(a, requestAnimationFrame(step));
    else done?.();
  };
  fades.set(a, requestAnimationFrame(step));
}

/** Browsers block sound until the first tap or key press. This unlocks it on that first gesture. */
export function AudioProvider({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [muted, setMuted] = useState(false);
  const unlockedRef = useRef(false);
  const mutedRef = useRef(false);
  const pageRef = useRef<PageAudioConfig>({ song: null, volume: 0.35, scribble: true });
  const songRef = useRef<HTMLAudioElement | null>(null);
  const songSrcRef = useRef<string | null>(null);
  const penRef = useRef<Pen | null>(null);

  const apply = useCallback(() => {
    if (!unlockedRef.current) return;
    const { song, volume } = pageRef.current;
    const target = mutedRef.current ? 0 : volume;
    const cur = songRef.current;
    if (!song) {
      if (cur) fadeTo(cur, 0, 600, () => cur.pause());
      songRef.current = null;
      songSrcRef.current = null;
      return;
    }
    if (cur && songSrcRef.current === song) {
      fadeTo(cur, target, 400);
      if (cur.paused) void cur.play().catch(() => {});
      return;
    }
    if (cur) fadeTo(cur, 0, 700, () => cur.pause());
    const a = new Audio(song);
    a.loop = true;
    a.volume = 0;
    songRef.current = a;
    songSrcRef.current = song;
    a.play().then(() => fadeTo(a, mutedRef.current ? 0 : pageRef.current.volume, 1800)).catch(() => {});
  }, []);

  const unlock = useCallback(() => {
    if (unlockedRef.current) return;
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AC) {
      const ctx = new AC();
      void ctx.resume();
      penRef.current = new Pen(ctx);
      penRef.current.setMuted(mutedRef.current);
    }
    unlockedRef.current = true;
    setUnlocked(true);
    apply();
  }, [apply]);

  useEffect(() => {
    try {
      if (localStorage.getItem("jade-muted") === "1") { mutedRef.current = true; setMuted(true); }
    } catch { /* storage unavailable */ }
    const h = () => unlock();
    window.addEventListener("pointerdown", h, { once: true });
    window.addEventListener("keydown", h, { once: true });
    return () => { window.removeEventListener("pointerdown", h); window.removeEventListener("keydown", h); };
  }, [unlock]);

  const setPage = useCallback((cfg: PageAudioConfig) => { pageRef.current = cfg; apply(); }, [apply]);

  const toggleMute = useCallback(() => {
    mutedRef.current = !mutedRef.current;
    setMuted(mutedRef.current);
    try { localStorage.setItem("jade-muted", mutedRef.current ? "1" : "0"); } catch { /* ignore */ }
    penRef.current?.setMuted(mutedRef.current);
    apply();
  }, [apply]);

  const startScribble = useCallback(() => {
    if (!mutedRef.current && pageRef.current.scribble) penRef.current?.start();
  }, []);
  const stopScribble = useCallback(() => { penRef.current?.stop(); }, []);

  const value = useMemo(
    () => ({ unlocked, muted, toggleMute, unlock, setPage, startScribble, stopScribble }),
    [unlocked, muted, toggleMute, unlock, setPage, startScribble, stopScribble],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

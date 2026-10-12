"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Typewriter, type TypewriterProps } from "./Typewriter";

export function useInView<T extends Element>(threshold = 0.2) {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    if (typeof IntersectionObserver === "undefined") { setSeen(true); return; }
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { setSeen(true); io.disconnect(); } }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [seen, threshold]);
  return [ref, seen] as const;
}

/** Fades its content in the first time it scrolls into view. */
export function Fade({ children, className = "" }: { children: ReactNode; className?: string }) {
  const [ref, seen] = useInView<HTMLDivElement>(0.12);
  return <div ref={ref} className={`fade ${className}`} data-in={seen}>{children}</div>;
}

/** A line that starts typing only when it scrolls into view. */
export function TypeInView(props: Omit<TypewriterProps, "active">) {
  const [ref, seen] = useInView<HTMLDivElement>(0.6);
  return <div ref={ref}><Typewriter {...props} active={seen} /></div>;
}

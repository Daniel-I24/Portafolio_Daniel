"use client";

import Lenis from "lenis";
import { MotionConfig } from "motion/react";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Icon } from "./Icon";

/** Height of the fixed menu: anchor jumps stop below it. */
export const HEADER_OFFSET = 80;

type MotionPrefs = { enabled: boolean; toggle: () => void };
const MotionContext = createContext<MotionPrefs>({ enabled: true, toggle: () => {} });

export const useMotionPrefs = (): MotionPrefs => useContext(MotionContext);

/** True when nothing should move: animations are off by the visitor's choice or, without one, by the OS setting. */
export function useCalm(): boolean {
  return !useMotionPrefs().enabled;
}

/**
 * Page-wide motion switch (persisted in localStorage, mirrored on <html data-motion> so CSS obeys it too)
 * and Lenis smooth scroll, which only runs while motion is allowed. On by default unless the OS asks for reduced motion.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(true);

  // The inline script in app/layout.tsx already set the state before paint; sync React with it.
  useEffect(() => {
    const { motion } = document.documentElement.dataset;
    setEnabled(motion ? motion === "on" : !matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const lenis = new Lenis({ autoRaf: true, anchors: { offset: -HEADER_OFFSET } });
    return () => lenis.destroy();
  }, [enabled]);

  const toggle = () => {
    const next = !enabled;
    document.documentElement.dataset.motion = next ? "on" : "off";
    try {
      localStorage.setItem("motion", next ? "on" : "off");
    } catch {
      // Private mode: the switch still works for this visit.
    }
    setEnabled(next);
  };

  return (
    <MotionContext value={{ enabled, toggle }}>
      <MotionConfig reducedMotion={enabled ? "never" : "always"}>{children}</MotionConfig>
    </MotionContext>
  );
}

/** Labelled with the action it performs; pressed while animations are paused. Also used inside the mobile menu. */
export function MotionSwitch({ className = "" }: { className?: string }) {
  const { enabled, toggle } = useMotionPrefs();
  return (
    <button type="button" onClick={toggle} aria-pressed={!enabled}
      className={`inline-flex items-center gap-2 rounded-full border border-line px-3.5 py-2.5 text-sm font-medium text-ink transition-colors duration-150 hover:border-ink ${className}`}>
      <Icon name={enabled ? "pause" : "play"} size={16} />
      {enabled ? "Pausar animaciones" : "Activar animaciones"}
    </button>
  );
}

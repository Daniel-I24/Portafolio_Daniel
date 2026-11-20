"use client";

import Lenis from "lenis";
import { MotionConfig, useReducedMotion } from "motion/react";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Icon } from "./Icon";

/** Height of the fixed menu: anchor jumps stop below it. */
export const HEADER_OFFSET = 80;

type MotionPrefs = { enabled: boolean; toggle: () => void };
const MotionContext = createContext<MotionPrefs>({ enabled: true, toggle: () => {} });

export const useMotionPrefs = (): MotionPrefs => useContext(MotionContext);

/** True when nothing should move: the OS asks for reduced motion or the visitor switched animations off. */
export function useCalm(): boolean {
  const reduced = useReducedMotion();
  const { enabled } = useMotionPrefs();
  return Boolean(reduced) || !enabled;
}

/**
 * Page-wide motion switch (persisted in localStorage, mirrored on <html data-motion> so CSS obeys it too)
 * and Lenis smooth scroll, which only runs while motion is allowed.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(true);
  const reduced = useReducedMotion();

  // The inline script in app/layout.tsx already applied the saved choice before paint; sync React with it.
  useEffect(() => setEnabled(document.documentElement.dataset.motion !== "off"), []);

  useEffect(() => {
    if (!enabled || reduced) return;
    const lenis = new Lenis({ autoRaf: true, anchors: { offset: -HEADER_OFFSET } });
    return () => lenis.destroy();
  }, [enabled, reduced]);

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
      <MotionConfig reducedMotion={enabled ? "user" : "always"}>{children}</MotionConfig>
    </MotionContext>
  );
}

/** "Animaciones: sí / no" switch; also used inside the mobile menu. */
export function MotionSwitch({ className = "" }: { className?: string }) {
  const { enabled, toggle } = useMotionPrefs();
  return (
    <button type="button" onClick={toggle} aria-pressed={!enabled}
      className={`inline-flex items-center gap-2 rounded-full border border-line px-3.5 py-2.5 text-sm font-medium text-ink transition-colors duration-150 hover:border-ink ${className}`}>
      <Icon name={enabled ? "pause" : "play"} size={16} />
      Animaciones: {enabled ? "sí" : "no"}
    </button>
  );
}

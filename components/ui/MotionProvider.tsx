"use client";

import Lenis from "lenis";
import { MotionConfig } from "motion/react";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { buttonClass } from "./Button";
import { Icon } from "./Icon";

/** Height of the fixed menu: anchor jumps stop below it. */
export const HEADER_OFFSET = 80;

/** The running smooth-scroll instance (null while motion is off), for jumps that must not glide. */
export const smoothScroll: { current: Lenis | null } = { current: null };

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
    smoothScroll.current = lenis;
    return () => { smoothScroll.current = null; lenis.destroy(); };
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
    <button type="button" onClick={toggle} aria-pressed={!enabled} className={`${buttonClass("quiet", "sm")} ${className}`}>
      <Icon name={enabled ? "pause" : "play"} size={16} />
      {enabled ? "Pausar animaciones" : "Activar animaciones"}
    </button>
  );
}

"use client";

import type Lenis from "lenis";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { buttonClass } from "./Button";
import { Icon } from "./Icon";

/** Height of the fixed menu: anchor jumps stop below it. */
export const HEADER_OFFSET = 80;

const READY_EVENT = "page-ready";

/** Runs `start` once the page has settled (loaded + idle); returns a cleanup. */
export function whenReady(start: () => void): () => void {
  if (document.documentElement.dataset.ready !== undefined) { start(); return () => {}; }
  addEventListener(READY_EVENT, start, { once: true });
  return () => removeEventListener(READY_EVENT, start);
}

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
 * Lenis is fetched when the browser is idle and only for wheel/trackpad devices (it does not smooth touch anyway),
 * so it never competes with the first paint.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(true);

  // The inline script in app/layout.tsx already set the state before paint; sync React with it.
  useEffect(() => {
    const { motion } = document.documentElement.dataset;
    setEnabled(motion ? motion === "on" : !matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // Endless CSS loops (lava, LED pulse, sway) start once the page is loaded and the browser is idle,
  // so they never compete with the first paint; they rest in their start pose until then.
  useEffect(() => {
    const ready = () => { document.documentElement.dataset.ready = ""; dispatchEvent(new Event(READY_EVENT)); };
    const later = () => ("requestIdleCallback" in window ? requestIdleCallback(ready, { timeout: 2500 }) : setTimeout(ready, 1200));
    if (document.readyState === "complete") later(); else addEventListener("load", later, { once: true });
  }, []);

  // Hidden tab: CSS loops pause via html[data-tab="hidden"].
  useEffect(() => {
    const sync = () => { document.documentElement.dataset.tab = document.hidden ? "hidden" : "visible"; };
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  useEffect(() => {
    if (!enabled || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let lenis: Lenis | null = null;
    let cancelled = false;
    const start = () => import("lenis").then(({ default: SmoothScroll }) => {
      if (cancelled) return;
      lenis = new SmoothScroll({ autoRaf: true, anchors: { offset: -HEADER_OFFSET } });
      smoothScroll.current = lenis;
    });
    const idle = "requestIdleCallback" in window ? requestIdleCallback(start, { timeout: 3000 }) : setTimeout(start, 1500);
    return () => {
      cancelled = true;
      if ("cancelIdleCallback" in window) cancelIdleCallback(idle as number); else clearTimeout(idle);
      smoothScroll.current = null;
      lenis?.destroy();
    };
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
    <MotionContext value={{ enabled, toggle }}>{children}</MotionContext>
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

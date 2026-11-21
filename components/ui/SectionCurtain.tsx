"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { HEADER_OFFSET, smoothScroll } from "./MotionProvider";
import { SECTIONS, sectionNumber, type SectionId } from "./Section";

const EVENT = "section-curtain";
const EASE = "cubic-bezier(0.76, 0, 0.24, 1)";
const COVER = 320; // ms · cover + hold + lift stays under 900 ms
const HOLD = 120; // ms

const isCalm = () => {
  const { motion: pref } = document.documentElement.dataset;
  return pref === "off" || (!pref && matchMedia("(prefers-reduced-motion: reduce)").matches);
};

/** Jumps (never glides) to the section and hands it keyboard focus. */
function arrive(id: SectionId) {
  const target = document.getElementById(id);
  if (!target) return;
  if (smoothScroll.current) smoothScroll.current.scrollTo(target, { immediate: true, force: true, offset: -HEADER_OFFSET });
  else target.scrollIntoView();
  history.pushState(null, "", `#${id}`);
  if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
  target.classList.add("outline-none");
  target.focus({ preventScroll: true });
}

/**
 * Click handler for menu links only (desktop bar and mobile panel; normal scrolling never triggers it).
 * Calm: the plain anchor jump, then focus.
 */
export function goToSection(event: MouseEvent<HTMLAnchorElement>, id: SectionId) {
  event.preventDefault();
  event.stopPropagation(); // keeps Lenis from also gliding to the anchor
  if (isCalm()) return arrive(id);
  window.dispatchEvent(new CustomEvent<SectionId>(EVENT, { detail: id }));
}

/** Runs one transform tween on the compositor; a newer tween cancels the previous one (its promise rejects quietly). */
function tween(el: HTMLElement, last: { current: Animation | null }, to: string, duration: number, delay = 0) {
  const from = getComputedStyle(el).transform;
  last.current?.cancel();
  const animation = el.animate([{ transform: from === "none" ? "translateY(100%)" : from }, { transform: to }], { duration, delay, easing: EASE, fill: "forwards" });
  last.current = animation;
  return animation.finished;
}

/** Navy curtain with the section number and name: rises, the page jumps behind it, then it lifts. Click or Esc skips. */
export function SectionCurtain() {
  const [id, setId] = useState<SectionId | null>(null);
  const curtain = useRef<HTMLDivElement>(null);
  const last = useRef<Animation | null>(null);
  const arrived = useRef(false);
  const target = useRef<SectionId | null>(null);

  useEffect(() => {
    const onGo = (event: Event) => {
      arrived.current = false;
      target.current = (event as CustomEvent<SectionId>).detail;
      setId(target.current);
    };
    window.addEventListener(EVENT, onGo);
    return () => window.removeEventListener(EVENT, onGo);
  }, []);

  const land = (fast = false) => {
    const el = curtain.current;
    if (!el || !target.current) return;
    if (!arrived.current) { arrived.current = true; arrive(target.current); }
    tween(el, last, "translateY(-100%)", fast ? 200 : COVER, fast ? 0 : HOLD).then(() => setId(null), () => {});
  };

  useEffect(() => {
    const el = curtain.current;
    if (!id || !el) return;
    tween(el, last, "translateY(0%)", COVER).then(() => land(), () => {});
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && land(true);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [id]);

  if (!id) return null;
  const label = SECTIONS.find((section) => section.id === id)?.label;

  return (
    <div ref={curtain} aria-hidden onClick={() => land(true)} style={{ transform: "translateY(100%)" }}
      className="fixed inset-0 z-[70] grid cursor-pointer place-items-center bg-navy px-4 text-ice">
      <p className="text-center font-display text-3xl font-semibold tracking-tight [font-variation-settings:'opsz'_144] sm:text-4xl lg:text-[5rem] lg:leading-none">
        <span className="tabular-nums">{sectionNumber(id)}</span> — {label}
      </p>
    </div>
  );
}

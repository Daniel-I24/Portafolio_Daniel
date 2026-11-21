"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { HEADER_OFFSET, smoothScroll } from "./MotionProvider";
import { SECTIONS, sectionNumber, type SectionId } from "./Section";

const EVENT = "section-curtain";
const EASE = [0.76, 0, 0.24, 1] as const;
const COVER = 0.32; // s · cover + hold + lift stays under 900 ms
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

type Phase = { id: SectionId; step: "cover" | "lift"; fast?: boolean };

/** Rust curtain with the section number and name: rises, the page jumps behind it, then it lifts. Click or Esc skips. */
export function SectionCurtain() {
  const [phase, setPhase] = useState<Phase | null>(null);
  const arrived = useRef(false);

  useEffect(() => {
    const onGo = (event: Event) => {
      arrived.current = false;
      setPhase({ id: (event as CustomEvent<SectionId>).detail, step: "cover" });
    };
    window.addEventListener(EVENT, onGo);
    return () => window.removeEventListener(EVENT, onGo);
  }, []);

  const land = (fast = false) => {
    if (!phase) return;
    if (!arrived.current) { arrived.current = true; arrive(phase.id); }
    setPhase({ ...phase, step: "lift", fast });
  };

  useEffect(() => {
    if (!phase) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && land(true);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!phase) return null;
  const label = SECTIONS.find((section) => section.id === phase.id)?.label;
  const lifting = phase.step === "lift";

  return (
    <motion.div aria-hidden onClick={() => land(true)}
      initial={{ y: "100%" }} animate={{ y: lifting ? "-100%" : "0%" }}
      transition={{ duration: lifting && phase.fast ? 0.2 : COVER, ease: EASE, delay: lifting && !phase.fast ? HOLD / 1000 : 0 }}
      onAnimationComplete={() => (lifting ? setPhase(null) : land())}
      className="fixed inset-0 z-[70] grid cursor-pointer place-items-center bg-rust px-4 text-card">
      <p className="text-center font-display text-3xl font-semibold tracking-tight [font-variation-settings:'opsz'_144] sm:text-4xl lg:text-[5rem] lg:leading-none">
        <span className="tabular-nums">{sectionNumber(phase.id)}</span> — {label}
      </p>
    </motion.div>
  );
}

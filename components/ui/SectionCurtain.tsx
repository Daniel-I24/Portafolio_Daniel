"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { HEADER_OFFSET, smoothScroll } from "./MotionProvider";
import { SECTIONS, sectionNumber, type SectionId } from "./Section";

const EVENT = "section-curtain";
const EASE = "cubic-bezier(0.76, 0, 0.24, 1)";
// One appearance of about 900 ms: rise (280) · hold so "04 — Proyectos" can be read (380) · fade away (240).
const RISE = 280;
const HOLD = 380;
const FADE = 240;

/** Module-level guard: a second click, a re-mount or a duplicated listener never starts a second curtain. */
let running = false;

const isCalm = () => {
  const { motion: pref } = document.documentElement.dataset;
  return pref === "off" || (!pref && matchMedia("(prefers-reduced-motion: reduce)").matches);
};

/** Jumps (never glides) to the section and hands it keyboard focus. */
function arrive(id: SectionId) {
  const target = document.getElementById(id);
  if (!target) return;
  if (smoothScroll.current) smoothScroll.current.scrollTo(target, { immediate: true, force: true, offset: -HEADER_OFFSET });
  else target.scrollIntoView({ behavior: "instant" });
  // replaceState: no hashchange, no extra history entry per menu click.
  history.replaceState(history.state, "", `#${id}`);
  if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
  target.classList.add("outline-none");
  target.focus({ preventScroll: true });
}

/**
 * Click handler for menu links only (desktop bar and mobile panel). Scrolling and the active-section
 * observer never call it, so they can never raise the curtain. Calm: the plain jump, then focus.
 */
export function goToSection(event: MouseEvent<HTMLAnchorElement>, id: SectionId) {
  event.preventDefault();
  event.stopPropagation(); // keeps Lenis from also gliding to the anchor
  if (isCalm()) return arrive(id);
  if (running) return;
  running = true;
  window.dispatchEvent(new CustomEvent<SectionId>(EVENT, { detail: id }));
}

/** Navy curtain with the section number and name: rises, the page jumps behind it, then it fades. Click or Esc skips. */
export function SectionCurtain() {
  const [id, setId] = useState<SectionId | null>(null);
  const curtain = useRef<HTMLDivElement>(null);
  const animation = useRef<Animation | null>(null);

  useEffect(() => {
    const onGo = (event: Event) => setId((event as CustomEvent<SectionId>).detail);
    window.addEventListener(EVENT, onGo);
    return () => window.removeEventListener(EVENT, onGo);
  }, []);

  useEffect(() => {
    const el = curtain.current;
    if (!id || !el) return;
    let done = false;
    let landed = false;
    const land = () => { if (!landed) { landed = true; arrive(id); } };
    const finish = () => {
      if (done) return;
      done = true;
      land();
      running = false;
      setId(null);
    };
    const total = RISE + HOLD + FADE;
    // A single keyframe track: no chained tweens that could replay. The jump happens while the curtain covers.
    animation.current = el.animate([
      { transform: "translateY(100%)", opacity: 1, easing: EASE },
      { transform: "translateY(0%)", opacity: 1, offset: RISE / total },
      { transform: "translateY(0%)", opacity: 1, offset: (RISE + HOLD) / total, easing: "ease-in" },
      { transform: "translateY(-4%)", opacity: 0 },
    ], { duration: total, fill: "forwards" });
    const jump = setTimeout(land, RISE + 40);
    animation.current.finished.then(finish, () => {});
    const skip = () => { clearTimeout(jump); animation.current?.cancel(); finish(); };
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && skip();
    el.addEventListener("click", skip);
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(jump);
      el.removeEventListener("click", skip);
      window.removeEventListener("keydown", onKey);
      animation.current?.cancel();
      running = false;
    };
  }, [id]);

  if (!id) return null;
  const label = SECTIONS.find((section) => section.id === id)?.label;

  return (
    <div ref={curtain} aria-hidden style={{ transform: "translateY(100%)" }} data-curtain
      className="fixed inset-0 z-[70] grid cursor-pointer place-items-center bg-navy px-4 text-ice">
      <p className="text-center font-display text-3xl font-semibold tracking-tight [font-variation-settings:'opsz'_144] sm:text-4xl lg:text-[5rem] lg:leading-none">
        <span className="tabular-nums">{sectionNumber(id)}</span> — {label}
      </p>
    </div>
  );
}

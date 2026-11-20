"use client";

import type { AnimationEvent } from "react";

interface IntroProps {
  name: string;
  role: string;
}

const initials = (name: string) => name.split(/\s+/).slice(0, 2).map((word) => word[0]).join("");

/** Remembers the intro for this visit and hands focus to the page. */
function finish(focusMain: boolean) {
  try {
    sessionStorage.setItem("intro", "seen");
  } catch {
    // Private mode: the intro may show again on the next visit, nothing else breaks.
  }
  document.documentElement.dataset.intro = "seen";
  if (focusMain) document.getElementById("contenido")?.focus({ preventScroll: true });
}

/**
 * First-visit curtain. CSS runs it (so it also leaves without JS): the bar fills, then the curtain lifts
 * and the hero rises behind it. The inline script in app/layout.tsx skips it on later visits,
 * with reduced motion and when animations are off.
 */
export function Intro({ name, role }: IntroProps) {
  const onEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && event.animationName === "curtain") finish(false);
  };
  const skip = () => {
    document.documentElement.dataset.intro = "skip";
    finish(true);
  };

  return (
    <div role="region" aria-label="Introducción" onAnimationEnd={onEnd}
      className="intro-curtain fixed inset-0 z-[60] flex flex-col bg-ink text-card">
      <div className="flex justify-end gap-3 p-4 sm:p-8">
        <a href="#contenido" onClick={skip} className="rounded-full px-4 py-2.5 text-sm font-semibold underline decoration-card/40 underline-offset-4 hover:decoration-card">
          Saltar al contenido
        </a>
        <button type="button" onClick={skip} className="rounded-full border border-card/50 px-4 py-2.5 text-sm font-semibold transition-colors duration-150 hover:bg-card hover:text-ink">
          Saltar intro
        </button>
      </div>
      <div className="grid flex-1 place-items-center px-4 pb-24">
        <div className="text-center">
          <p aria-hidden className="font-display text-[clamp(5rem,18vw,10rem)] font-semibold leading-none [font-variation-settings:'opsz'_144]">
            {initials(name)}
          </p>
          <p className="mt-6 text-sm font-medium uppercase tracking-[0.2em]">{name}</p>
          <p className="mt-2 text-sm text-card/80">{role}</p>
          <span aria-hidden className="intro-bar mx-auto mt-8 block h-0.5 w-40 bg-marigold" />
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, type AnimationEvent, type CSSProperties } from "react";

/** Where each wax shape ends (around the D and I strokes, in rem) and where it starts (viewport units). */
const SHAPES = [
  { x: -4, y: -3.2, fx: "-40vw", fy: "-38vh", s: 10 },
  { x: -4.4, y: 0.4, fx: "-46vw", fy: "8vh", s: 11 },
  { x: -3.6, y: 3.6, fx: "-30vw", fy: "42vh", s: 10 },
  { x: -0.4, y: -2.6, fx: "8vw", fy: "-46vh", s: 9 },
  { x: 0.4, y: 2.2, fx: "16vw", fy: "44vh", s: 10 },
  { x: 4, y: -3, fx: "44vw", fy: "-30vh", s: 8 },
  { x: 4.2, y: 0.4, fx: "48vw", fy: "6vh", s: 9 },
  { x: 4, y: 3.4, fx: "38vw", fy: "40vh", s: 8 },
];

const shapeStyle = ({ x, y, fx, fy, s }: (typeof SHAPES)[number], i: number) =>
  ({
    width: `${s}rem`,
    height: `${s}rem`,
    left: `calc(50% + ${x}rem - ${s / 2}rem)`,
    top: `calc(50% + ${y}rem - ${s / 2}rem)`,
    backgroundImage: `radial-gradient(closest-side, ${i % 2 ? "rgb(114 152 175 / 0.7)" : "rgb(0 70 113 / 0.95)"} 0%, ${i % 2 ? "rgb(114 152 175 / 0.35)" : "rgb(0 70 113 / 0.5)"} 50%, transparent)`,
    animationDelay: `${i * 30}ms`,
    "--fx": fx,
    "--fy": fy,
  }) as CSSProperties;

/** Remembers the loader for this visit; after a skip, hands focus to the page. */
function finish(focusMain: boolean) {
  try {
    sessionStorage.setItem("intro", "seen");
  } catch {
    // Private mode: the loader may show again on the next visit, nothing else breaks.
  }
  document.documentElement.dataset.intro = "seen";
  if (focusMain) document.getElementById("contenido")?.focus({ preventScroll: true });
}

function skip() {
  if (document.documentElement.dataset.intro === "seen") return;
  document.documentElement.dataset.intro = "skip";
  finish(true);
}

/**
 * First-visit loader (≤ 1.6 s, CSS-driven so it also leaves without JS): lava shapes gather into the "DI"
 * monogram while a counter runs 0 → 100, then it dissolves over the hero, which is already painted underneath.
 * Click, the button or Esc skips it. app/layout.tsx skips it on later visits and when animations are off.
 */
export function Loader({ initials }: { initials: string }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && skip();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const onEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && event.animationName === "loader-out") finish(false);
  };

  return (
    <div role="region" aria-label="Cargando" onClick={skip} onAnimationEnd={onEnd}
      className="loader fixed inset-0 z-[60] cursor-pointer overflow-hidden bg-abyss text-ice">
      {SHAPES.map((shape, i) => <span key={i} aria-hidden className="loader-gather absolute rounded-full" style={shapeStyle(shape, i)} />)}
      <p aria-hidden className="loader-mark absolute inset-0 grid place-items-center font-display text-[clamp(5rem,18vw,9rem)] font-semibold leading-none [font-variation-settings:'opsz'_144] [text-shadow:0_0_24px_var(--color-steel)]">
        {initials}
      </p>
      <p aria-hidden className="loader-count absolute inset-x-0 bottom-12 text-center font-display text-2xl tabular-nums text-mist" />
      <button type="button" onClick={skip}
        className="absolute right-4 top-4 rounded-full border border-mist/60 px-4 py-2.5 text-sm font-semibold transition-colors duration-150 hover:bg-ice hover:text-abyss sm:right-8 sm:top-8">
        Saltar intro
      </button>
    </div>
  );
}

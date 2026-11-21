"use client";

import { useEffect, useRef } from "react";
import { useCalm } from "./MotionProvider";

const SPEED = 70; // px per second
const CRAWL = 0.08; // share of the speed kept under the cursor
const BRAKE_MS = 450;
const COPIES = 4; // per half: enough to cover a 1920 px screen twice

/** Words alternate filled and outlined in the light tones (ice 17:1, sky 10:1 on abyss), lit like LED tubes. */
const STYLES = [
  "text-ice [text-shadow:0_0_18px_var(--color-steel)]",
  "text-transparent [-webkit-text-stroke:1.5px_var(--color-sky)]",
  "text-sky [text-shadow:0_0_18px_var(--color-navy)]",
  "text-transparent [-webkit-text-stroke:1.5px_var(--color-mist)]",
];

/**
 * LED-style band that scrolls right to left forever. The track holds two identical halves and moves by exactly
 * -50 %, so the loop has no visible jump. It runs as a Web Animation on the compositor (no per-frame JS);
 * JS only eases the playback rate down to a crawl under the cursor. Calm: still.
 * Decorative (it repeats the hero role), so assistive tech skips it.
 */
export function Marquee({ text }: { text: string }) {
  const calm = useCalm();
  const track = useRef<HTMLDivElement>(null);
  const loop = useRef<Animation | null>(null);
  const ramp = useRef(0);

  useEffect(() => {
    const element = track.current;
    if (calm || !element) return;
    const duration = (element.scrollWidth / 2 / SPEED) * 1000;
    const animation = element.animate([{ transform: "translateX(0)" }, { transform: "translateX(-50%)" }], { duration, iterations: Infinity });
    loop.current = animation;
    return () => { cancelAnimationFrame(ramp.current); animation.cancel(); loop.current = null; };
  }, [calm]);

  /** Eases the playback rate toward `target` over BRAKE_MS (a few frames of JS, only on hover changes). */
  const brakeTo = (target: number) => {
    const animation = loop.current;
    if (!animation) return;
    cancelAnimationFrame(ramp.current);
    const from = animation.playbackRate;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / BRAKE_MS);
      animation.updatePlaybackRate(from + (target - from) * (1 - (1 - t) ** 3));
      if (t < 1) ramp.current = requestAnimationFrame(step);
    };
    ramp.current = requestAnimationFrame(step);
  };

  const items = Array.from({ length: COPIES }, (_, i) => (
    <span key={i} className="flex shrink-0 items-center">
      <span className={`px-6 sm:px-10 ${STYLES[i % STYLES.length]}`}>{text}</span>
      <span className="size-3 rotate-45 bg-steel shadow-glow sm:size-4" />
    </span>
  ));

  return (
    <div aria-hidden onPointerEnter={() => brakeTo(CRAWL)} onPointerLeave={() => brakeTo(1)}
      className="overflow-hidden border-y border-line bg-abyss/80 py-5 sm:py-7">
      <div ref={track} className="flex w-max font-display text-3xl font-semibold uppercase leading-none tracking-[0.02em] whitespace-nowrap [font-variation-settings:'opsz'_144] will-change-transform sm:text-4xl lg:text-[4.5rem]">
        <div className="flex">{items}</div>
        <div className="flex">{items}</div>
      </div>
    </div>
  );
}

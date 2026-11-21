"use client";

import { motion, useAnimationFrame, useMotionValue } from "motion/react";
import { useRef } from "react";
import { useCalm } from "./MotionProvider";

const SPEED = 70; // px per second
const COPIES = 4; // per half: enough to cover a 1920 px screen twice

/** Words alternate filled and outlined, in the coral → amber tones (6.2:1 and 8.5:1 on ink). */
const STYLES = [
  "text-amber",
  "text-transparent [-webkit-text-stroke:1.5px_var(--color-coral)]",
  "text-coral",
  "text-transparent [-webkit-text-stroke:1.5px_var(--color-amber)]",
];

/**
 * LED-style band that scrolls right to left forever. Two identical halves wrap at exactly one half's width,
 * so there is no visible jump. The speed eases down to a crawl under the cursor; calm: still.
 * Decorative (it repeats the hero role), so assistive tech skips it.
 */
export function Marquee({ text }: { text: string }) {
  const calm = useCalm();
  const half = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const speed = useRef(SPEED);
  const target = useRef(SPEED);

  useAnimationFrame((_, delta) => {
    const width = half.current?.offsetWidth ?? 0;
    if (calm || !width) return;
    speed.current += (target.current - speed.current) * Math.min(1, delta / 250);
    let next = x.get() - (speed.current * delta) / 1000;
    if (next <= -width) next += width;
    x.set(next);
  });

  const items = Array.from({ length: COPIES }, (_, i) => (
    <span key={i} className="flex shrink-0 items-center">
      <span className={`px-6 sm:px-10 ${STYLES[i % STYLES.length]}`}>{text}</span>
      <span className="size-3 rotate-45 bg-terracotta sm:size-4" />
    </span>
  ));

  return (
    <div aria-hidden onPointerEnter={() => (target.current = 6)} onPointerLeave={() => (target.current = SPEED)}
      className="overflow-hidden border-y border-ink bg-ink py-5 sm:py-7">
      <motion.div style={{ x }} className="flex w-max font-display text-3xl font-semibold uppercase leading-none tracking-[0.02em] whitespace-nowrap [font-variation-settings:'opsz'_144] sm:text-4xl lg:text-[4.5rem]">
        <div ref={half} className="flex">{items}</div>
        <div className="flex">{items}</div>
      </motion.div>
    </div>
  );
}

"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from "motion/react";
import { useEffect, useState, type PointerEvent } from "react";
import { Character } from "./Character";

const EASE = [0.16, 1, 0.3, 1] as const;
const SCENE_DONE_MS = 3200;
const DRIPS = [[78, 128, 34], [205, 132, 52], [348, 126, 28], [505, 130, 44], [176, 268, 40], [318, 270, 58], [452, 266, 30]];
const LINES = [
  { y: 125, x: 20, length: 560, rotate: "-6 4 -3 6 -4 5 -2" },
  { y: 268, x: 110, length: 420, rotate: "5 -4 6 -5 3 -3" },
];

function useLayer(sx: MotionValue<number>, sy: MotionValue<number>, depth: number) {
  return { x: useTransform(sx, (v) => v * depth), y: useTransform(sy, (v) => v * depth) };
}

/** Hero scene: Dani paints the name while the hooded artist paints a mini-Dani that comes alive. */
export default function GraffitiWall({ name, fullName }: { name: string; fullName: string }) {
  const reduced = useReducedMotion() ?? false;
  const [alive, setAlive] = useState(false);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 80, damping: 20 });
  const sy = useSpring(my, { stiffness: 80, damping: 20 });
  const back = useLayer(sx, sy, -8);
  const mid = useLayer(sx, sy, 10);
  const front = useLayer(sx, sy, 22);
  const words = name.toUpperCase().split(/\s+/).slice(0, 2);

  useEffect(() => {
    if (reduced) return setAlive(true);
    const timer = setTimeout(() => setAlive(true), SCENE_DONE_MS);
    return () => clearTimeout(timer);
  }, [reduced]);

  const timing = (delay: number, duration: number) => (reduced ? { duration: 0 } : { delay, duration, ease: EASE });
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (reduced || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    mx.set((event.clientX - rect.left) / rect.width - 0.5);
    my.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  return (
    <div onPointerMove={onPointerMove} onPointerLeave={() => { mx.set(0); my.set(0); }}
      className="texture-concrete relative aspect-[4/5] overflow-hidden border-[3px] border-ink bg-concrete shadow-sticker-lg sm:aspect-[16/10] lg:aspect-[16/8]">
      <motion.div aria-hidden style={back} className="texture-cracks absolute -inset-6">
        <div className="shape-splat absolute left-[8%] top-[10%] size-40 bg-denim/50" />
        <div className="shape-splat absolute right-[6%] top-[4%] size-28 rotate-45 bg-spray-red/35" />
        <div className="shape-splat absolute bottom-[14%] left-[42%] size-52 -rotate-12 bg-mustard/25" />
      </motion.div>

      <motion.div style={mid} className="absolute inset-0">
        <h1 className="absolute inset-x-[5%] top-[5%] sm:left-[24%] sm:right-[3%] sm:top-[6%]">
          <span className="sr-only">{fullName}</span>
          <svg aria-hidden viewBox="0 0 600 300" className="w-full overflow-visible font-spray">
            <defs>
              <linearGradient id="name-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0.48" stopColor="var(--color-mustard)" />
                <stop offset="0.48" stopColor="var(--color-hoodie)" />
              </linearGradient>
            </defs>
            {DRIPS.map(([x, y, h], i) => (
              <motion.path key={i} d={`M${x} ${y}v${h}`} stroke="var(--color-hoodie)" strokeWidth={9} strokeLinecap="round"
                initial={{ pathLength: reduced ? 1 : 0 }} animate={{ pathLength: 1 }} transition={timing(2.1 + i * 0.12, 1)} />
            ))}
            {words.map((word, i) => {
              const { y, x, length, rotate } = LINES[i];
              const props = { x, y, textLength: length, lengthAdjust: "spacingAndGlyphs", rotate, fontSize: 132 } as const;
              return (
                <g key={word}>
                  <motion.text {...props} fill="var(--color-ink)" transform="translate(9 9)" initial={{ opacity: reduced ? 1 : 0 }} animate={{ opacity: 1 }} transition={timing(1.5, 0.6)}>{word}</motion.text>
                  <motion.text {...props} fill="url(#name-fill)" initial={{ opacity: reduced ? 1 : 0 }} animate={{ opacity: 1 }} transition={timing(1.4 + i * 0.2, 0.7)}>{word}</motion.text>
                  <motion.text {...props} fill="none" stroke="var(--color-ink)" strokeWidth={6} strokeLinejoin="round" strokeDasharray={900}
                    initial={{ strokeDashoffset: reduced ? 0 : 900 }} animate={{ strokeDashoffset: 0 }} transition={timing(i * 0.5, 1.6)}>{word}</motion.text>
                </g>
              );
            })}
          </svg>
        </h1>
        <motion.div aria-hidden className="absolute bottom-[10%] right-[30%] w-[22%] sm:bottom-[3%] sm:right-[18%] sm:w-[9%]"
          initial={{ clipPath: reduced ? "inset(0% 0 0 0)" : "inset(100% 0 0 0)" }} animate={{ clipPath: "inset(0% 0 0 0)" }} transition={timing(0.6, 2.4)}>
          <Character pose="waving" animated={alive} className="w-full" />
        </motion.div>
      </motion.div>

      <motion.div aria-hidden style={front} className="absolute inset-0">
        <div className="absolute bottom-0 left-[2%] w-[44%] sm:w-[22%]">
          <Character pose="spraying" className="relative z-10 -mb-[18%] w-full" />
          <svg viewBox="0 0 100 80" className="w-full" fill="none" stroke="var(--color-ink)" strokeLinecap="round">
            <path d="M22 0L12 80M78 0l10 80" strokeWidth={8} />
            <path d="M22 0L12 80M78 0l10 80" stroke="var(--color-cement)" strokeWidth={4} />
            <path d="M19 20h63M17 40h67M15 60h71" strokeWidth={6} />
          </svg>
        </div>
        <div className="absolute bottom-0 right-[1%] w-[30%] -scale-x-100 sm:w-[15%]">
          <Character pose="spraying" variant="hooded" className="w-full" />
        </div>
      </motion.div>
    </div>
  );
}

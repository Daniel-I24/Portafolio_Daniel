"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ReactNode } from "react";
import { Character, type Pose } from "@/components/ui/Character";
import { SectionTitle } from "@/components/ui/SectionTitle";
import type { InterestData, InterestSlug } from "@/lib/schemas";

const POSES: Record<InterestSlug, Pose> = { voley: "volley", futbol: "football", motos: "riding", billar: "pool", musica: "headphones", deporte: "waving" };
const TILTS = [-3, 2, -1.5, 3, -2.5, 1.5];
const loop = (values: Record<string, number[]>, duration = 1): Variants => ({
  rest: Object.fromEntries(Object.keys(values).map((key) => [key, 0])),
  active: { ...values, transition: { duration, repeat: Infinity, ease: "easeInOut" } },
});
const ink = { stroke: "var(--color-ink)", strokeWidth: 3, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const ROUTE = "M18 46C30 40 28 26 42 24S60 34 72 22 86 12 88 10";

/** One micro-animation per interest; each plays while its sticker is hovered (variant "active"). */
const SCENES: Record<InterestSlug, ReactNode> = {
  voley: <><path d="M10 56h80" {...ink} stroke="var(--color-cement)" /><motion.circle cx={50} cy={14} r={9} fill="var(--color-paper)" {...ink} variants={loop({ y: [0, 33, 0, 22, 0] })} /></>,
  futbol: <><path d="M10 56h80" {...ink} stroke="var(--color-cement)" /><motion.circle cx={50} cy={44} r={9} fill="var(--color-paper)" {...ink} variants={loop({ y: [0, -28, 0] }, 0.7)} /></>,
  motos: (
    <>
      <path d="M8 50L20 14 52 6 92 18 84 54 40 58z" fill="var(--color-asphalt)" {...ink} />
      <motion.path d={ROUTE} fill="none" {...ink} stroke="var(--color-hoodie)" variants={{ rest: { pathLength: 0.15 }, active: { pathLength: 1, transition: { duration: 1.4 } } }} />
      <circle cx={88} cy={10} r={4} fill="var(--color-spray-pink)" {...ink} strokeWidth={2} />
    </>
  ),
  billar: (
    <>
      <rect x={6} y={8} width={88} height={48} rx={4} fill="var(--color-denim)" {...ink} />
      <circle cx={88} cy={14} r={7} fill="var(--color-ink)" />
      <motion.g variants={{ rest: { x: 0, y: 0, scale: 1 }, active: { x: 38, y: -18, scale: 0.4, transition: { duration: 0.6, ease: "easeIn" } } }}>
        <circle cx={50} cy={32} r={9} fill="var(--color-ink)" />
        <circle cx={50} cy={32} r={4} fill="var(--color-paper)" />
      </motion.g>
    </>
  ),
  musica: (
    <>
      <rect x={14} y={14} width={72} height={42} rx={6} fill="var(--color-spray-pink)" {...ink} />
      {[30, 40, 50, 60, 70].map((x, i) => (
        <motion.rect key={x} x={x - 3} y={24} width={6} height={24} fill="var(--color-mustard)" style={{ originY: 1 }}
          variants={{ rest: { scaleY: 0.4 }, active: { scaleY: [0.3, 1, 0.5, 0.9, 0.3], transition: { duration: 0.8, repeat: Infinity, delay: i * 0.1 } } }} />
      ))}
    </>
  ),
  deporte: <motion.path d="M6 34h22l6-16 10 30 8-22 6 8h36" fill="none" {...ink} stroke="var(--color-hoodie)" variants={{ rest: { pathLength: 1 }, active: { pathLength: [0, 1], transition: { duration: 1, repeat: Infinity } } }} />,
};

export function OffTheClock({ interests }: { interests: InterestData[] }) {
  const reduced = useReducedMotion();
  return (
    <section id="mas-alla-del-codigo" aria-labelledby="mas-alla-title" className="scroll-mt-16 px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <SectionTitle id="mas-alla-title" kicker="Lo que disfruto cuando no estoy programando" tone="hoodie">Más allá del código</SectionTitle>

        <ul className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {interests.map((interest, i) => (
            <motion.li key={interest.id} initial="rest" animate="rest" whileHover={reduced ? undefined : "active"}
              style={{ rotate: TILTS[i % TILTS.length] }}
              className="sticker-cut flex items-center gap-4 bg-concrete p-4 text-paper">
              <Character pose={POSES[interest.slug]} className="w-24 shrink-0" />
              <div className="min-w-0">
                <svg aria-hidden viewBox="0 0 100 60" className="w-28">{SCENES[interest.slug]}</svg>
                <h3 className="mt-2 font-marker text-2xl">{interest.title}</h3>
                <p className="text-sm leading-snug">{interest.note}</p>
                {interest.playlistUrl && (
                  <a href={interest.playlistUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block font-mono text-sm text-denim underline decoration-2">
                    Mi playlist<span className="sr-only"> (abre en una pestaña nueva)</span>
                  </a>
                )}
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}

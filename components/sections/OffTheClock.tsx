"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ReactNode } from "react";
import { Character, type Pose } from "@/components/ui/Character";
import { Reveal } from "@/components/ui/Reveal";
import { SectionTitle } from "@/components/ui/SectionTitle";
import type { InterestData, InterestSlug, SkillData, SkillLevel } from "@/lib/schemas";

export type SkillView = SkillData & { levelLabel: string; fill: number };

const POSES: Record<InterestSlug, Pose> = { voley: "volley", futbol: "football", motos: "riding", billar: "pool", musica: "headphones", deporte: "waving" };
const TILTS = [-3, 2, -1.5, 3, -2.5, 1.5];
const PAINT: Record<SkillLevel, string> = { 3: "var(--color-hoodie)", 2: "var(--color-mustard)", 1: "var(--color-denim)" };
const loop = (values: Record<string, number[]>, duration = 1): Variants => ({
  rest: Object.fromEntries(Object.keys(values).map((key) => [key, 0])),
  active: { ...values, transition: { duration, repeat: Infinity, ease: "easeInOut" } },
});
const ink = { stroke: "var(--color-ink)", strokeWidth: 3, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const ROUTE = "M18 46C30 40 28 26 42 24S60 34 72 22 86 12 88 10";

/** One micro-animation per interest; each plays while its sticker is hovered (variant "active"). */
const SCENES: Record<InterestSlug, ReactNode> = {
  voley: <><path d="M10 56h80" {...ink} /><motion.circle cx={50} cy={14} r={9} fill="var(--color-paper)" {...ink} variants={loop({ y: [0, 33, 0, 22, 0] })} /></>,
  futbol: <><path d="M10 56h80" {...ink} /><motion.circle cx={50} cy={44} r={9} fill="var(--color-paper)" {...ink} variants={loop({ y: [0, -28, 0] }, 0.7)} /></>,
  motos: (
    <>
      <path d="M8 50L20 14 52 6 92 18 84 54 40 58z" fill="var(--color-concrete)" {...ink} />
      <motion.path d={ROUTE} fill="none" {...ink} stroke="var(--color-hoodie)" variants={{ rest: { pathLength: 0.15 }, active: { pathLength: 1, transition: { duration: 1.4 } } }} />
      <circle cx={88} cy={10} r={4} fill="var(--color-spray-red)" {...ink} strokeWidth={2} />
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
      <rect x={14} y={14} width={72} height={42} rx={6} fill="var(--color-spray-red)" {...ink} />
      {[30, 40, 50, 60, 70].map((x, i) => (
        <motion.rect key={x} x={x - 3} y={24} width={6} height={24} fill="var(--color-mustard)" style={{ originY: 1 }}
          variants={{ rest: { scaleY: 0.4 }, active: { scaleY: [0.3, 1, 0.5, 0.9, 0.3], transition: { duration: 0.8, repeat: Infinity, delay: i * 0.1 } } }} />
      ))}
    </>
  ),
  deporte: <motion.path d="M6 34h22l6-16 10 30 8-22 6 8h36" fill="none" {...ink} stroke="var(--color-hoodie)" variants={{ rest: { pathLength: 1 }, active: { pathLength: [0, 1], transition: { duration: 1, repeat: Infinity } } }} />,
};

function SprayCan({ skill }: { skill: SkillView }) {
  const reduced = useReducedMotion();
  const height = 62 * skill.fill;
  return (
    <svg aria-hidden viewBox="0 0 40 90" className="h-20 w-9 shrink-0">
      <rect x={14} y={2} width={12} height={10} fill="var(--color-cement)" {...ink} />
      <motion.rect x={6} y={84 - height} width={28} height={height} fill={PAINT[skill.level]} style={{ originY: 1 }}
        initial={reduced ? false : { scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} />
      <rect x={6} y={14} width={28} height={70} rx={5} fill="none" {...ink} />
    </svg>
  );
}

export function OffTheClock({ interests, skills }: { interests: InterestData[]; skills: SkillView[] }) {
  const reduced = useReducedMotion();
  return (
    <section id="fuera-del-codigo" aria-labelledby="fuera-title" className="scroll-mt-16 px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <SectionTitle id="fuera-title" kicker="cuando cierro el portátil" tone="hoodie">Fuera del código</SectionTitle>

        <ul className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {interests.map((interest, i) => (
            <motion.li key={interest.id} initial="rest" animate="rest" whileHover={reduced ? undefined : "active"}
              style={{ rotate: TILTS[i % TILTS.length] }}
              className="sticker-cut flex items-center gap-4 bg-paper p-4 text-ink">
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

        <Reveal className="mt-24">
          <h3 className="font-spray text-4xl text-paper">Mis latas de habilidades</h3>
          <p className="mt-2 font-mono text-sm text-cement">Más pintura, más dominio: Avanzado · Intermedio · Aprendiendo.</p>
          <ul className="mt-10 grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
            {skills.map((skill) => (
              <li key={skill.id} className="flex items-center gap-3">
                <SprayCan skill={skill} />
                <p>
                  <span className="block font-mono text-xs uppercase text-cement">{skill.group}</span>
                  <span className="block font-marker text-lg leading-tight text-paper">{skill.name}</span>
                  <span className="block text-sm font-semibold text-mustard">{skill.levelLabel}</span>
                </p>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

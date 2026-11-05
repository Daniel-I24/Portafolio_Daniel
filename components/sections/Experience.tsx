"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import { useRef, useState, type KeyboardEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { SectionTitle } from "@/components/ui/SectionTitle";
import type { Accent, IconName } from "@/lib/domain";
import type { ExperienceData } from "@/lib/schemas";

/** Polymorphic values (badge, accent, icon) are resolved on the server by each Experience subclass. */
export type ExperienceView = ExperienceData & { badge: string; accent: Accent; icon: IconName };

const ACCENT_BG: Record<Accent, string> = {
  hoodie: "bg-hoodie", mustard: "bg-mustard", denim: "bg-denim", "spray-pink": "bg-spray-pink", slime: "bg-slime",
};

export function Experience({ items }: { items: ExperienceView[] }) {
  const reduced = useReducedMotion();
  const groups = [...new Set(items.map((item) => item.badge))];
  const [active, setActive] = useState(groups[0]);
  const listRef = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 80%", "end 60%"] });
  const pathLength = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const visible = items.filter((item) => item.badge === active);

  const onTabKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    const nextGroup = groups[(groups.indexOf(active) + step + groups.length) % groups.length];
    setActive(nextGroup);
    document.getElementById(`tab-${groups.indexOf(nextGroup)}`)?.focus();
  };

  return (
    <section id="experiencia" aria-labelledby="experiencia-title" className="scroll-mt-16 px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <SectionTitle id="experiencia-title" kicker="el recorrido, tag por tag">Experiencia</SectionTitle>

        <div role="tablist" aria-label="Tipo de experiencia" className="mt-10 flex flex-wrap gap-3">
          {groups.map((group, i) => (
            <button key={group} id={`tab-${i}`} role="tab" type="button" aria-selected={group === active} aria-controls="experiencia-panel"
              tabIndex={group === active ? 0 : -1} onClick={() => setActive(group)} onKeyDown={onTabKey}
              className={`border-[3px] border-ink px-4 py-2 font-marker text-lg shadow-sticker transition-transform duration-150 ${group === active ? "-rotate-2 bg-denim text-ink" : "bg-paper text-ink hover:-rotate-1"}`}>
              {group}
            </button>
          ))}
        </div>

        <div id="experiencia-panel" role="tabpanel" aria-labelledby={`tab-${groups.indexOf(active)}`} className="relative mt-12">
          <svg aria-hidden viewBox="0 0 40 100" preserveAspectRatio="none" className="absolute bottom-0 left-0 top-0 h-full w-10">
            <path d="M20 0C34 15 6 30 20 45S34 75 20 100" fill="none" stroke="var(--color-ink)" strokeWidth={12} vectorEffect="non-scaling-stroke" opacity={0.5} />
            <motion.path d="M20 0C34 15 6 30 20 45S34 75 20 100" fill="none" stroke="var(--color-denim)" strokeWidth={7} strokeLinecap="round"
              vectorEffect="non-scaling-stroke" style={{ pathLength: reduced ? 1 : pathLength }} />
          </svg>
          <ol ref={listRef} className="space-y-10">
            {visible.map((item, i) => (
              <li key={item.id} className="relative pl-16">
                <span aria-hidden className={`shape-splat absolute left-0 top-2 grid size-10 place-items-center text-ink ${ACCENT_BG[item.accent]}`}>
                  <Icon name={item.icon} size={20} />
                </span>
                <Reveal delay={i * 0.05}>
                  <article className={`border-[3px] border-ink bg-paper p-5 text-ink shadow-sticker ${i % 2 ? "rotate-[0.6deg]" : "-rotate-[0.6deg]"}`}>
                    <p className={`inline-block -rotate-2 border-2 border-ink px-2 py-0.5 font-mono text-sm font-bold text-ink ${ACCENT_BG[item.accent]}`}>
                      <span className="sr-only">Periodo: </span>{item.period}
                    </p>
                    <h3 className="mt-3 text-lg font-extrabold leading-snug sm:text-xl">{item.title}</h3>
                    {item.place && <p className="mt-1 font-mono text-sm text-concrete">{item.place}</p>}
                    {item.summary && <p className="mt-3 leading-relaxed">{item.summary}</p>}
                  </article>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

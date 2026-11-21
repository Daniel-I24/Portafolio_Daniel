"use client";

import { useState, type KeyboardEvent } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import type { Accent, IconName } from "@/lib/domain";
import type { ExperienceData } from "@/lib/schemas";

/** Polymorphic values (badge, accent, icon) are resolved on the server by each Experience subclass. */
export type ExperienceView = ExperienceData & { badge: string; accent: Accent; icon: IconName };

const DOT: Record<Accent, string> = { rust: "bg-rust", pine: "bg-pine" };
const TEXT: Record<Accent, string> = { rust: "text-rust", pine: "text-pine" };
/** Tab order the visitor expects; any other badge goes after these. */
const PREFERRED = ["Académica", "Laboral"];

export function Experience({ items }: { items: ExperienceView[] }) {
  const groups = [...new Set(items.map((item) => item.badge))].sort((a, b) => {
    const rank = (badge: string) => (PREFERRED.includes(badge) ? PREFERRED.indexOf(badge) : PREFERRED.length);
    return rank(a) - rank(b);
  });
  const [active, setActive] = useState(groups[0]);
  const visible = items.filter((item) => item.badge === active);

  const onKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    const next = (groups.indexOf(active) + step + groups.length) % groups.length;
    setActive(groups[next]);
    document.getElementById(`exp-tab-${next}`)?.focus();
  };

  const tabs = (
    <div role="tablist" aria-label="Tipo de experiencia" className="inline-flex rounded-full border border-line bg-card p-1">
      {groups.map((group, i) => (
        <button key={group} id={`exp-tab-${i}`} role="tab" type="button" aria-selected={group === active} aria-controls="exp-panel"
          tabIndex={group === active ? 0 : -1} onClick={() => setActive(group)} onKeyDown={onKey}
          className="rounded-full px-5 py-2.5 text-sm font-semibold text-muted transition-colors duration-150 hover:text-ink aria-selected:bg-ink aria-selected:text-card">
          {group}
          <span className="ml-2 tabular-nums">{items.filter((item) => item.badge === group).length}</span>
        </button>
      ))}
    </div>
  );

  return (
    <Section id="experiencia" title="Experiencia" lead="Formación académica y proyectos en los que he trabajado." aside={tabs}>
      <div id="exp-panel" role="tabpanel" aria-labelledby={`exp-tab-${groups.indexOf(active)}`} tabIndex={0} className="max-w-3xl rounded-sm">
        <ol key={active} className="relative border-l border-line">
          {visible.map((item, i) => (
            <Reveal as="li" key={item.id} index={i} className="relative pb-10 pl-8 last:pb-0 sm:pl-12">
              <span aria-hidden className={`absolute -left-[7px] top-1.5 size-3.5 rounded-full ring-4 ring-paper ${DOT[item.accent]}`} />
              <p className={`text-sm font-semibold tabular-nums ${TEXT[item.accent]}`}>
                <span className="sr-only">Periodo: </span>{item.period}
              </p>
              <h3 className="mt-1.5 font-display text-lg font-semibold leading-snug sm:text-xl">{item.title}</h3>
              {item.place && <p className="mt-1 text-sm text-muted">{item.place}</p>}
              {item.summary && <p className="mt-3 text-muted">{item.summary}</p>}
            </Reveal>
          ))}
        </ol>
      </div>
    </Section>
  );
}

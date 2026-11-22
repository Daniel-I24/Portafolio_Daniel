"use client";

import { useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Gallery } from "@/components/ui/Gallery";
import { Modal } from "@/components/ui/Modal";
import { Reveal } from "@/components/ui/Reveal";
import { useCalm } from "@/components/ui/MotionProvider";
import { meta, ProjectCard, ProjectDetail, type ProjectView } from "@/components/ui/ProjectCard";
import { Section } from "@/components/ui/Section";
import { PLATFORM_LABELS } from "@/lib/domain";
import type { Platform } from "@/lib/schemas";
import { TechIndex } from "@/lib/structures";

export type { ProjectView };

const PLATFORMS = Object.keys(PLATFORM_LABELS) as Platform[];
const OPEN_NAME = "project-detail";

/**
 * Runs a state change inside a native view transition (cards glide to their new places, the detail grows
 * from its card). Browsers without the API, and calm mode, just apply the change.
 */
function transition(calm: boolean, change: () => void): Promise<void> {
  if (calm || !document.startViewTransition) { change(); return Promise.resolve(); }
  return document.startViewTransition(() => flushSync(change)).finished;
}

/** Filter chips by platform, each with its counter (TechIndex keyed by platform; a project can count under several). */
function PlatformFilter({ index, value, onChange }: { index: TechIndex<ProjectView>; value: Platform | null; onChange: (platform: Platform | null) => void }) {
  const options = [null, ...PLATFORMS.filter((platform) => index.count(platform) > 0)];
  return (
    <div role="group" aria-label="Filtrar por plataforma" className="flex flex-wrap gap-2">
      {options.map((option) => {
        const pressed = value === option;
        return (
          <button key={option ?? "all"} type="button" aria-pressed={pressed} onClick={() => onChange(option)}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors duration-150 ${pressed ? "border-ice bg-ice text-abyss" : "border-line bg-deep text-ice hover:border-steel"}`}>
            {option ? PLATFORM_LABELS[option] : "Todos"}
            <span className={`rounded-full px-2 py-0.5 text-sm tabular-nums ${pressed ? "bg-deep text-ice" : "bg-abyss text-mist"}`}>{index.count(option)}</span>
          </button>
        );
      })}
    </div>
  );
}

export function Projects({ projects }: { projects: ProjectView[] }) {
  const calm = useCalm();
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [selected, setSelected] = useState<ProjectView | null>(null);
  const origin = useRef<HTMLElement | null>(null);
  const index = useMemo(() => new TechIndex(projects, (project) => project.platforms), [projects]);
  const visible = index.filter(platform);

  const filter = (next: Platform | null) => void transition(calm, () => setPlatform(next));

  // The card hands its name to the dialog: the transition morphs one into the other, and back on close.
  const open = (project: ProjectView, card: HTMLElement) => {
    origin.current = card;
    card.style.viewTransitionName = OPEN_NAME;
    void transition(calm, () => { card.style.viewTransitionName = ""; setSelected(project); });
  };
  const close = () => {
    const card = origin.current;
    if (!card) return; // the native "close" event also lands here after we close it ourselves
    origin.current = null;
    void transition(calm, () => { setSelected(null); card.style.viewTransitionName = OPEN_NAME; })
      .finally(() => { card.style.viewTransitionName = ""; card.querySelector<HTMLElement>("button[aria-label]")?.focus(); });
  };

  return (
    <Section id="proyectos" title="Proyectos" lead="Web, móvil, wearables, escritorio, videojuegos y APIs: lo que he construido, solo y en equipo."
      aside={<PlatformFilter index={index} value={platform} onChange={filter} />}>
      <p className="sr-only" aria-live="polite">{`Mostrando ${visible.length} proyectos`}</p>
      {/* The whole row enters and leaves with the scroll (its cards live in a horizontal scroller). */}
      <Reveal>
      <Gallery label="Galería de proyectos" count={visible.length} resetKey={platform ?? "all"}>
        {visible.map((project, i) => (
          <li key={project.id} style={{ viewTransitionName: `project-${project.slug}` }}
            className={`w-[82vw] max-w-[23rem] shrink-0 snap-start sm:w-[22rem] ${i % 2 ? "lg:mt-10" : ""}`}>
            <ProjectCard project={project} onOpen={(card) => open(project, card)} />
          </li>
        ))}
      </Gallery>
      </Reveal>

      <Modal open={selected !== null} onClose={close} title={selected?.title ?? ""} kicker={selected ? meta(selected) : undefined}
        transitionName={selected ? OPEN_NAME : undefined}>
        {selected && <ProjectDetail project={selected} />}
      </Modal>
    </Section>
  );
}

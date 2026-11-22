"use client";

import { useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Gallery } from "@/components/ui/Gallery";
import { Modal } from "@/components/ui/Modal";
import { Reveal } from "@/components/ui/Reveal";
import { useCalm } from "@/components/ui/MotionProvider";
import { meta, ProjectCard, ProjectDetail, type ProjectView } from "@/components/ui/ProjectCard";
import { Section } from "@/components/ui/Section";
import { KIND_LABELS } from "@/lib/domain";
import type { ProjectKind } from "@/lib/schemas";
import { TechIndex } from "@/lib/structures";

export type { ProjectView };

const KINDS = Object.keys(KIND_LABELS) as ProjectKind[];
const OPEN_NAME = "project-detail";

/**
 * Runs a state change inside a native view transition (cards glide to their new places, the detail grows
 * from its card). Browsers without the API, and calm mode, just apply the change.
 */
function transition(calm: boolean, change: () => void): Promise<void> {
  if (calm || !document.startViewTransition) { change(); return Promise.resolve(); }
  return document.startViewTransition(() => flushSync(change)).finished;
}

/** Filter chips by kind, each with its counter (TechIndex keyed by kind). */
function KindFilter({ index, value, onChange }: { index: TechIndex<ProjectView>; value: ProjectKind | null; onChange: (kind: ProjectKind | null) => void }) {
  const options = [null, ...KINDS.filter((kind) => index.count(kind) > 0)];
  return (
    <div role="group" aria-label="Filtrar por tipo" className="flex flex-wrap gap-2">
      {options.map((kind) => {
        const pressed = value === kind;
        return (
          <button key={kind ?? "all"} type="button" aria-pressed={pressed} onClick={() => onChange(kind)}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors duration-150 ${pressed ? "border-ice bg-ice text-abyss" : "border-line bg-deep text-ice hover:border-steel"}`}>
            {kind ? KIND_LABELS[kind] : "Todos"}
            <span className={`rounded-full px-2 py-0.5 text-sm tabular-nums ${pressed ? "bg-deep text-ice" : "bg-abyss text-mist"}`}>{index.count(kind)}</span>
          </button>
        );
      })}
    </div>
  );
}

export function Projects({ projects }: { projects: ProjectView[] }) {
  const calm = useCalm();
  const [kind, setKind] = useState<ProjectKind | null>(null);
  const [selected, setSelected] = useState<ProjectView | null>(null);
  const origin = useRef<HTMLElement | null>(null);
  const index = useMemo(() => new TechIndex(projects, (project) => [project.kind]), [projects]);
  const visible = index.filter(kind);

  const filter = (next: ProjectKind | null) => void transition(calm, () => setKind(next));

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
      aside={<KindFilter index={index} value={kind} onChange={filter} />}>
      <p className="sr-only" aria-live="polite">{`Mostrando ${visible.length} proyectos`}</p>
      {/* The whole row enters and leaves with the scroll (its cards live in a horizontal scroller). */}
      <Reveal>
      <Gallery label="Galería de proyectos" count={visible.length} resetKey={kind ?? "all"}>
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

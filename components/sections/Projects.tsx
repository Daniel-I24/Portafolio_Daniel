"use client";

import { useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Reveal } from "@/components/ui/Reveal";
import { meta, ProjectCard, ProjectDetail, type ProjectView } from "@/components/ui/ProjectCard";
import { Section } from "@/components/ui/Section";
import { KIND_LABELS } from "@/lib/domain";
import type { ProjectKind } from "@/lib/schemas";
import { TechIndex } from "@/lib/structures";

export type { ProjectView };

const KINDS = Object.keys(KIND_LABELS) as ProjectKind[];

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
  const [kind, setKind] = useState<ProjectKind | null>(null);
  const [selected, setSelected] = useState<ProjectView | null>(null);
  const index = useMemo(() => new TechIndex(projects, (project) => [project.kind]), [projects]);
  const visible = index.filter(kind);

  return (
    <Section id="proyectos" title="Proyectos" lead="Web, móvil, escritorio, videojuegos y APIs: lo que he construido, solo y en equipo."
      aside={<KindFilter index={index} value={kind} onChange={setKind} />}>
      <p className="sr-only" aria-live="polite">{`Mostrando ${visible.length} proyectos`}</p>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((project, i) => (
          <Reveal as="li" key={project.id} index={i % 3} className="h-full"><ProjectCard project={project} onOpen={() => setSelected(project)} /></Reveal>
        ))}
      </ul>

      <Modal open={selected !== null} onClose={() => setSelected(null)} title={selected?.title ?? ""} kicker={selected ? meta(selected) : undefined}>
        {selected && <ProjectDetail project={selected} />}
      </Modal>
    </Section>
  );
}

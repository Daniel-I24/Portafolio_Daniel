"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useMemo, useState, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { SectionTitle } from "@/components/ui/SectionTitle";
import type { CardAction, IconName } from "@/lib/domain";
import type { ProjectData, ProjectKind } from "@/lib/schemas";
import { TechIndex } from "@/lib/structures";

export type ProjectView = ProjectData & { links: CardAction[] };

const KIND_LABEL: Record<ProjectKind, string> = { web: "Web", mobile: "Móvil", api: "API", desktop: "Escritorio", game: "Juego" };
const COVERS: Record<ProjectKind, { icon: IconName; line: string; bg: string }> = {
  web: { icon: "code", line: "https://", bg: "bg-denim" },
  mobile: { icon: "apk", line: "app-release.apk", bg: "bg-hoodie" },
  api: { icon: "shield", line: "GET /api/v1", bg: "bg-mustard" },
  desktop: { icon: "code", line: "python main.py", bg: "bg-concrete" },
  game: { icon: "download", line: "start-game.exe", bg: "bg-spray-red" },
};
const MAX_CHIPS = 10;

const ExternalLink = ({ href, icon, children, title }: { href: string; icon: IconName; children: ReactNode; title: string }) => (
  <a href={href} target="_blank" rel="noopener noreferrer"
    className="inline-flex items-center gap-2 border-[3px] border-ink bg-paper px-3 py-1.5 text-sm font-extrabold uppercase text-ink shadow-sticker-sm transition-colors duration-150 hover:bg-mustard">
    <Icon name={icon} size={18} />{children}<span className="sr-only"> de {title} (abre en una pestaña nueva)</span>
  </a>
);

/** Every existing link (resolved by Project.links()); the modal also lists the extra ones, e.g. a backend repo. */
function ProjectLinks({ project, extra = false }: { project: ProjectView; extra?: boolean }) {
  const extras = extra ? project.extraLinks.map(({ label, url }): CardAction => ({ label, href: url, icon: "github" })) : [];
  return [...project.links, ...extras].map((link) => (
    <ExternalLink key={link.href} href={link.href} icon={link.icon} title={project.title}>{link.label}</ExternalLink>
  ));
}

const CollabTag = () => <span className="sticker-cut ml-1 inline-block -rotate-3 bg-denim px-2 py-0.5 font-marker text-xs normal-case text-paper">Colaboración</span>;

const StackTags = ({ stack }: { stack: string[] }) => (
  <ul aria-label="Tecnologías" className="flex flex-wrap gap-1.5">
    {stack.map((item) => <li key={item} className="border border-ink bg-mustard px-2 py-0.5 font-mono text-xs text-ink">{item}</li>)}
  </ul>
);

function Cover({ project }: { project: ProjectView }) {
  if (project.imageUrl) {
    return <Image src={project.imageUrl} alt={`Captura de ${project.title}`} width={640} height={360} sizes="(min-width: 1024px) 400px, 100vw" className="aspect-video w-full border-b-[3px] border-ink object-cover" />;
  }
  const cover = COVERS[project.kind];
  return (
    <div aria-hidden className={`texture-concrete grid aspect-video place-items-center border-b-[3px] border-ink ${cover.bg}`}>
      <div className="w-3/4 -rotate-2 border-[3px] border-ink bg-paper shadow-sticker">
        <div className="flex gap-1.5 border-b-[3px] border-ink px-2 py-1.5">
          {["bg-spray-red", "bg-mustard", "bg-slime"].map((dot) => <span key={dot} className={`size-2.5 rounded-full border border-ink ${dot}`} />)}
        </div>
        <p className="flex items-center gap-2 p-3 font-mono text-sm text-ink"><Icon name={cover.icon} size={26} />{cover.line}</p>
      </div>
    </div>
  );
}

export function Projects({ projects }: { projects: ProjectView[] }) {
  const reduced = useReducedMotion();
  const [tech, setTech] = useState<string | null>(null);
  const [selected, setSelected] = useState<ProjectView | null>(null);
  const index = useMemo(() => new TechIndex(projects), [projects]);
  const visible = index.filter(tech);
  const chips = [null, ...index.techs().slice(0, MAX_CHIPS)];

  return (
    <section id="proyectos" aria-labelledby="proyectos-title" className="texture-concrete scroll-mt-16 bg-concrete px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <SectionTitle id="proyectos-title" kicker="carteles pegados en la pared" tone="mustard">Proyectos</SectionTitle>

        <div role="group" aria-label="Filtrar por tecnología" className="mt-10 flex flex-wrap gap-2">
          {chips.map((chip) => (
            <button key={chip ?? "all"} type="button" aria-pressed={tech === chip} onClick={() => setTech(chip)}
              className={`border-2 border-ink px-3 py-1 font-mono text-sm shadow-sticker-sm transition-colors duration-150 ${tech === chip ? "bg-denim text-paper" : "bg-paper text-ink hover:bg-mustard"}`}>
              {chip ?? "Todos"}
            </button>
          ))}
        </div>
        <p className="sr-only" aria-live="polite">{`Mostrando ${visible.length} proyectos`}</p>

        <motion.ul layout className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {visible.map((project, i) => (
              <motion.li key={project.id} layout={!reduced} initial={reduced ? false : { opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                exit={reduced ? undefined : { opacity: 0, scale: 0.9 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className={`transition-[rotate,filter] duration-150 hover:-rotate-2 hover:drop-shadow-[8px_8px_0_var(--color-ink)] ${i % 2 ? "rotate-1" : "-rotate-1"}`}>
                <article className="shape-torn flex h-full flex-col bg-paper text-ink">
                  <Cover project={project} />
                  <div className="flex flex-1 flex-col gap-3 p-5 pb-7">
                    <p className="font-mono text-xs uppercase text-concrete">
                      {[KIND_LABEL[project.kind], project.period, project.featured && "destacado"].filter(Boolean).join(" · ")}
                      {project.collaboration && <CollabTag />}
                    </p>
                    <h3 className="font-marker text-2xl leading-tight">{project.title}</h3>
                    <p className="text-sm leading-relaxed">{project.summary}</p>
                    <StackTags stack={project.stack} />
                    <div className="mt-auto flex flex-wrap items-center gap-3 pt-3">
                      <ProjectLinks project={project} />
                      <button type="button" onClick={() => setSelected(project)} className="font-mono text-sm text-denim underline decoration-2 underline-offset-4 hover:text-ink">
                        Ver detalle<span className="sr-only"> de {project.title}</span>
                      </button>
                    </div>
                  </div>
                </article>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      </div>

      <Modal open={selected !== null} onClose={() => setSelected(null)} title={selected?.title ?? ""}>
        {selected && <ProjectDetail project={selected} />}
      </Modal>
    </section>
  );
}

function ProjectDetail({ project }: { project: ProjectView }) {
  const sections = [["Problema", project.problem], ["Solución", project.solution], ["Mi rol", project.myRole], ["Aprendizajes", project.learnings]].filter(([, text]) => text);
  const note = project.links.find((link) => link.note)?.note;
  return (
    <div className="space-y-5">
      <p className="text-lg leading-relaxed">{project.summary}</p>
      {project.collaboration && <p className="font-mono text-sm">Proyecto en equipo <CollabTag /></p>}
      {sections.length > 0 ? (
        <dl className="space-y-4">
          {sections.map(([label, text]) => (
            <div key={label}><dt className="font-marker text-xl text-denim">{label}</dt><dd className="mt-1 leading-relaxed">{text}</dd></div>
          ))}
        </dl>
      ) : (
        <p className="font-marker text-concrete">Pronto agrego el detalle completo: problema, solución, mi rol y aprendizajes.</p>
      )}
      {project.gallery.length > 0 && <div className="grid grid-cols-2 gap-3">
        {project.gallery.map((src, i) => <Image key={src} src={src} alt={`${project.title}, captura ${i + 1}`} width={480} height={270} className="border-2 border-ink" />)}
      </div>}
      <StackTags stack={project.stack} />
      {note && <p className="border-l-4 border-denim bg-denim/15 p-3 text-sm leading-relaxed"><strong>¿Por qué «Documentación»?</strong> {note}</p>}
      <div className="flex flex-wrap gap-3"><ProjectLinks project={project} extra /></div>
    </div>
  );
}

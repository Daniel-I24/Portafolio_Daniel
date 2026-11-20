import Image from "next/image";
import type { ReactNode } from "react";
import { KIND_LABELS, type CardAction } from "@/lib/domain";
import type { ProjectData, ProjectKind } from "@/lib/schemas";
import { ButtonLink } from "./Button";
import { Icon } from "./Icon";

export type ProjectView = ProjectData & { links: CardAction[] };

/** Plain cover per kind when there is no screenshot: color + name, nothing fake. Every pair passes 4.5:1. */
const COVER_TONES: Record<ProjectKind, string> = {
  web: "bg-paper text-ink",
  mobile: "bg-pine text-card",
  desktop: "bg-ink text-card",
  game: "bg-rust text-card",
  api: "bg-marigold text-ink",
};
const MAX_TECHS = 5;

export const meta = (project: ProjectView) => [KIND_LABELS[project.kind], project.period].filter(Boolean).join(" · ");

/** Screenshot, or a plain colored space with kind, period and name: nothing fake. */
function Cover({ project }: { project: ProjectView }) {
  if (project.imageUrl) {
    return <Image src={project.imageUrl} alt={`Captura de ${project.title}`} width={640} height={360} sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw" className="aspect-video w-full object-cover" />;
  }
  const size = project.title.length > 20 ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl";
  return (
    <div className={`flex aspect-video flex-col justify-between p-6 text-left ${COVER_TONES[project.kind]}`}>
      <span className="text-sm font-medium uppercase tracking-[0.12em]">{meta(project)}</span>
      <span className={`line-clamp-3 font-display font-semibold leading-tight [font-variation-settings:'opsz'_144] ${size}`}>{project.title}</span>
    </div>
  );
}

export const Badge = ({ tone, children }: { tone: "featured" | "collab"; children: ReactNode }) => (
  <span className={`rounded-full px-3 py-1 text-sm font-semibold ${tone === "featured" ? "bg-marigold text-ink" : "border border-pine bg-card text-pine"}`}>{children}</span>
);

export const Badges = ({ project }: { project: ProjectView }) =>
  project.featured || project.collaboration ? (
    <p className="flex flex-wrap gap-2">
      {project.featured && <Badge tone="featured">Destacado</Badge>}
      {project.collaboration && <Badge tone="collab">Colaboración</Badge>}
    </p>
  ) : null;

export const TechList = ({ stack, limit = stack.length }: { stack: string[]; limit?: number }) => (
  <ul aria-label="Tecnologías" className="flex flex-wrap gap-1.5">
    {stack.slice(0, limit).map((tech) => <li key={tech} className="rounded-md bg-paper px-2.5 py-1 text-sm text-ink">{tech}</li>)}
    {stack.length > limit && <li className="px-1 py-1 text-sm text-muted">+{stack.length - limit} más</li>}
  </ul>
);

/** Every link the project carries (resolved by Project.links()); the detail adds the extra ones. */
export const ProjectLinks = ({ project, extra = false }: { project: ProjectView; extra?: boolean }) => {
  const extras = extra ? project.extraLinks.map(({ label, url }): CardAction => ({ label, href: url, icon: "external" })) : [];
  return [...project.links, ...extras].map((link, i) => (
    <ButtonLink key={link.href} href={link.href} icon={link.icon === "arrow" ? "external" : link.icon} size="sm" variant={i === 0 ? "outline" : "solid"}>
      {link.label}<span className="sr-only"> de {project.title}</span>
    </ButtonLink>
  ));
};

export function ProjectCard({ project, onOpen }: { project: ProjectView; onOpen: () => void }) {
  const named = !project.imageUrl; // the plain cover already shows kind, period and name
  return (
    <article className="group/card relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-card transition-[border-color,box-shadow,translate] duration-300 hover:-translate-y-1 hover:border-ink hover:shadow-lift">
      {/* Mouse shortcut to the detail; keyboard and screen readers use the labelled button below. */}
      <button type="button" tabIndex={-1} aria-hidden onClick={onOpen} className="block overflow-hidden border-b border-line">
        <div className="transition-transform duration-500 ease-(--ease-soft) group-hover/card:scale-[1.03]"><Cover project={project} /></div>
      </button>
      <button type="button" onClick={onOpen} title="Ver detalle" aria-label={`Ver detalle de ${project.title}`}
        className="absolute right-4 top-4 grid size-11 place-items-center rounded-full border border-line bg-card text-rust shadow-lift transition-[border-color,rotate] duration-300 hover:rotate-90 hover:border-rust">
        <Icon name="plus" size={20} />
      </button>
      <div className="flex flex-1 flex-col gap-4 p-6">
        <Badges project={project} />
        <div className={named ? "sr-only" : ""}>
          <p className="text-sm text-muted">{meta(project)}</p>
          <h3 className="mt-1 font-display text-xl font-semibold leading-tight">{project.title}</h3>
        </div>
        <p className="line-clamp-3 text-muted">{project.summary}</p>
        <TechList stack={project.stack} limit={MAX_TECHS} />
        <div className="mt-auto flex flex-wrap gap-2 pt-2"><ProjectLinks project={project} /></div>
      </div>
    </article>
  );
}

export function ProjectDetail({ project }: { project: ProjectView }) {
  const sections = [["Problema", project.problem], ["Solución", project.solution], ["Mi rol", project.myRole], ["Aprendizajes", project.learnings]].filter(([, text]) => text);
  const note = project.links.find((link) => link.note)?.note;
  return (
    <div className="space-y-6">
      <Badges project={project} />
      <p className="text-lg">{project.summary}</p>
      {sections.length > 0 ? (
        <dl className="grid gap-5 sm:grid-cols-2">
          {sections.map(([label, text]) => (
            <div key={label}><dt className="font-display text-lg font-semibold">{label}</dt><dd className="mt-1 text-muted">{text}</dd></div>
          ))}
        </dl>
      ) : (
        <p className="text-muted">Pronto agrego el detalle completo: problema, solución, mi rol y aprendizajes.</p>
      )}
      {project.gallery.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {project.gallery.map((src, i) => <Image key={src} src={src} alt={`${project.title}, captura ${i + 1}`} width={480} height={300} className="rounded-xl border border-line" />)}
        </div>
      )}
      <TechList stack={project.stack} />
      {note && <p className="rounded-xl border-l-4 border-pine bg-paper p-4 text-sm"><strong>¿Por qué «Documentación»?</strong> {note}</p>}
      <div className="flex flex-wrap gap-2"><ProjectLinks project={project} extra /></div>
    </div>
  );
}

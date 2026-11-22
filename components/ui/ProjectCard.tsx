import Image from "next/image";
import type { ReactNode } from "react";
import { KIND_LABELS, type CardAction } from "@/lib/domain";
import type { ProjectData, ProjectKind } from "@/lib/schemas";
import { ButtonLink } from "./Button";
import { Icon } from "./Icon";

export type ProjectView = ProjectData & { links: CardAction[] };

/** Plain cover per kind when there is no screenshot: color + name, nothing fake. Every pair passes 4.5:1. */
const COVER_TONES: Record<ProjectKind, string> = {
  web: "bg-abyss text-ice",
  "web-mobile": "bg-deep text-ice",
  mobile: "bg-navy text-ice",
  wearable: "bg-steel text-abyss",
  desktop: "bg-slate text-ice",
  game: "bg-ice text-abyss",
  api: "bg-mist text-abyss",
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
  <span className={`rounded-full px-3 py-1 text-sm font-semibold ${tone === "featured" ? "bg-mist text-abyss" : "border border-sky bg-deep text-sky"}`}>{children}</span>
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
    {stack.slice(0, limit).map((tech) => <li key={tech} className="rounded-md bg-abyss px-2.5 py-1 text-sm text-ice">{tech}</li>)}
    {stack.length > limit && <li className="px-1 py-1 text-sm text-mist">+{stack.length - limit} más</li>}
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

/** 3D tilt toward the cursor: the gallery writes --px/--py (0–1) on `[data-tilt]`; transitions smooth it. */
const TILT = { transform: "perspective(900px) rotateX(calc((0.5 - var(--py, 0.5)) * 8deg)) rotateY(calc((var(--px, 0.5) - 0.5) * 10deg))" };
const resetTilt = (event: { currentTarget: HTMLElement }) => {
  event.currentTarget.style.setProperty("--px", "0.5");
  event.currentTarget.style.setProperty("--py", "0.5");
};

export function ProjectCard({ project, onOpen }: { project: ProjectView; onOpen: (card: HTMLElement) => void }) {
  const named = !project.imageUrl; // the plain cover already shows kind, period and name
  const open = (event: { currentTarget: HTMLElement }) => onOpen(event.currentTarget.closest("article") as HTMLElement);
  return (
    <article data-tilt style={TILT} onPointerLeave={resetTilt}
      className="group/card relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-deep transition-[transform,border-color,box-shadow] duration-300 ease-out hover:border-steel hover:shadow-lift after:pointer-events-none after:absolute after:inset-0 after:rounded-3xl after:opacity-0 after:shadow-[inset_0_0_0_1.5px_var(--color-mist),inset_0_0_24px_-6px_var(--color-steel),0_0_32px_-6px_var(--color-steel)] after:transition-opacity after:duration-300 hover:after:opacity-100">
      {/* Mouse shortcut to the detail; keyboard and screen readers use the labelled button below. */}
      <button type="button" tabIndex={-1} aria-hidden onClick={open} className="block overflow-hidden border-b border-line">
        <div className="transition-transform duration-500 ease-(--ease-soft) group-hover/card:scale-[1.03]"><Cover project={project} /></div>
      </button>
      <button type="button" onClick={open} title="Ver detalle" aria-label={`Ver detalle de ${project.title}`}
        className="absolute right-4 top-4 grid size-11 place-items-center rounded-full border border-line bg-deep text-sky shadow-lift transition-[border-color,rotate] duration-300 hover:rotate-90 hover:border-sky">
        <Icon name="plus" size={20} />
      </button>
      <div className="flex flex-1 flex-col gap-4 p-6">
        <Badges project={project} />
        <div className={named ? "sr-only" : ""}>
          <p className="text-sm text-mist">{meta(project)}</p>
          <h3 className="mt-1 font-display text-xl font-semibold leading-tight">{project.title}</h3>
        </div>
        <p className="line-clamp-3 text-mist">{project.summary}</p>
        <TechList stack={project.stack} limit={MAX_TECHS} />
        <div className="mt-auto flex flex-wrap gap-2 pt-2"><ProjectLinks project={project} /></div>
      </div>
    </article>
  );
}

export function ProjectDetail({ project }: { project: ProjectView }) {
  const sections = [["Problema", project.problem], ["Solución", project.solution], ["Mi rol", project.myRole], ["Aprendizajes", project.learnings]].filter(([, text]) => text);
  return (
    <div className="space-y-6">
      <Badges project={project} />
      <p className="text-lg">{project.summary}</p>
      {sections.length > 0 && (
        <dl className="grid gap-5 sm:grid-cols-2">
          {sections.map(([label, text]) => (
            <div key={label}><dt className="font-display text-lg font-semibold">{label}</dt><dd className="mt-1 text-mist">{text}</dd></div>
          ))}
        </dl>
      )}
      {project.gallery.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {project.gallery.map((src, i) => <Image key={src} src={src} alt={`${project.title}, captura ${i + 1}`} width={480} height={300} className="rounded-xl border border-line" />)}
        </div>
      )}
      <TechList stack={project.stack} />
      <div className="flex flex-wrap gap-2"><ProjectLinks project={project} extra /></div>
    </div>
  );
}

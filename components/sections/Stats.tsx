import { Reveal } from "@/components/ui/Reveal";
import { container, sectionNumber } from "@/components/ui/Section";

interface StatsProps {
  projects: number;
  /** Distinct project platforms, already labelled ("Web", "Móvil"…). */
  platforms: string[];
  /** Distinct stack technologies and the groups they belong to. */
  techs: number;
  techGroups: string[];
}

/** Three key figures computed from the published content: projects, platforms and stack technologies. */
export function Stats({ projects, platforms, techs, techGroups }: StatsProps) {
  const figures = [
    { value: projects, label: "proyectos publicados", detail: "Personales, académicos y en equipo" },
    { value: platforms.length, label: platforms.length === 1 ? "plataforma" : "plataformas", detail: platforms.join(" · ") },
    { value: techs, label: "tecnologías en mi stack", detail: techGroups.join(" · ") },
  ].filter((figure) => figure.value > 0);

  return (
    <section id="cifras" aria-labelledby="cifras-title" className="scroll-mt-20 border-y border-line bg-card py-14 sm:py-16">
      <div className={container}>
        <h2 id="cifras-title" className="text-sm font-medium uppercase tracking-[0.12em] text-muted">
          <span className="text-rust">{sectionNumber("cifras")}</span> — Cifras clave
        </h2>
        <dl className="mt-8 grid gap-x-10 gap-y-10 sm:grid-cols-3">
          {figures.map((figure, i) => (
            <Reveal key={figure.label} index={i} className="border-t border-ink pt-5">
              <dt className="sr-only">{figure.label}</dt>
              <dd className="flex flex-col gap-2">
                <span className="font-display text-4xl font-semibold leading-none tabular-nums">{figure.value}</span>
                <span className="text-lg font-medium" aria-hidden>{figure.label}</span>
              </dd>
              <dd className="mt-3 text-sm text-muted">{figure.detail}</dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}

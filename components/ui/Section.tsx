import type { ReactNode } from "react";
import { Glow } from "./Glow";
import { Reveal } from "./Reveal";

/** Page sections in order. Drives the menu anchors, the "01 / 08" indicator, footer links and the section index. */
export const SECTIONS = [
  { id: "inicio", label: "Inicio" },
  { id: "cifras", label: "Cifras" },
  { id: "sobre-mi", label: "Sobre mí" },
  { id: "proyectos", label: "Proyectos" },
  { id: "testimonios", label: "Testimonios" },
  { id: "experiencia", label: "Experiencia" },
  { id: "mas-alla-del-codigo", label: "Más allá" },
  { id: "contacto", label: "Contacto" },
] as const;

export type SectionId = (typeof SECTIONS)[number]["id"];

/** "03" for the third section. */
export const sectionNumber = (id: SectionId): string =>
  String(SECTIONS.findIndex((section) => section.id === id) + 1).padStart(2, "0");

/** Shared width and side gutters: 16 px on phones, growing with the viewport. */
export const container = "mx-auto w-full max-w-310 px-4 sm:px-8 lg:px-12";

interface SectionProps {
  id: SectionId;
  title: string;
  lead?: string;
  children: ReactNode;
  /** `card` sets the section on the lighter surface to separate it from its neighbours. */
  surface?: "paper" | "card";
  /** Extra content aligned with the title on wide screens (filters, tabs…). */
  aside?: ReactNode;
  /** Key sections only: a faint wash of the light family behind the content, away from the heading. */
  glow?: boolean;
}

/** Section shell: numbered kicker, serif title, optional lead, then the content. */
export function Section({ id, title, lead, children, surface = "paper", aside, glow = false }: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={`relative isolate scroll-mt-20 overflow-x-clip py-20 sm:py-24 ${surface === "card" ? "border-y border-line bg-card" : ""}`}
    >
      {glow && <Glow variant="section" className="-right-48 bottom-0 size-[44rem] max-sm:size-[28rem]" />}
      <div className={container}>
        <Reveal className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.12em] text-muted">
              <span className="text-rust">{sectionNumber(id)}</span> — {SECTIONS.find((s) => s.id === id)?.label}
            </p>
            <h2 id={`${id}-title`} className="mt-3 font-display text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
              {title}
            </h2>
            {lead && <p className="mt-4 text-lg text-muted">{lead}</p>}
          </div>
          {aside}
        </Reveal>
        <div className="mt-12 sm:mt-16">{children}</div>
      </div>
    </section>
  );
}

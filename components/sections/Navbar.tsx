"use client";

import { useEffect, useState } from "react";
import { CvButton } from "@/components/ui/CvButton";
import { MobileMenu } from "@/components/ui/MobileMenu";
import { MotionSwitch } from "@/components/ui/MotionProvider";
import { container, SECTIONS, sectionNumber, type SectionId } from "@/components/ui/Section";
import { SectionObserver } from "@/lib/patterns";

interface NavbarProps {
  initials: string;
  name: string;
  cvUrl: string;
  cvNote?: string;
}

/** Watches which section crosses the middle of the viewport (Observer pattern in lib/patterns.ts). */
function useActiveSection(): SectionId {
  const [active, setActive] = useState<SectionId>("inicio");
  useEffect(() => {
    const observer = new SectionObserver().observe(SECTIONS.map((s) => s.id));
    const off = observer.subscribe((id, visible) => visible && setActive(id as SectionId));
    return () => { off(); observer.disconnect(); };
  }, []);
  return active;
}

export function Navbar({ initials, name, cvUrl, cvNote }: NavbarProps) {
  const active = useActiveSection();
  const current = SECTIONS.find((s) => s.id === active);

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-md">
      <a href="#contenido" className="sr-only rounded-full bg-ink px-4 py-2 text-sm font-semibold text-card focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50">
        Saltar al contenido
      </a>
      <div className={`${container} flex h-18 items-center gap-6`}>
        <a href="#inicio" aria-label={`${name}, ir al inicio`}
          className="grid size-11 shrink-0 place-items-center rounded-full border-[1.5px] border-ink font-display text-lg font-semibold transition-colors duration-150 hover:bg-ink hover:text-card">
          {initials}
        </a>

        <nav aria-label="Secciones" className="hidden xl:block">
          <ul className="flex items-center gap-5 text-sm">
            {SECTIONS.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`} aria-current={section.id === active ? "location" : undefined}
                  className="relative py-2 text-muted transition-colors duration-150 after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 after:bg-rust after:transition-transform after:duration-300 hover:text-ink hover:after:scale-x-100 aria-[current]:font-semibold aria-[current]:text-ink aria-[current]:after:scale-x-100">
                  {section.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <p className="ml-auto text-sm font-medium tabular-nums tracking-[0.08em] text-muted" aria-label={`Sección ${sectionNumber(active)} de ${SECTIONS.length}: ${current?.label}`}>
          <span className="text-rust">{sectionNumber(active)}</span> / {String(SECTIONS.length).padStart(2, "0")}
        </p>
        <div className="hidden xl:block"><MotionSwitch /></div>
        <div className="hidden sm:block"><CvButton href={cvUrl} missingNote={cvNote} size="sm" align="right" /></div>
        <MobileMenu active={active} cvUrl={cvUrl} cvNote={cvNote} />
      </div>
    </header>
  );
}

"use client";

import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useEffect, useRef, type KeyboardEvent } from "react";
import { iconButtonClass } from "./Button";
import { CvButton } from "./CvButton";
import { Icon } from "./Icon";
import { MotionSwitch, useCalm } from "./MotionProvider";
import { SECTIONS, sectionNumber, type SectionId } from "./Section";
import { goToSection } from "./SectionCurtain";

const EASE = [0.16, 1, 0.3, 1] as const;
export type Circle = { x: number; y: number; r: number };

interface MenuPanelProps {
  circle: Circle | null;
  active: SectionId;
  cvUrl: string;
  cvNote?: string;
  onClose: (returnFocus?: boolean) => void;
}

/**
 * Full-screen menu that grows as a circle from the floating button (scale only). Loaded on demand the first
 * time the menu opens, so Motion stays out of the start-up bundle. Focus stays inside; Esc closes.
 */
export function MenuPanel({ circle, active, cvUrl, cvNote, onClose }: MenuPanelProps) {
  const calm = useCalm();
  const panel = useRef<HTMLDivElement>(null);
  const open = circle !== null;

  useEffect(() => {
    if (!open) return;
    panel.current?.querySelector<HTMLElement>("a, button")?.focus();
    document.documentElement.style.overflow = "hidden";
    return () => { document.documentElement.style.overflow = ""; };
  }, [open]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") return onClose();
    if (event.key !== "Tab" || !panel.current) return;
    const items = [...panel.current.querySelectorAll<HTMLElement>("a, button")];
    const [first, last] = [items[0], items[items.length - 1]];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };

  return (
    <MotionConfig reducedMotion={calm ? "always" : "never"}>
      <AnimatePresence>
        {circle && (
          <motion.div ref={panel} key="menu" id="mobile-menu" role="dialog" aria-modal="true" aria-label="Menú" data-lenis-prevent onKeyDown={onKeyDown}
            className="fixed inset-0 z-50" exit={{ opacity: 1 }} transition={{ duration: 0.45 }}>
            <motion.span aria-hidden className="absolute rounded-full bg-deep"
              style={{ left: circle.x - circle.r, top: circle.y - circle.r, width: circle.r * 2, height: circle.r * 2 }}
              initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ duration: 0.5, ease: EASE }} />
            <motion.div className="relative flex h-full flex-col overflow-y-auto overscroll-contain px-4 pb-28 sm:px-8"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.18, duration: 0.35, ease: EASE } }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}>
              <div className="flex h-18 shrink-0 items-center justify-end">
                <button type="button" onClick={() => onClose()} className={iconButtonClass}>
                  <Icon name="close" />
                  <span className="sr-only">Cerrar menú</span>
                </button>
              </div>
              <nav aria-label="Secciones" className="mt-2">
                <ol className="divide-y divide-line border-y border-line">
                  {SECTIONS.map((section) => (
                    <li key={section.id}>
                      <a href={`#${section.id}`} onClick={(event) => { onClose(false); goToSection(event, section.id); }} aria-current={section.id === active ? "location" : undefined}
                        className="flex items-baseline gap-4 py-3.5 font-display text-xl text-ice transition-colors duration-150 hover:text-sky aria-[current]:text-sky">
                        <span className="font-sans text-sm tabular-nums text-mist">{sectionNumber(section.id)}</span>
                        {section.label}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <CvButton href={cvUrl} missingNote={cvNote} variant="solid" />
                <MotionSwitch />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}

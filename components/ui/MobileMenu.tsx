"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { CvButton } from "./CvButton";
import { Icon } from "./Icon";
import { MotionSwitch } from "./MotionProvider";
import { SECTIONS, sectionNumber, type SectionId } from "./Section";
import { goToSection } from "./SectionCurtain";

interface MobileMenuProps {
  active: SectionId;
  cvUrl: string;
  cvNote?: string;
}

const EASE = [0.16, 1, 0.3, 1] as const;
type Circle = { x: number; y: number; r: number };

/**
 * Below 1280 px: a floating LED button (bottom right, always in reach) that shows the current section number.
 * It opens a full-screen menu that grows as a circle from the button (scale only). Focus stays inside; Esc closes.
 */
export function MobileMenu({ active, cvUrl, cvNote }: MobileMenuProps) {
  const [circle, setCircle] = useState<Circle | null>(null);
  const [mounted, setMounted] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const open = circle !== null;
  const label = SECTIONS.find((section) => section.id === active)?.label;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    panel.current?.querySelector<HTMLElement>("a, button")?.focus();
    document.documentElement.style.overflow = "hidden";
    return () => { document.documentElement.style.overflow = ""; };
  }, [open]);

  const show = () => {
    const box = button.current?.getBoundingClientRect();
    if (!box) return;
    const x = box.left + box.width / 2;
    const y = box.top + box.height / 2;
    setCircle({ x, y, r: Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) });
  };

  const close = (returnFocus = true) => {
    setCircle(null);
    if (returnFocus) button.current?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") return close();
    if (event.key !== "Tab" || !panel.current) return;
    const items = [...panel.current.querySelectorAll<HTMLElement>("a, button")];
    const [first, last] = [items[0], items[items.length - 1]];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };

  return (
    <div className="xl:hidden">
      <button ref={button} type="button" onClick={show} aria-expanded={open} aria-controls="mobile-menu"
        aria-label={`Abrir menú. Sección ${sectionNumber(active)} de ${SECTIONS.length}: ${label}`}
        className="pointer-events-auto fixed bottom-5 right-5 z-40 grid size-16 place-items-center rounded-full border border-steel bg-deep text-ice transition-transform duration-150 active:scale-95 sm:bottom-8 sm:right-8">
        {/* LED halo and ring, breathing like the photo frame (opacity only). */}
        <span aria-hidden className="absolute -inset-3 -z-10 animate-pulse-led rounded-full bg-[radial-gradient(closest-side,rgb(194_232_255/0.5),rgb(114_152_175/0.3)_55%,transparent)]" />
        <span aria-hidden className="absolute inset-1 animate-pulse-led rounded-full border border-ice/70 shadow-led" />
        <span aria-hidden className="relative flex flex-col items-center gap-0.5 leading-none">
          <Icon name="menu" size={18} />
          <span className="text-sm font-semibold tabular-nums">{sectionNumber(active)}</span>
        </span>
      </button>

      {/* Portal: keeps the fixed panel out of the header's stacking context. */}
      {mounted && createPortal(<AnimatePresence>
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
                <button type="button" onClick={() => close()} className="grid size-11 place-items-center rounded-full border-[1.5px] border-steel text-ice transition-colors duration-150 hover:bg-ice hover:text-abyss">
                  <Icon name="close" />
                  <span className="sr-only">Cerrar menú</span>
                </button>
              </div>
              <nav aria-label="Secciones" className="mt-2">
                <ol className="divide-y divide-line border-y border-line">
                  {SECTIONS.map((section) => (
                    <li key={section.id}>
                      <a href={`#${section.id}`} onClick={(event) => { close(false); goToSection(event, section.id); }} aria-current={section.id === active ? "location" : undefined}
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
      </AnimatePresence>, document.body)}
    </div>
  );
}

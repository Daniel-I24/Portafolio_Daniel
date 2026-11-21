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

/** Below 1280 px: full-screen panel with the anchors, the CV and the motion switch. Focus stays inside while open. */
export function MobileMenu({ active, cvUrl, cvNote }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    panel.current?.querySelector<HTMLElement>("a, button")?.focus();
    document.documentElement.style.overflow = "hidden";
    return () => { document.documentElement.style.overflow = ""; };
  }, [open]);

  const close = (returnFocus = true) => {
    setOpen(false);
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
      <button ref={button} type="button" onClick={() => setOpen(true)} aria-expanded={open} aria-controls="mobile-menu"
        className="grid size-11 place-items-center rounded-full border-[1.5px] border-ink transition-colors duration-150 hover:bg-ink hover:text-card">
        <Icon name="menu" />
        <span className="sr-only">Abrir menú</span>
      </button>

      {/* Portal: the header's backdrop-filter would otherwise trap this fixed panel inside it. */}
      {mounted && createPortal(<AnimatePresence>
        {open && (
          <motion.div ref={panel} id="mobile-menu" role="dialog" aria-modal="true" aria-label="Menú" data-lenis-prevent onKeyDown={onKeyDown}
            initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex flex-col overflow-y-auto overscroll-contain bg-paper px-4 pb-8 sm:px-8">
            <div className="flex h-18 shrink-0 items-center justify-end">
              <button type="button" onClick={() => close()} className="grid size-11 place-items-center rounded-full border-[1.5px] border-ink">
                <Icon name="close" />
                <span className="sr-only">Cerrar menú</span>
              </button>
            </div>
            <nav aria-label="Secciones" className="mt-4">
              <ol className="divide-y divide-line border-y border-line">
                {SECTIONS.map((section) => (
                  <li key={section.id}>
                    <a href={`#${section.id}`} onClick={(event) => { close(false); goToSection(event, section.id); }} aria-current={section.id === active ? "location" : undefined}
                      className="flex items-baseline gap-4 py-3.5 font-display text-xl text-ink transition-colors duration-150 hover:text-rust aria-[current]:text-rust">
                      <span className="font-sans text-sm tabular-nums text-muted">{sectionNumber(section.id)}</span>
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
        )}
      </AnimatePresence>, document.body)}
    </div>
  );
}

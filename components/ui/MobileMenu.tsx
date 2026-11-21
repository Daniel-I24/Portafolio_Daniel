"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./Icon";
import type { Circle } from "./MenuPanel";
import { SECTIONS, sectionNumber, type SectionId } from "./Section";

interface MobileMenuProps {
  active: SectionId;
  cvUrl: string;
  cvNote?: string;
}

const loadPanel = () => import("./MenuPanel").then((module) => module.MenuPanel);
const MenuPanel = dynamic(loadPanel, { ssr: false });

/**
 * Below 1280 px: a floating LED button (bottom right, always in reach) that shows the current section number.
 * The panel it opens is fetched on first touch/focus/hover and mounted on first open (see MenuPanel).
 */
export function MobileMenu({ active, cvUrl, cvNote }: MobileMenuProps) {
  const [circle, setCircle] = useState<Circle | null>(null);
  const [used, setUsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const label = SECTIONS.find((section) => section.id === active)?.label;

  useEffect(() => setMounted(true), []);

  const show = () => {
    const box = button.current?.getBoundingClientRect();
    if (!box) return;
    const x = box.left + box.width / 2;
    const y = box.top + box.height / 2;
    setUsed(true);
    setCircle({ x, y, r: Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) });
  };

  const close = (returnFocus = true) => {
    setCircle(null);
    if (returnFocus) button.current?.focus();
  };

  return (
    <div className="xl:hidden">
      <button ref={button} type="button" onClick={show} onPointerDown={loadPanel} onPointerEnter={loadPanel} onFocus={loadPanel}
        aria-expanded={circle !== null} aria-controls="mobile-menu" aria-label={`Abrir menú. Sección ${sectionNumber(active)} de ${SECTIONS.length}: ${label}`}
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
      {mounted && used && createPortal(<MenuPanel circle={circle} active={active} cvUrl={cvUrl} cvNote={cvNote} onClose={close} />, document.body)}
    </div>
  );
}

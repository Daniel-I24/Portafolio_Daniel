"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Icon } from "./Icon";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Small line above the title (type, period…). */
  kicker?: string;
  children: ReactNode;
}

/**
 * Dialog built on the native <dialog>: showModal() gives focus trapping, Esc to close and an inert
 * background for free. Clicking the backdrop also closes it. Lenis leaves its inner scroll alone.
 */
export function Modal({ open, onClose, title, kicker, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="modal-title"
      data-lenis-prevent
      onClose={onClose}
      onClick={(event) => event.target === ref.current && onClose()}
      className="m-auto max-h-[88dvh] w-[min(46rem,calc(100vw-2rem))] overflow-y-auto overscroll-contain rounded-3xl border border-line bg-deep p-0 text-ice shadow-lift backdrop:bg-abyss/60 backdrop:backdrop-blur-sm open:animate-rise"
    >
      <div className="p-6 sm:p-10">
        <div className="flex items-start justify-between gap-6">
          <div>
            {kicker && <p className="text-sm font-medium uppercase tracking-[0.12em] text-mist">{kicker}</p>}
            <h2 id="modal-title" className="mt-1 font-display text-2xl font-semibold leading-tight sm:text-3xl">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="grid size-11 shrink-0 place-items-center rounded-full border border-line transition-colors duration-150 hover:border-steel hover:bg-abyss"
          >
            <Icon name="close" />
          </button>
        </div>
        <div className="mt-8">{children}</div>
      </div>
    </dialog>
  );
}

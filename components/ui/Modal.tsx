"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Icon } from "./Icon";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

/**
 * Poster-style dialog built on the native <dialog>: showModal() gives focus trapping,
 * Esc to close and an inert background for free. Clicking the backdrop also closes it.
 */
export function Modal({ open, onClose, title, children }: ModalProps) {
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
      onClose={onClose}
      onClick={(event) => event.target === ref.current && onClose()}
      className="m-auto max-h-[88dvh] w-[min(42rem,calc(100vw-2rem))] overflow-y-auto border-[3px] border-ink bg-paper p-0 text-ink shadow-sticker-lg backdrop:bg-ink/75 open:animate-[pop_300ms_var(--ease-snap)]"
    >
      <div className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <h2 id="modal-title" className="font-spray text-3xl leading-none sm:text-4xl">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="grid size-10 shrink-0 rotate-45 place-items-center border-[3px] border-ink bg-mustard shadow-sticker-sm transition-transform duration-150 hover:rotate-[135deg]"
          >
            <Icon name="plus" size={22} />
          </button>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </dialog>
  );
}

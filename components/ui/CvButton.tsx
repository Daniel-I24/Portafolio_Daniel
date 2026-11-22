"use client";

import { useState, type MouseEvent } from "react";
import { buttonClass, ButtonIcon, type ButtonVariant } from "./Button";

interface CvButtonProps {
  href: string;
  /** When set, the PDF is not there yet: the click shows this note instead of a 404. */
  missingNote?: string;
  variant?: ButtonVariant;
  size?: "md" | "sm";
  className?: string;
  /** Side the note grows from, so it never leaves the viewport. */
  align?: "left" | "right";
}

/** "Descargar CV" with download feedback, or a short note while the file is missing. */
export function CvButton({ href, missingNote, variant = "outline", size = "md", className = "", align = "left" }: CvButtonProps) {
  const [state, setState] = useState<"idle" | "done" | "note">("idle");

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (missingNote) event.preventDefault();
    setState(missingNote ? "note" : "done");
    setTimeout(() => setState("idle"), missingNote ? 4000 : 2000);
  };

  return (
    <span className={`relative inline-flex ${className}`}>
      <a href={href} download={missingNote ? undefined : true} onClick={onClick} className={buttonClass(variant, size)}>
        <span>{state === "done" ? "Descarga iniciada" : "Descargar CV"}</span>
        <ButtonIcon name={state === "done" ? "check" : "download"} />
      </a>
      <span className="sr-only" aria-live="polite">{state === "note" ? missingNote : state === "done" ? "Descarga iniciada" : ""}</span>
      {state === "note" && (
        <span aria-hidden className={`absolute ${align === "left" ? "left-0" : "right-0"} top-full z-50 mt-2 w-64 rounded-xl border border-line bg-deep p-3 text-sm text-ice shadow-lift`}>
          {missingNote}
        </span>
      )}
    </span>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { useCalm } from "./MotionProvider";

const MAGNET = 0.22; // share of the distance to the cursor
const MAGNET_MAX = 8; // px

const clamp = (value: number) => Math.max(-MAGNET_MAX, Math.min(MAGNET_MAX, value));

/** Where the pointer crossed the button edge, so the fill grows from (and retracts to) that side. */
function setOrigin(event: PointerEvent, entering: boolean) {
  const button = (event.target as Element | null)?.closest<HTMLElement>(".btn");
  if (!button || button.contains(event.relatedTarget as Node | null)) return;
  const box = button.getBoundingClientRect();
  button.style.setProperty("--x", `${event.clientX - box.left}px`);
  button.style.setProperty("--y", `${event.clientY - box.top}px`);
  const magnet = button.hasAttribute("data-magnetic");
  if (!entering && magnet) { button.style.setProperty("--mx", "0px"); button.style.setProperty("--my", "0px"); }
}

function pull(event: PointerEvent) {
  const button = (event.target as Element | null)?.closest<HTMLElement>("[data-magnetic]");
  if (!button) return;
  const box = button.getBoundingClientRect();
  button.style.setProperty("--mx", `${clamp((event.clientX - box.left - box.width / 2) * MAGNET)}px`);
  button.style.setProperty("--my", `${clamp((event.clientY - box.top - box.height / 2) * MAGNET)}px`);
}

/**
 * Page-wide pointer effects for desktop mice: the button fill origin, the magnetic pull, and a soft warm light
 * that follows the cursor (transform only, one rAF per frame). Off on touch screens and when calm.
 */
export function Ambient() {
  const calm = useCalm();
  const light = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (calm || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let frame = 0;
    const onOver = (event: PointerEvent) => setOrigin(event, true);
    const onOut = (event: PointerEvent) => setOrigin(event, false);
    const onMove = (event: PointerEvent) => {
      pull(event);
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!light.current) return;
        light.current.style.transform = `translate3d(${event.clientX - 300}px, ${event.clientY - 300}px, 0)`;
        light.current.style.opacity = "1";
      });
    };
    document.addEventListener("pointerover", onOver);
    document.addEventListener("pointerout", onOut);
    document.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
      document.removeEventListener("pointermove", onMove);
    };
  }, [calm]);

  if (calm) return null;
  return (
    <div ref={light} aria-hidden
      className="pointer-events-none fixed left-0 top-0 -z-10 size-[600px] rounded-full bg-[radial-gradient(closest-side,rgb(194_232_255/0.08),rgb(114_152_175/0.05)_55%,transparent)] opacity-0 transition-opacity duration-500 max-lg:hidden" />
  );
}

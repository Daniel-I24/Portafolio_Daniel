"use client";

import { useRef, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { useCalm } from "./MotionProvider";

const MAX_TILT = 9; // degrees

/** Pointer position inside the frame (0–1) drives everything through CSS variables; transitions do the easing. */
const frame: CSSProperties = {
  transform: `rotateX(calc((0.5 - var(--py, 0.5)) * ${MAX_TILT * 2}deg)) rotateY(calc((var(--px, 0.5) - 0.5) * ${MAX_TILT * 2}deg))`,
};
const shadow: CSSProperties = {
  transform: "translate(calc((0.5 - var(--px, 0.5)) * 44px), calc((1 - var(--py, 0.5)) * 24px + 6px))",
};
const glare: CSSProperties = {
  backgroundImage: "radial-gradient(circle at calc(var(--px, 0.5) * 100%) calc(var(--py, 0.5) * 100%), rgb(234 255 255 / 0.25), transparent 50%)",
};

/**
 * LED-lit frame that tilts in 3D toward the cursor, with a sheen that follows it and a shadow that slides the
 * other way (the sheen is a light overlay shown only while hovering; the photo itself is untouched).
 * No animation library: the pointer writes two CSS variables and transitions smooth them.
 * Touch screens get a slow sway (`.sway`, CSS). Calm: flat and still.
 */
export function TiltPhoto({ children }: { children: ReactNode }) {
  const calm = useCalm();
  const root = useRef<HTMLDivElement>(null);

  const set = (x: number, y: number) => {
    root.current?.style.setProperty("--px", x.toFixed(3));
    root.current?.style.setProperty("--py", y.toFixed(3));
  };
  const onMove = (event: PointerEvent<HTMLDivElement>) => {
    if (calm || event.pointerType !== "mouse") return;
    const box = event.currentTarget.getBoundingClientRect();
    set((event.clientX - box.left) / box.width, (event.clientY - box.top) / box.height);
  };

  return (
    <div ref={root} onPointerMove={onMove} onPointerLeave={() => set(0.5, 0.5)} className="group relative isolate [perspective:1100px]">
      {/* Shadow: a pre-softened gradient block that only translates. */}
      <div aria-hidden style={calm ? undefined : shadow}
        className="absolute inset-x-[8%] inset-y-[6%] -z-10 rounded-[14%] bg-[radial-gradient(closest-side,rgb(0_6_14/0.75),transparent)] transition-transform duration-500 ease-(--ease-soft)" />
      <div className={calm ? "" : "sway"}>
        <div style={calm ? undefined : frame}
          className="relative overflow-hidden rounded-[12%/13.5%] border border-line bg-deep p-3.5 shadow-lift transition-transform duration-300 ease-out [transform-style:preserve-3d]">
          {children}
          {/* LED strip inside the frame: a thin ice tube with a steady glow (the halo outside does the breathing). */}
          <span aria-hidden className="pointer-events-none absolute inset-[5px] rounded-[12%/13.5%] border-2 border-ice shadow-led" />
          {!calm && <span aria-hidden style={glare} className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />}
        </div>
      </div>
    </div>
  );
}

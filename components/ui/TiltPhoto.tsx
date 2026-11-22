"use client";

import { useRef, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { useCalm } from "./MotionProvider";
import { BAND, FRAME_VIEWBOX, PHOTO_H, PHOTO_W, shapeMask, shapePath } from "./PhotoShape";

const MAX_TILT = 9; // degrees

/** Writes the pointer position inside `el` (0–1) as --px/--py; CSS transforms read them. Shared with the gallery cards. */
export function trackPointer(el: HTMLElement, clientX: number, clientY: number) {
  const box = el.getBoundingClientRect();
  el.style.setProperty("--px", ((clientX - box.left) / box.width).toFixed(3));
  el.style.setProperty("--py", ((clientY - box.top) / box.height).toFixed(3));
}

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

const FRAME_W = PHOTO_W + 2 * BAND;
const FRAME_H = PHOTO_H + 2 * BAND;
/** Where the photo sits inside the frame box, in percentages. */
const photoBox: CSSProperties = {
  left: `${(BAND / FRAME_W) * 100}%`, top: `${(BAND / FRAME_H) * 100}%`,
  width: `${(PHOTO_W / FRAME_W) * 100}%`, height: `${(PHOTO_H / FRAME_H) * 100}%`,
  mask: shapeMask(-4), // 4 px inside the outline: no white fringe from the file's corners
};
const outerClip: CSSProperties = { mask: shapeMask(BAND, BAND) };

/** An SVG layer drawn in photo pixels over the whole frame box. */
const Layer = ({ children }: { children: ReactNode }) => (
  <svg aria-hidden viewBox={FRAME_VIEWBOX} preserveAspectRatio="none" className="pointer-events-none absolute inset-0 size-full overflow-visible">{children}</svg>
);

/**
 * LED-lit frame shaped like the photo file itself (see PhotoShape): a navy band, an ice LED tube inside it and the
 * photo clipped to its own outline, so the file's white corners never show. It tilts in 3D toward the cursor, with a
 * sheen that follows it and a shadow that slides the other way. No animation library: the pointer writes two CSS
 * variables and transitions smooth them. Touch screens get a slow sway (`.sway`, CSS). Calm: flat and still.
 */
export function TiltPhoto({ children }: { children: ReactNode }) {
  const calm = useCalm();
  const root = useRef<HTMLDivElement>(null);

  const onMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!calm && event.pointerType === "mouse") trackPointer(event.currentTarget, event.clientX, event.clientY);
  };
  const reset = () => { root.current?.style.setProperty("--px", "0.5"); root.current?.style.setProperty("--py", "0.5"); };

  return (
    <div ref={root} onPointerMove={onMove} onPointerLeave={reset} className="group relative isolate [perspective:1100px]">
      {/* Shadow: a pre-softened gradient block that only translates. */}
      <div aria-hidden style={calm ? undefined : shadow}
        className="absolute inset-x-[8%] inset-y-[6%] -z-10 rounded-[30%] bg-[radial-gradient(closest-side,rgb(0_6_14/0.75),transparent)] transition-transform duration-500 ease-(--ease-soft)" />
      <div className={calm ? "" : "sway"}>
        <div style={{ ...(calm ? {} : frame), aspectRatio: `${FRAME_W} / ${FRAME_H}` }}
          className="relative transition-transform duration-300 ease-out [transform-style:preserve-3d]">
          <Layer><path d={shapePath(BAND)} fill="var(--color-deep)" stroke="var(--color-line)" strokeWidth={1.5} vectorEffect="non-scaling-stroke" /></Layer>
          <div className="absolute" style={photoBox}>{children}</div>
          {/* LED tube halfway through the band: a soft mist glow under a thin ice core (steady; the halo breathes). */}
          <Layer>
            <path d={shapePath(BAND * 0.45)} fill="none" stroke="var(--color-mist)" strokeOpacity={0.4} strokeWidth={9} vectorEffect="non-scaling-stroke" />
            <path d={shapePath(BAND * 0.45)} fill="none" stroke="var(--color-ice)" strokeWidth={2} vectorEffect="non-scaling-stroke" />
          </Layer>
          {!calm && <span aria-hidden style={{ ...glare, ...outerClip }} className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />}
        </div>
      </div>
    </div>
  );
}

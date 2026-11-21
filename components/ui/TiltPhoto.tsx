"use client";

import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "motion/react";
import type { PointerEvent, ReactNode } from "react";
import { useCalm } from "./MotionProvider";

const SPRING = { stiffness: 160, damping: 18, mass: 0.6 };
const MAX_TILT = 9; // degrees

/**
 * LED-lit frame that tilts in 3D toward the cursor, with a sheen that follows it and a shadow that slides the
 * other way (the sheen is a light overlay shown only while hovering; the photo itself is untouched).
 * Touch screens get a slow sway (`.sway`, CSS). Calm: flat and still.
 */
export function TiltPhoto({ children }: { children: ReactNode }) {
  const calm = useCalm();
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const sx = useSpring(px, SPRING);
  const sy = useSpring(py, SPRING);
  const rotateY = useTransform(sx, [0, 1], [-MAX_TILT, MAX_TILT]);
  const rotateX = useTransform(sy, [0, 1], [MAX_TILT, -MAX_TILT]);
  const shadowX = useTransform(sx, [0, 1], [22, -22]);
  const shadowY = useTransform(sy, [0, 1], [30, 6]);
  const glareX = useTransform(sx, (v) => `${v * 100}%`);
  const glareY = useTransform(sy, (v) => `${v * 100}%`);
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgb(234 255 255 / 0.25), transparent 50%)`;

  const onMove = (event: PointerEvent<HTMLDivElement>) => {
    if (calm || event.pointerType !== "mouse") return;
    const box = event.currentTarget.getBoundingClientRect();
    px.set((event.clientX - box.left) / box.width);
    py.set((event.clientY - box.top) / box.height);
  };
  const onLeave = () => { px.set(0.5); py.set(0.5); };

  return (
    <div onPointerMove={onMove} onPointerLeave={onLeave} className="group relative isolate [perspective:1100px]">
      {/* Shadow: a pre-softened gradient block that only translates. */}
      <motion.div aria-hidden style={calm ? undefined : { x: shadowX, y: shadowY }}
        className="absolute inset-x-[8%] inset-y-[6%] -z-10 translate-y-5 rounded-[2rem] bg-[radial-gradient(closest-side,rgb(0_6_14/0.75),transparent)]" />
      <div className={calm ? "" : "sway"}>
        <motion.div style={calm ? undefined : { rotateX, rotateY }}
          className="relative overflow-hidden rounded-[1.75rem] border border-line bg-deep p-3.5 shadow-lift [transform-style:preserve-3d]">
          {children}
          {/* LED strip inside the frame: a thin ice tube, its glow breathing slowly (opacity only). */}
          <span aria-hidden className="pointer-events-none absolute inset-[5px] rounded-[1.45rem] border-2 border-ice" />
          <span aria-hidden className="pointer-events-none absolute inset-[5px] animate-pulse-led rounded-[1.45rem] shadow-led" />
          {!calm && <motion.span aria-hidden style={{ backgroundImage: glare }} className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />}
        </motion.div>
      </div>
    </div>
  );
}

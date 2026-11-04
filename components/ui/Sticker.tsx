"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

const TONES = {
  paper: "bg-paper text-ink",
  mustard: "bg-mustard text-ink",
  hoodie: "bg-hoodie text-ink",
  denim: "bg-denim text-paper",
  slime: "bg-slime text-ink",
};

interface StickerProps {
  children: ReactNode;
  tone?: keyof typeof TONES;
  /** Resting tilt in degrees. */
  tilt?: number;
  /** Lets visitors drag it around; it springs back to its spot. */
  draggable?: boolean;
  className?: string;
}

/** Die-cut sticker that peels up on hover and can be dragged (it always returns to its place). */
export function Sticker({ children, tone = "paper", tilt = 0, draggable = false, className = "" }: StickerProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={`sticker-cut inline-block px-3 py-2 font-marker ${TONES[tone]} ${draggable ? "cursor-grab touch-none active:cursor-grabbing" : ""} ${className}`}
      style={{ rotate: tilt }}
      whileHover={reduced ? undefined : { rotate: tilt - 4, y: -4, scale: 1.04 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      drag={draggable && !reduced}
      dragSnapToOrigin
      dragElastic={0.6}
      whileDrag={{ scale: 1.1, rotate: tilt + 6, zIndex: 20 }}
    >
      {children}
    </motion.div>
  );
}

"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

const TONES = {
  paper: "bg-paper text-ink",
  mustard: "bg-mustard text-ink",
  hoodie: "bg-hoodie text-ink",
  denim: "bg-denim text-ink",
  slime: "bg-slime text-ink",
};

interface StickerProps {
  children: ReactNode;
  tone?: keyof typeof TONES;
  /** Resting tilt in degrees. */
  tilt?: number;
  className?: string;
}

/** Die-cut sticker that peels up on hover. */
export function Sticker({ children, tone = "paper", tilt = 0, className = "" }: StickerProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={`sticker-cut inline-block px-3 py-2 font-semibold ${TONES[tone]} ${className}`}
      style={{ rotate: tilt }}
      whileHover={reduced ? undefined : { rotate: tilt - 4, y: -4, scale: 1.04 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
    >
      {children}
    </motion.div>
  );
}

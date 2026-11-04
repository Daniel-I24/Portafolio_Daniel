"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState, type ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

/**
 * Fades, lifts and straightens its content the first time it enters the viewport.
 * Sets `data-inview` so descendants can start CSS effects (e.g. title drips) with `group-data-inview:`.
 */
export function Reveal({ children, className = "", delay = 0 }: RevealProps) {
  const reduced = useReducedMotion();
  const [seen, setSeen] = useState(false);
  return (
    <motion.div
      className={`group ${className}`}
      data-inview={seen || undefined}
      initial={reduced ? false : { opacity: 0, y: 28, rotate: -1.5 }}
      whileInView={{ opacity: 1, y: 0, rotate: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      onViewportEnter={() => setSeen(true)}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

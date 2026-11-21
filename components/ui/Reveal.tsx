"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { useCalm } from "./MotionProvider";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Position in a staggered group: each step waits 70 ms more. */
  index?: number;
  as?: "div" | "li";
}

/** Fades and lifts its content the first time it enters the viewport. Static when motion is off. */
export function Reveal({ children, className, index = 0, as = "div" }: RevealProps) {
  const calm = useCalm();
  // Calm: a plain element, so nothing waits for a scroll to become visible.
  if (calm) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }
  const Tag = as === "li" ? motion.li : motion.div;
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, delay: Math.min(index, 8) * 0.07, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </Tag>
  );
}

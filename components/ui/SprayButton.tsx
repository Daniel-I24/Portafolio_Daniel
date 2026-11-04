"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState, type ReactNode } from "react";
import type { IconName } from "@/lib/domain";
import { SprayMist } from "./CharacterParts";
import { Icon } from "./Icon";

interface SprayButtonProps {
  href: string;
  children: ReactNode;
  icon: IconName;
  /** primary = hoodie fill with a spray-red hover shadow; secondary = paper. */
  variant?: "primary" | "secondary";
  /** Adds the download attribute and the shake + check feedback on click. */
  download?: boolean;
  size?: "sm" | "md";
  className?: string;
}

const VARIANTS = {
  primary: "bg-hoodie text-ink hover:shadow-[6px_6px_0_var(--color-spray-red)]",
  secondary: "bg-paper text-ink hover:bg-mustard hover:shadow-sticker-lg",
};

const SIZES = { sm: "gap-2 px-3 py-1.5 text-sm", md: "gap-3 px-5 py-3 text-base" };

/** Link styled as a sticker that puffs spray on hover and squashes when pressed. */
export function SprayButton({ href, children, icon, variant = "primary", download, size = "md", className = "" }: SprayButtonProps) {
  const reduced = useReducedMotion();
  const [hover, setHover] = useState(false);
  const [done, setDone] = useState(false);

  const onClick = () => {
    if (!download) return;
    setDone(true);
    setTimeout(() => setDone(false), 1800);
  };

  return (
    <motion.a
      href={href}
      download={download || undefined}
      onClick={onClick}
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      whileTap={reduced ? undefined : { scaleY: 0.88, scaleX: 1.06 }}
      transition={{ type: "spring", stiffness: 500, damping: 18 }}
      className={`relative inline-flex items-center border-[3px] border-ink font-sans font-extrabold uppercase tracking-wide shadow-sticker transition-[background-color,color,box-shadow,translate] duration-150 hover:-translate-y-0.5 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
    >
      <motion.span
        aria-hidden
        className="inline-flex"
        animate={done && !reduced ? { rotate: [0, -18, 16, -12, 10, 0] } : { rotate: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Icon name={icon} size={size === "sm" ? 18 : 22} />
      </motion.span>
      <span>{children}</span>
      <span className="sr-only" aria-live="polite">{done ? "Descarga iniciada" : ""}</span>
      {done && (
        <span aria-hidden className="absolute -top-3 -right-3 grid size-7 place-items-center rounded-full border-2 border-ink bg-slime font-marker text-sm text-ink">
          ✓
        </span>
      )}
      {hover && !reduced && (
        <svg aria-hidden className="pointer-events-none absolute -right-10 top-1/2 size-12 -translate-y-1/2 overflow-visible" viewBox="0 0 40 40">
          <SprayMist at={[0, 20]} live color={variant === "primary" ? "mustard" : "hoodie"} />
        </svg>
      )}
    </motion.a>
  );
}

"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";

import { DaniBust } from "@/components/characters/DaniBust";
import { c, line } from "@/components/characters/art";
import { HIPS, HoodedHead, Limb, POSES, SHOULDERS, reach, type Pose } from "./CharacterParts";

export type { Pose };

interface CharacterProps {
  pose: Pose;
  variant?: "dani" | "hooded";
  /** When false the character is a still drawing (also forced by prefers-reduced-motion). */
  animated?: boolean;
  className?: string;
  title?: string;
}

/** Random blink every 3–5 s while live. */
function useBlink(live: boolean) {
  const [blink, setBlink] = useState(false);
  useEffect(() => {
    if (!live) return;
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(() => { setBlink(true); timer = setTimeout(() => { setBlink(false); schedule(); }, 140); }, 3000 + Math.random() * 2000);
    };
    schedule();
    return () => clearTimeout(timer);
  }, [live]);
  return blink;
}

const breathe = { duration: 3.2, repeat: Infinity, ease: "easeInOut" } as const;

export function Character({ pose, variant = "dani", animated = true, className, title }: CharacterProps) {
  const reduced = useReducedMotion();
  const live = animated && !reduced;
  const blink = useBlink(live && variant === "dani");

  const frame = (viewBox: string, children: ReactNode) => (
    <motion.svg viewBox={viewBox} className={className} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}
      whileHover={live ? { y: [0, -16, 0], scaleY: [1, 0.9, 1.06, 1], scaleX: [1, 1.08, 0.96, 1] } : undefined}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} style={{ originY: 1 }}>
      {children}
    </motion.svg>
  );

  // Dani is redrawn as a bust; the full-body poses arrive in the next stage of the redesign.
  if (variant === "dani") {
    return frame("0 0 240 280", (
      <motion.g animate={live ? { scale: [1, 1.015, 1] } : undefined} transition={breathe} style={{ originY: 1 }}>
        <DaniBust blink={blink} />
      </motion.g>
    ));
  }

  const def = POSES[pose];
  const arm = (side: 0 | 1) => {
    const limb = <Limb from={[0, 0]} angles={def.arms[side]} len={28} color={c("hood")} shade={c("hood-shade")} width={13} />;
    return (
      <g transform={`translate(${SHOULDERS[side]})`}>
        <motion.g animate={live && side === 1 && pose === "spraying" ? { rotate: [0, -8, 0] } : undefined} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}>
          <circle r={100} fill="none" />{/* centers the bounding box on the shoulder so rotation pivots there */}
          {limb}
          {side === 1 && pose === "spraying" && def.front?.(reach([0, 0], def.arms[1]), live)}
        </motion.g>
      </g>
    );
  };

  return frame("-10 -10 180 250", (
    <g transform={`translate(0 ${def.drop ?? 0})`}>
      {def.back}
      {def.legs.map((angles, i) => <Limb key={i} from={HIPS[i]} angles={angles} len={26} color={c("asphalt")} shade={c("ink")} width={16} foot />)}
      <motion.g animate={live ? { scale: [1, 1.02, 1] } : undefined} transition={breathe}>
        <g {...line} strokeWidth={5}>
          <path d="M58 104q22 14 44 0-6-8-22-8t-22 8z" fill={c("hood-shade")} />
          <path d="M54 106q26-8 52 0l6 64q-32 8-64 0z" fill={c("hood")} />
          <path d="M98 108l8-2 6 64q-8 3-16 4z" fill={c("hood-shade")} stroke="none" />
        </g>
        <HoodedHead />
        {def.head}
      </motion.g>
      {arm(0)}
      {arm(1)}
      {pose !== "spraying" && def.front?.(reach(SHOULDERS[1], def.arms[1]), live)}
    </g>
  ));
}

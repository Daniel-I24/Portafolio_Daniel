"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

import {
  DaniHead, HIPS, HoodedHead, Limb, POSES, SHOULDERS, c, line, reach, type Pose,
} from "./CharacterParts";

export type { Pose };

interface CharacterProps {
  pose: Pose;
  variant?: "dani" | "hooded";
  /** When false the character is a still drawing (also forced by prefers-reduced-motion). */
  animated?: boolean;
  className?: string;
  title?: string;
}

export function Character({ pose, variant = "dani", animated = true, className, title }: CharacterProps) {
  const reduced = useReducedMotion();
  const live = animated && !reduced;
  const [blink, setBlink] = useState(false);
  const def = POSES[pose];
  const dani = variant === "dani";
  const [cloth, clothShade] = dani ? [c("paper"), c("paper-shade")] : [c("hood"), c("hood-shade")];
  const [pants, pantsShade] = dani ? [c("denim"), c("denim-shade")] : [c("asphalt"), c("ink")];
  const movingArm = pose === "spraying" || pose === "waving";

  useEffect(() => {
    if (!live || !dani) return;
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(() => { setBlink(true); timer = setTimeout(() => { setBlink(false); schedule(); }, 140); }, 3000 + Math.random() * 2000);
    };
    schedule();
    return () => clearTimeout(timer);
  }, [live, dani]);

  const arm = (side: 0 | 1) => {
    const limb = <Limb from={[0, 0]} angles={def.arms[side]} len={28} color={cloth} shade={clothShade} width={13} />;
    const swing = pose === "waving" ? [0, 14, -6, 14, 0] : [0, -8, 0];
    return (
      <g transform={`translate(${SHOULDERS[side]})`}>
        <motion.g animate={live && side === 1 && movingArm ? { rotate: swing } : undefined} transition={{ duration: pose === "waving" ? 1.2 : 1.6, repeat: Infinity, ease: "easeInOut" }}>
          <circle r={100} fill="none" />{/* centers the bounding box on the shoulder so rotation pivots there */}
          {limb}
          {side === 1 && pose === "spraying" && def.front?.(reach([0, 0], def.arms[1]), live)}
        </motion.g>
      </g>
    );
  };

  return (
    <motion.svg viewBox="-10 -10 180 250" className={className} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}
      whileHover={live ? { y: [0, -16, 0], scaleY: [1, 0.9, 1.06, 1], scaleX: [1, 1.08, 0.96, 1] } : undefined}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} style={{ originY: 1 }}>
      <g transform={`translate(0 ${def.drop ?? 0})`}>
        {def.back}
        {def.legs.map((angles, i) => <Limb key={i} from={HIPS[i]} angles={angles} len={26} color={pants} shade={pantsShade} width={16} foot />)}
        <motion.g animate={live ? { scale: [1, 1.02, 1] } : undefined} transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}>
          <g {...line} strokeWidth={5}>
            <path d="M58 104q22 14 44 0-6-8-22-8t-22 8z" fill={clothShade} />
            <path d="M54 106q26-8 52 0l6 64q-32 8-64 0z" fill={cloth} />
            <path d="M98 108l8-2 6 64q-8 3-16 4z" fill={clothShade} stroke="none" />
            {dani && <path d="M73 108l-2 22M87 108l2 22M62 146q18-6 36 0l2 16q-20 4-40 0z" strokeWidth={3} />}
          </g>
          <motion.g animate={live && pose === "headphones" ? { rotate: [-4, 4, -4] } : undefined} transition={{ duration: 0.9, repeat: Infinity }}>
            {dani ? <DaniHead blink={blink} /> : <HoodedHead />}
            {def.head}
          </motion.g>
        </motion.g>
        {arm(0)}
        {arm(1)}
        {pose !== "spraying" && def.front?.(reach(SHOULDERS[1], def.arms[1]), live)}
      </g>
    </motion.svg>
  );
}

import { motion } from "motion/react";
import type { ReactNode } from "react";

import { INK, c, line } from "@/components/characters/art";

/* Hooded artist pieces: limbs, props and poses. Dani lives in components/characters. */

export type Pose =
  | "spraying" | "chill" | "laptop" | "volley" | "football" | "riding"
  | "pool" | "headphones" | "waving" | "sitting";

export type P = [number, number];
export type Angles = [number, number];
type PoseDef = { arms: [Angles, Angles]; legs: [Angles, Angles]; drop?: number; back?: ReactNode; head?: ReactNode; front?: (hand: P, live: boolean) => ReactNode };

export const SHOULDERS: [P, P] = [[54, 112], [106, 112]];
export const HIPS: [P, P] = [[68, 168], [92, 168]];
const SIT: [Angles, Angles] = [[-70, 5], [70, -5]];
const STAND: [Angles, Angles] = [[4, 0], [-4, 0]];

/** Angle 0 points down, positive turns toward screen-right. */
const step = ([x, y]: P, deg: number, len: number): P => [x + Math.sin((deg * Math.PI) / 180) * len, y + Math.cos((deg * Math.PI) / 180) * len];
export const reach = (from: P, [a, b]: Angles, len = 28): P => step(step(from, a, len), b, len);

/** Paint particles puffing out of a nozzle; static dots when not live. */
export function SprayMist({ at: [x, y], live, color = "hoodie" }: { at: P; live: boolean; color?: string }) {
  return [0, 1, 2, 3, 4].map((i) => (
    <motion.circle key={i} cx={x} cy={y} r={2 + (i % 3)} fill={c(color)}
      initial={false} animate={live ? { x: [0, 14 + i * 5], y: [0, (i - 2) * 6], opacity: [0.9, 0] } : { x: 10 + i * 4, y: (i - 2) * 4, opacity: 0.6 }}
      transition={{ duration: 0.7, repeat: live ? Infinity : 0, delay: i * 0.12, ease: "easeOut" }} />
  ));
}

const SprayCan = ({ at: [x, y], live }: { at: P; live: boolean }) => (
  <g>
    <g strokeWidth={4} stroke={INK} strokeLinejoin="round">
      <rect x={x - 7} y={y - 22} width={14} height={26} rx={3} fill={c("can")} />
      <rect x={x - 3} y={y - 28} width={6} height={6} fill={c("metal")} />
    </g>
    <SprayMist at={[x + 4, y - 26]} live={live} />
  </g>
);

export const POSES: Record<Pose, PoseDef> = {
  spraying: { arms: [[-15, -5], [120, 150]], legs: STAND, front: (h, live) => <SprayCan at={h} live={live} /> },
  chill: { arms: [[-150, 155], [8, -8]], legs: STAND },
  laptop: {
    arms: [[-25, 55], [25, -55]], legs: SIT, drop: 14,
    front: () => <g {...line} strokeWidth={5}><rect x={52} y={124} width={56} height={34} rx={3} fill={c("concrete")} /><path d="M42 158h76l4 8H38z" fill={c("cement")} /><circle cx={80} cy={141} r={5} fill={c("mustard")} strokeWidth={3} /></g>,
  },
  volley: {
    arms: [[-120, -150], [165, 180]], legs: [[30, -20], [-20, 20]], drop: -12,
    front: (h) => <g {...line} strokeWidth={4}><circle cx={h[0] + 6} cy={h[1] - 16} r={13} fill={c("paper")} /><path d={`M${h[0] - 6} ${h[1] - 20}q12 -4 24 4M${h[0] + 2} ${h[1] - 28}q-2 12 8 22`} strokeWidth={2.5} /></g>,
  },
  football: {
    arms: [[-70, -40], [70, 40]], legs: [[4, 0], [80, -10]],
    front: () => <g {...line} strokeWidth={4}><circle cx={118} cy={214} r={12} fill={c("paper")} /><path d="M112 209l6-3 6 3-2 7h-8z" fill={INK} strokeWidth={1.5} /></g>,
  },
  riding: {
    arms: [[-50, -20], [50, 20]], legs: [[-40, 0], [40, 0]],
    back: <g {...line} strokeWidth={5}><circle cx={18} cy={212} r={18} fill={c("asphalt")} /><circle cx={142} cy={212} r={18} fill={c("asphalt")} /><path d="M18 212l40-26h44l40 26" strokeWidth={7} /><path d="M50 186q30-14 62 0l-4 14H54z" fill={c("hoodie")} /></g>,
  },
  pool: {
    arms: [[-60, -100], [50, -80]], legs: STAND,
    front: () => <g {...line}><path d="M150 146L-4 116" strokeWidth={9} /><path d="M150 146L-4 116" stroke={c("mustard")} strokeWidth={4} /></g>,
  },
  headphones: {
    arms: [[-8, 8], [8, -8]], legs: STAND,
    head: <g {...line}><path d="M44 62Q80-4 116 62" strokeWidth={10} /><path d="M44 62Q80-4 116 62" stroke={c("can")} strokeWidth={5} /><rect x={36} y={56} width={14} height={24} rx={5} fill={c("can")} strokeWidth={4} /><rect x={110} y={56} width={14} height={24} rx={5} fill={c("can")} strokeWidth={4} /></g>,
  },
  waving: { arms: [[-12, -4], [150, 175]], legs: STAND },
  sitting: { arms: [[-20, 10], [20, -10]], legs: SIT, drop: 14 },
};

/** Outlined two-tone limb (two segments) drawn with strokes, ending in a hand or a sneaker. */
export function Limb({ from, angles, len, color, shade, width, foot }: { from: P; angles: Angles; len: number; color: string; shade: string; width: number; foot?: boolean }) {
  const mid = step(from, angles[0], len);
  const end = step(mid, angles[1], len);
  const d = `M${from}L${mid}L${end}`;
  return (
    <g strokeLinecap="round" strokeLinejoin="round" fill="none">
      <path d={d} stroke={INK} strokeWidth={width + 10} />
      <path d={d} stroke={color} strokeWidth={width} />
      <path d={d} stroke={shade} strokeWidth={width / 3} transform="translate(3 1)" />
      {foot
        ? <ellipse cx={end[0] + (from[0] < 80 ? -4 : 4)} cy={end[1] + 4} rx={12} ry={7} fill={c("cream")} stroke={INK} strokeWidth={4} />
        : <circle cx={end[0]} cy={end[1]} r={7} fill={c("skin")} stroke={INK} strokeWidth={4} />}
    </g>
  );
}

export const HoodedHead = () => (
  <g {...line} strokeWidth={5}>
    <circle cx={80} cy={64} r={42} fill={c("hood")} />
    <ellipse cx={80} cy={72} rx={26} ry={27} fill={INK} />
    <path d="M52 56q28-36 56 0zM46 58q34-10 68 0l4 8q-38-10-76 0z" fill={c("cap")} strokeWidth={4} />
  </g>
);

import { motion } from "motion/react";
import type { ReactNode } from "react";

/* Shared drawing pieces: every pose is assembled from these, no SVG is duplicated. */

export type Pose =
  | "spraying" | "chill" | "laptop" | "volley" | "football" | "riding"
  | "pool" | "headphones" | "waving" | "sitting";

export type P = [number, number];
export type Angles = [number, number];
type PoseDef = { arms: [Angles, Angles]; legs: [Angles, Angles]; drop?: number; back?: ReactNode; head?: ReactNode; front?: (hand: P, live: boolean) => ReactNode };

export const c = (token: string) => `var(--color-${token})`;
export const INK = c("ink");
export const line = { fill: "none", stroke: INK, strokeLinecap: "round", strokeLinejoin: "round" } as const;
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
      <rect x={x - 7} y={y - 22} width={14} height={26} rx={3} fill={c("spray-red")} />
      <rect x={x - 3} y={y - 28} width={6} height={6} fill={c("cement")} />
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
    head: <g {...line}><path d="M44 62Q80-4 116 62" strokeWidth={10} /><path d="M44 62Q80-4 116 62" stroke={c("spray-red")} strokeWidth={5} /><rect x={36} y={56} width={14} height={24} rx={5} fill={c("spray-red")} strokeWidth={4} /><rect x={110} y={56} width={14} height={24} rx={5} fill={c("spray-red")} strokeWidth={4} /></g>,
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
        ? <ellipse cx={end[0] + (from[0] < 80 ? -4 : 4)} cy={end[1] + 4} rx={12} ry={7} fill={c("paper")} stroke={INK} strokeWidth={4} />
        : <circle cx={end[0]} cy={end[1]} r={7} fill={c("skin")} stroke={INK} strokeWidth={4} />}
    </g>
  );
}

export function DaniHead({ blink }: { blink: boolean }) {
  return (
    <g {...line} strokeWidth={5}>
      <path d="M40 72Q32 30 62 22Q70 6 88 16Q106 8 114 28Q132 38 120 74Z" fill={c("hair")} />
      <circle cx={46} cy={68} r={7} fill={c("skin")} strokeWidth={4} />
      <circle cx={114} cy={68} r={7} fill={c("skin")} strokeWidth={4} />
      <path d="M45 76a3.5 3.5 0 1 0 1 0M115 76a3.5 3.5 0 1 0 1 0" stroke={c("metal")} strokeWidth={2.5} />
      <ellipse cx={80} cy={66} rx={32} ry={36} fill={c("skin")} stroke="none" />
      <path d="M97 38q16 24 6 56-4 6-12 8 14-30 6-64z" fill={c("skin-shade")} stroke="none" />
      <ellipse cx={80} cy={66} rx={32} ry={36} />
      <path d="M46 58Q48 28 78 28q24-2 36 26-8-6-15-4-6-10-14-2-8-10-15 2-8-8-14 4-6-4-10 4z" fill={c("hair")} strokeWidth={4} />
      <path d="M90 32q14 4 20 18" stroke={c("hair-shade")} strokeWidth={4} />
      <g strokeWidth={3}><path d="M57 52q8-3 16 0M87 52q8-3 16 0" /><path d="M80 70q4 7-1 9" strokeWidth={2.5} /><path d="M69 85q11 7 23-1" /></g>
      <motion.g animate={{ scaleY: blink ? 0.1 : 1 }} transition={{ duration: 0.08 }} style={{ originY: 0.5 }}>
        <ellipse cx={65} cy={66} rx={2.6} ry={3.4} fill={INK} stroke="none" />
        <ellipse cx={95} cy={66} rx={2.6} ry={3.4} fill={INK} stroke="none" />
      </motion.g>
      <g stroke={c("metal")} strokeWidth={2.5} fill={c("paper")} fillOpacity={0.15}>
        <rect x={55} y={58} width={20} height={15} rx={3} /><rect x={85} y={58} width={20} height={15} rx={3} />
        <path d="M75 64q5-3 10 0M55 62l-8 3M105 62l8 3" fill="none" />
      </g>
    </g>
  );
}

export const HoodedHead = () => (
  <g {...line} strokeWidth={5}>
    <circle cx={80} cy={64} r={42} fill={c("hood")} />
    <ellipse cx={80} cy={72} rx={26} ry={27} fill={INK} />
    <path d="M52 56q28-36 56 0zM46 58q34-10 68 0l4 8q-38-10-76 0z" fill={c("spray-red")} strokeWidth={4} />
  </g>
);

import type { CSSProperties } from "react";

/** One wax shape: a pre-softened radial gradient, so motion never animates a blur. */
type Blob = { x: string; y: string; size: string; tone: string; d: number; delay: number; stretch?: boolean };

const NAVY = "rgb(0 70 113 / 0.9)";
const SLATE = "rgb(54 92 115 / 0.55)";
const STEEL = "rgb(114 152 175 / 0.3)";
const DEEP = "rgb(4 42 65 / 0.95)";

/** Few shapes, different tones, sizes and cycles (22–38 s); negative delays so they never move in step. */
const BLOBS: Blob[] = [
  { x: "8%", y: "78%", size: "42vmax", tone: NAVY, d: 34, delay: -4 },
  { x: "62%", y: "18%", size: "36vmax", tone: SLATE, d: 28, delay: -12 },
  { x: "30%", y: "96%", size: "30vmax", tone: STEEL, d: 38, delay: -20, stretch: true },
  { x: "78%", y: "64%", size: "40vmax", tone: NAVY, d: 31, delay: -9 },
  { x: "-6%", y: "26%", size: "28vmax", tone: SLATE, d: 24, delay: -16, stretch: true },
  { x: "46%", y: "48%", size: "24vmax", tone: DEEP, d: 22, delay: -2 },
];

const shape = ({ x, y, size, tone, d, delay, stretch }: Blob): CSSProperties =>
  ({
    left: x,
    top: y,
    width: size,
    height: stretch ? `calc(${size} * 1.4)` : size,
    backgroundImage: `radial-gradient(closest-side, ${tone} 0%, ${tone.replace(/[\d.]+\)$/, "0.35)")} 55%, transparent 100%)`,
    "--d": `${d}s`,
    "--delay": `${delay}s`,
  }) as CSSProperties;

/**
 * Lava-lamp backdrop fixed behind the whole site: blue wax shapes rise, stretch, flatten, overlap (they seem to
 * merge where they cross) and part again, over a soft fog gradient like the palette reference.
 * Pure CSS on the compositor (transform + opacity), paused in hidden tabs, still when motion is off.
 * The tones stay dark enough that every text color keeps 4.5:1 on top.
 */
export function LavaLamp() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-20 overflow-hidden bg-abyss">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,var(--color-abyss)_0%,#03223a_55%,#0b3552_100%)]" />
      {BLOBS.map((blob, i) => (
        <span key={i} className="lava-blob absolute -translate-x-1/2 -translate-y-1/2 rounded-full will-change-transform" style={shape(blob)} />
      ))}
      {/* Fog: a soft light haze rising from the bottom edge, kept faint behind text. */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[radial-gradient(120%_70%_at_50%_100%,rgb(194_232_255/0.12),transparent_70%)]" />
    </div>
  );
}

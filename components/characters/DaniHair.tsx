import { INK, W, c, inked, line, seeded } from "./art";

/* Short textured crop: faded sides, a messy top built from tufts and a straight, heavy fringe. */

/** Head silhouette under the hair: messy clumps break the outline; short sides hug the skull above the ears. */
const MASS =
  "M79 98C75 88 72 79 71 71Q66 66 69 60Q66 52 73 47Q72 40 80 37Q83 30 91 30Q96 22 106 25Q112 18 122 22" +
  "Q131 17 138 23Q147 22 151 29Q159 29 162 37Q170 40 168 48Q174 53 171 60Q174 67 169 72Q168 86 161 98" +
  "L157 98L157 72H83V98Z";

/** Bottom edge of the fringe: pointed clumps at uneven lengths, reaching the brows. */
const TIPS =
  "L164 72L158 78Q157 73 153 74L148 81Q146 76 141 77L135 82Q133 77 128 78L122 83Q120 78 115 79L109 82" +
  "Q108 77 103 78L97 81Q97 76 92 76L86 79Q86 73 81 72";
const FRINGE = `M76 64C86 45 154 42 165 60${TIPS}Q78 69 76 64Z`;
/** Only the tips get an ink edge: the fringe melts into the top without a seam. */
const FRINGE_EDGE = `M165 60${TIPS}Q78 69 76 64`;
const FRINGE_SHADE = `M80 68Q120 61 164 66${TIPS}Z`;

/**
 * Messy texture: tapered comma strokes that grow out of the crown, each with its own lean and length.
 * Even ones are sun-lightened tips (filled crescents), odd ones are thin ink splits between clumps.
 */
const STROKES = (() => {
  const rand = seeded(7);
  const out: { shine: string; split: string }[] = [];
  const f = (n: number) => n.toFixed(1);
  while (out.length < 22) {
    const x = 82 + rand() * 78, y = 27 + rand() * 30;
    if (((x - 121) / 40) ** 2 + ((y - 50) / 25) ** 2 > 0.85) continue;
    const angle = Math.atan2(y - 24, x - 121) + (rand() - 0.5) * 0.9;
    const len = 9 + rand() * 7, dx = Math.cos(angle) * len, dy = Math.sin(angle) * len;
    const [nx, ny] = [-dy / len, dx / len];
    const bend = (k: number) => `${f(dx / 2 + nx * k)} ${f(dy / 2 + ny * k)}`;
    out.push({
      shine: `M${f(x)} ${f(y)}q${bend(3.4)} ${f(dx)} ${f(dy)}q${f(-dx / 2 + nx * 0.6)} ${f(-dy / 2 + ny * 0.6)} ${f(-dx)} ${f(-dy)}z`,
      split: `M${f(x + nx * 5)} ${f(y + ny * 5)}q${bend(2)} ${f(dx * 0.8)} ${f(dy * 0.8)}`,
    });
  }
  return out;
})();
const SHINE = STROKES.map((s) => s.shine);
const TUFTS = STROKES.filter((_, i) => i % 2 === 1).map((s) => s.split);
const STRANDS = [
  "M86 64Q88 70 86 75", "M93 61Q96 69 94 77", "M104 57Q106 68 102 78", "M110 62Q113 70 112 77",
  "M120 56Q124 69 121 81", "M131 61Q133 70 130 78", "M137 57Q141 68 139 79", "M148 62Q150 69 147 76", "M155 60Q158 69 156 75",
];
const FRINGE_SHINE = [
  "M90 60Q100 54 112 55Q101 57 92 63Z", "M118 53Q131 51 143 56Q132 55 120 56Z",
  "M99 66Q101 71 99 75Q98 70 99 66Z", "M125 65Q127 70 125 75Q124 70 125 65Z", "M150 66Q152 70 151 74Q149 70 150 66Z",
];

/** Behind the face: skull, faded sides and short sideburns. */
export function HairBack() {
  return (
    <g>
      <path d={MASS} {...inked(c("hair"))} />
      <path d="M78 72Q77 86 79 97H83V72Z M162 72Q163 86 161 97H157V72Z" fill={c("hair-shade")} />
      <path d="M79 76Q78 86 80 95M161 76Q162 86 160 95" stroke={c("hair-light")} strokeWidth={1} strokeDasharray="1.5 2.5" fill="none" />
    </g>
  );
}

/** In front of the face: the top tufts and the fringe that shades the brow. */
export function HairFront() {
  return (
    <g>
      {SHINE.map((d) => <path key={d} d={d} fill={c("hair-light")} />)}
      <g {...line} strokeWidth={W.fine}>{TUFTS.map((d) => <path key={d} d={d} />)}</g>
      <path d={FRINGE} fill={c("hair")} />
      <path d={FRINGE_SHADE} fill={c("hair-shade")} />
      <path d={FRINGE_EDGE} {...line} strokeWidth={3.4} />
      {FRINGE_SHINE.map((d) => <path key={d} d={d} fill={c("hair-light")} />)}
      <g {...line} stroke={INK} strokeWidth={1.2}>{STRANDS.map((d) => <path key={d} d={d} />)}</g>
    </g>
  );
}

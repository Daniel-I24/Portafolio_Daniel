import { motion } from "motion/react";
import { useId } from "react";

import { INK, W, c, line, seeded } from "./art";
import { FRINGE } from "./DaniHair";

/* Dani's face, head turned ~15° to the right with the chin slightly up. Light from the top left. */

export const FACE = "M84 60L81 96Q82 118 91 134L113 147Q125 153 137 146L153 124Q160 108 160 92L157 60Z";
const JAW = "M81 96Q82 118 91 134L113 147Q125 153 137 146L153 124Q160 108 160 92";
export const EARS = ["M84 90C74 84 69 92 71 103C72 113 77 121 86 121Z", "M157 90C163 87 166 95 165 103C164 111 161 116 155 117Z"];

/** Near eye (bigger) and far eye (foreshortened); irises look back at the viewer. */
const EYES = [
  { shape: "M92.5 98.5Q100 88.5 115.5 95.5Q106 104.5 92.5 98.5Z", lid: "M91.5 99Q100 87.6 116.5 95.4", crease: "M95 91.5Q102 87 112 89.5",
    lower: "M97 101.8Q105 104 113 98.8", iris: [104, 96.8, 4.8], glint: [102.2, 94.6], cy: 96 },
  { shape: "M133 96.5Q140 88 152.5 94Q145 101.5 133 96.5Z", lid: "M132.2 97Q140 87 153.4 93.8", crease: "M135 90Q141.5 86.5 150 88.6",
    lower: "M136.5 99.4Q143 101.2 149.6 97", iris: [141, 95.4, 4.4], glint: [139.4, 93.3], cy: 95 },
] as const;
/** Full brows: thick at the head, arched, tapering out; short strokes give them hair. */
const BROWS = [
  "M89.5 87.5Q95 80.5 105 79Q112 78.6 117.5 81.6L116.8 85Q111 83 105 83.6Q97 84.6 91 89.5Z",
  "M131.5 82Q138 78 146 78.2Q152 78.8 156.5 83L155 85.6Q150 82.4 144.5 82.2Q138 82.4 132 85.2Z",
];
const BROW_HAIRS = "M94 85.5l2.4-3.6M98.5 84.2l2.4-3.8M103 83.4l2.4-3.8M108 83l2.2-3.6M112.5 83.2l2-3M136 83.6l2-3.6M140.5 82.6l2.2-3.6M145 82.4l2.2-3.4M149.5 82.8l2-3";

/** Soft stubble: a few dots over the jaw, upper lip and chin. */
const STUBBLE = (() => {
  const rand = seeded(24);
  const dots: string[] = [];
  while (dots.length < 18) {
    const x = 92 + rand() * 56, y = 128 + rand() * 24;
    const inJaw = y < 150 - Math.abs(x - 124) * 0.5 && y > 130;
    if (inJaw && !(Math.abs(y - 140) < 5 && Math.abs(x - 127) < 16)) dots.push(`M${x.toFixed(1)} ${y.toFixed(1)}h.01`);
  }
  return dots.join("");
})();

function Eye({ eye, blink }: { eye: (typeof EYES)[number]; blink: boolean }) {
  const clip = useId();
  const [ix, iy, r] = eye.iris;
  return (
    <g>
      <motion.g animate={{ scaleY: blink ? 0.08 : 1 }} transition={{ duration: 0.08 }} style={{ originY: `${eye.cy}px` }}>
        <clipPath id={clip}><path d={eye.shape} /></clipPath>
        <path d={eye.shape} fill="#f4ede4" />
        <g clipPath={`url(#${clip})`}>
          <circle cx={ix} cy={iy} r={r} fill={c("iris")} />
          <circle cx={ix} cy={iy} r={r * 0.45} fill={INK} />
          <path d={eye.lid} fill="none" stroke={c("skin-shade")} strokeWidth={3} transform="translate(0 1.6)" opacity={0.55} />
        </g>
        <circle cx={eye.glint[0]} cy={eye.glint[1]} r={1.2} fill="#fff" />
      </motion.g>
      <path d={eye.lid} {...line} strokeWidth={2.4} />
      <path d={eye.crease} {...line} stroke={c("skin-shade")} strokeWidth={W.inner} />
      <path d={eye.lower} {...line} stroke={c("skin-shade")} strokeWidth={W.fine} />
    </g>
  );
}

/** Cel-shaded planes: fringe shadow, far cheek, cheekbone, nose side and under the lip. */
function Planes() {
  const clip = useId();
  return (
    <g fill={c("skin-shade")}>
      <clipPath id={clip}><path d={FACE} /></clipPath>
      <path d={FRINGE} transform="translate(1.5 5)" clipPath={`url(#${clip})`} />
      <path d="M156 92L160 94Q159 110 153 124L137 146Q132 150 127 151L139 136L146 120Q149 106 150 96Z" />
      <path d="M84 114L98 119L90 124Q85 120 84 114Z" />
      <path d="M126 100Q129 112 134 124L131 127Q127 120 124 104Z" />
      <path d="M121 130Q127 133 133 129Q128 132.5 121 130Z" />
      <path d="M119 145.5Q127 149.5 134 144Q131 149 125 150Q120 149 119 145.5Z" />
      <path d="M87 100L97 104L89 108Z" fill={c("skin-light")} />
      <path d="M88 124L112 146Q125 152 136 145L152 123Q146 134 140 136Q128 139 115 137Q99 136 88 124Z" fill={c("hair")} opacity={0.14} />
      <path d="M116 135Q126 132 138 132Q128 135.5 116 135Z" fill={c("hair")} opacity={0.2} />
    </g>
  );
}

/** Ears with small hoops hugging the lobes (the far ear is mostly hidden by the turn). */
export function Ears() {
  return (
    <g>
      {EARS.map((d) => <path key={d} d={d} fill={c("skin")} />)}
      <path d="M82 94C76 92 74 98 75 104C76 110 79 114 83 114Z M158 94Q162 96 161.5 104Q161 110 157 112Z" fill={c("skin-shade")} />
      <path d="M80 98Q76 103 78.5 109" {...line} strokeWidth={W.fine} />
      <path d="M75 94Q72 98 73 103" stroke={c("skin-light")} strokeWidth={1.6} strokeLinecap="round" fill="none" />
      {["M77.4 118.6a2.2 2.2 0 1 0 4 .4", "M157.2 114.6a1.8 1.8 0 1 0 3.2 .3"].map((d) => (
        <g key={d}>
          <path d={d} {...line} strokeWidth={2.4} />
          <path d={d} {...line} stroke={c("metal")} strokeWidth={1} />
        </g>
      ))}
    </g>
  );
}

export function DaniFace({ blink }: { blink: boolean }) {
  return (
    <g>
      <path d={FACE} fill={c("skin")} />
      <Planes />
      <path d={JAW} {...line} strokeWidth={W.edge} />
      <path d="M120 149.5Q125 151.5 130 149M123 102Q124 112 126 120" stroke={c("skin-light")} strokeWidth={2} strokeLinecap="round" fill="none" />
      <path d={STUBBLE} stroke={c("hair-shade")} strokeWidth={0.7} strokeLinecap="round" opacity={0.2} />
      {EYES.map((eye) => <Eye key={eye.shape} eye={eye} blink={blink} />)}
      {BROWS.map((d) => <path key={d} d={d} fill={c("hair")} stroke={INK} strokeWidth={0.8} strokeLinejoin="round" />)}
      <path d={BROW_HAIRS} stroke={c("hair-shade")} strokeWidth={0.9} strokeLinecap="round" />
      {/* Nose: one side line with its shadow plane, a soft base and a single nostril tick */}
      <ellipse cx={128} cy={124.4} rx={2.2} ry={1.4} fill={c("skin-light")} />
      <path d="M125.5 98Q127.5 110 133.6 122.5Q134.6 125.5 132 127.5" {...line} strokeWidth={W.inner} />
      <path d="M121.5 128.5Q125 130.6 129 129.2M130.5 128.4q1.6 .2 2.4-1" {...line} strokeWidth={W.fine} opacity={0.75} />
      {/* Mouth: upper and lower lip, slight smile lifting on the right */}
      <path d="M114 139.5Q119 136.6 124.5 138Q127 136.8 130 137.6Q135.5 136 140.5 134.6Q135 140 127 140.8Q119 141.2 114 139.5Z" fill={c("lip")} />
      <path d="M117.5 141.8Q127 146.6 137.5 139.2Q129 143.2 117.5 141.8Z" fill={c("lip")} opacity={0.6} />
      <path d="M113.4 139.6Q126 142.4 141 134.6" {...line} strokeWidth={1.7} />
      <path d="M141 134.6q1.8-.2 2.4-2.2M113.2 139.6q-1.4 .2-2 1.2" {...line} strokeWidth={W.fine} />
      <path d="M123 143.6Q127 144.6 131 142.8" stroke={c("skin-light")} strokeWidth={1.2} strokeLinecap="round" fill="none" />
    </g>
  );
}

/** One thin metal frame: wide lenses with soft corners and a slim top bridge. */
export function Glasses() {
  const lenses = [
    "M89 88Q88.5 86.5 91 86.5L116 86.5Q119.5 86.5 119.2 90L118 108Q117.6 113 112.5 113L94 113Q89.6 113 89.3 108.5Z",
    "M129.5 87.5Q129.4 85.6 132 85.6L154.5 85.6Q157.8 85.6 157.4 89L156.2 106Q155.8 110.6 151.4 110.6L134.5 110.6Q130.6 110.6 130.3 106.6Z",
  ];
  return (
    <g>
      {lenses.map((d) => <path key={d} d={d} fill={c("cream-light")} opacity={0.08} />)}
      <path d="M95 88.5L101 88.5L92 103Z M146 87.5L150 87.5L142 99Z" fill="#fff" opacity={0.22} />
      <g {...line} stroke={c("metal-shade")} strokeWidth={1.7}>
        {lenses.map((d) => <path key={d} d={d} />)}
        <path d="M119.2 88.2Q124.4 86.6 129.5 87.4M119 93.6Q124 90.8 129.8 93M89.2 90L76 91.5M157.4 89L161 88.6" />
      </g>
      <path d="M92 86.6H112M133 85.7H151" stroke={c("metal-light")} strokeWidth={0.7} strokeLinecap="round" />
    </g>
  );
}

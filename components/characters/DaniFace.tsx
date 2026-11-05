import { motion } from "motion/react";
import { useId } from "react";

import { INK, W, c, inked, line, seeded } from "./art";

/* Dani's face, drawn on a 240 × 280 bust canvas. Light comes from the top left. Paired parts are drawn once and mirrored. */

const FACE = "M82 62C79 90 80 110 86 125L103 148Q111 155 120 156Q129 155 137 148L154 125C160 110 161 90 158 62Z";
const EAR = "M83 91C73 85 67 93 69 104C70 115 76 124 85 123";
const EYE = "M94.5 101.5Q102 95 111.5 100Q103 105.2 94.5 101.5Z";
const BROW = "M89 85C95 81 104 80.2 115.5 80.8L115.8 84.8C106 84.8 97 86 90 87.8Z";
const LENS = "M86.5 89.5L116.5 89.5Q119 89.5 118.6 92L117.4 111.5Q117 116 112.5 116L92 116Q87.6 116 87.1 111.5L85.2 92.4Q85 89.5 86.5 89.5Z";
const HOOP = "M71.6 119.5a2.8 2.8 0 1 0 4.4 -.6";
const mirror = "translate(240 0) scale(-1 1)";

/** Stubble dots scattered over the jaw band, avoiding the mouth. */
const STUBBLE = (() => {
  const rand = seeded(24);
  const dots: string[] = [];
  while (dots.length < 22) {
    const x = 91 + rand() * 58, y = 132 + rand() * 24;
    const inside = y > 135 && y < 155 - Math.abs(x - 120) * 0.62;
    const onMouth = Math.abs(y - 143) < 4.5 && Math.abs(x - 120) < 15;
    if (inside && !onMouth) dots.push(`M${x.toFixed(1)} ${y.toFixed(1)}h.01`);
  }
  return dots.join("");
})();

function Ear({ flip }: { flip?: boolean }) {
  return (
    <g transform={flip ? mirror : undefined}>
      <path d={EAR} {...inked(c("skin"))} />
      <path d="M81 95C75 93 72 99 73.5 106C74.5 112 78 117 82 117Z" fill={c("skin-shade")} />
      <path d="M79 99Q75 104 77.5 111" {...line} strokeWidth={W.fine} />
      <path d="M74 95Q71 99 72 104" stroke={c("skin-light")} strokeWidth={2} strokeLinecap="round" fill="none" />
      {/* Small huggie hoop through the lobe */}
      <path d={HOOP} fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" />
      <path d={HOOP} fill="none" stroke={c("metal")} strokeWidth={1.2} strokeLinecap="round" />
    </g>
  );
}

function Eye({ blink, flip }: { blink: boolean; flip?: boolean }) {
  const clip = useId();
  return (
    <g transform={flip ? mirror : undefined}>
      <motion.g animate={{ scaleY: blink ? 0.08 : 1 }} transition={{ duration: 0.08 }} style={{ originY: "101px" }}>
        <clipPath id={clip}><path d={EYE} /></clipPath>
        <path d={EYE} fill="#f6efe6" />
        <g clipPath={`url(#${clip})`}>
          <circle cx={103.6} cy={100.8} r={3.7} fill={c("iris")} />
          <circle cx={103.6} cy={100.8} r={1.7} fill={INK} />
          <path d={EYE} fill="none" stroke={c("skin-shade")} strokeWidth={2.2} transform="translate(0 -1.4)" opacity={0.6} />
        </g>
        <circle cx={102.4} cy={99.4} r={1} fill="#fff" />
      </motion.g>
      <path d="M93.5 102Q101.5 94.2 112.3 99.8" {...line} strokeWidth={2.8} />
      <path d="M97 96.2Q103.5 93 109.5 95.2" {...line} stroke={c("skin-shade")} strokeWidth={W.fine} />
      <path d="M98.5 104.6Q104.5 106.2 109.4 103" {...line} stroke={c("skin-shade")} strokeWidth={1.1} />
      <path d={BROW} fill={c("hair")} stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
      <path d="M93 84.4Q102 81.6 112 82" stroke={c("hair-light")} strokeWidth={0.9} strokeLinecap="round" fill="none" />
    </g>
  );
}

function Shading() {
  return (
    <g>
      {/* Shadow cast by the fringe, the far cheek plane and the jaw underside */}
      <path d="M82 64H158V79Q152 85 146 81Q139 86 132 82Q124 87 117 82Q109 86 102 82Q95 86 88 81Q85 82 82 80Z" fill={c("skin-shade")} />
      <path d="M151 86C157 102 157 116 151 127L137 147Q130 154 123 155.5C137 142 147 124 149 103Q149 94 146 86Z" fill={c("skin-shade")} />
      <path d="M89 108Q93 118 98 122Q92 122 89 115Z" fill={c("skin-light")} />
      <path d="M118.5 104Q117 114 117.6 124" stroke={c("skin-light")} strokeWidth={2.6} strokeLinecap="round" fill="none" />
      <path d="M111 151.5Q117 154.5 125 152.5" stroke={c("skin-light")} strokeWidth={2.2} strokeLinecap="round" fill="none" />
      <path d="M88 123L104 147Q120 159 136 147L152 123C147 134 139 137 133 136.5Q120 140 107 136.5C101 137 93 134 88 123Z" fill={c("hair")} opacity={0.15} />
      <path d="M110 136.8Q120 134.6 130 136.8Q120 139.2 110 136.8Z" fill={c("hair")} opacity={0.22} />
      <path d={STUBBLE} stroke={c("hair-shade")} strokeWidth={0.7} strokeLinecap="round" opacity={0.18} />
    </g>
  );
}

function Nose() {
  return (
    <g>
      <path d="M113 134Q120 139.5 127 134Q120 136.8 113 134Z" fill={c("skin-shade")} />
      <path d="M122.5 102C124 111 125.5 119 127.4 126.5" {...line} stroke={c("skin-shade")} strokeWidth={1.8} />
      <ellipse cx={119.2} cy={129.2} rx={2.6} ry={1.7} fill={c("skin-light")} />
      {/* Wings taper: heavier on the shadow side, nostrils as short dark notches */}
      <g {...line} strokeWidth={W.fine}>
        <path d="M114.2 127Q111 131 114.6 133.4" />
        <path d="M126 127Q129.6 131 125.6 133.4" strokeWidth={1.9} />
        <path d="M116 133.3Q117.3 134.3 118.6 133.7M121.4 133.7Q122.7 134.3 124 133.3" stroke={c("skin-shade")} strokeWidth={1.6} />
      </g>
    </g>
  );
}

function Mouth() {
  return (
    <g {...line} transform="translate(0 -3)">
      <path d="M110 144.6Q113 146.2 120 146.6Q127.5 146.6 132 143.2" strokeWidth={2.4} />
      <path d="M131.6 143.4Q133.6 142.8 134.4 141" strokeWidth={1.2} />
      <path d="M113.5 149.6Q120 152.2 126.5 149.4" stroke={c("lip")} strokeWidth={2} />
      <path d="M116 153Q120 154.2 124 153" stroke={c("skin-shade")} strokeWidth={1.4} />
    </g>
  );
}

/** Thin metal frames with a top bar: ink edge under a metal core so they read as wire. */
export function Glasses() {
  const frames = (stroke: string, width: number) => (
    <g {...line} stroke={stroke} strokeWidth={width}>
      <path d={LENS} />
      <path d={LENS} transform={mirror} />
      <path d="M116.8 90.4H123.2M117.6 97.4Q120 94.6 122.4 97.4M85.4 93.5L72 92.5M154.6 93.5L168 92.5" />
    </g>
  );
  return (
    <g>
      <path d={LENS} fill={c("cream-light")} opacity={0.1} />
      <path d={LENS} fill={c("cream-light")} opacity={0.1} transform={mirror} />
      <path d="M92 92L100 92L89 109Z M147 92L153 92L140 107Z" fill="#fff" opacity={0.28} />
      {frames(INK, 2.2)}
      {frames(c("metal"), 0.9)}
      <path d="M88 90.6H104M136 90.6H150" stroke={c("metal-light")} strokeWidth={0.9} strokeLinecap="round" />
    </g>
  );
}

export function DaniFace({ blink }: { blink: boolean }) {
  return (
    <g>
      <Ear />
      <Ear flip />
      <path d={FACE} fill={c("skin")} />
      <Shading />
      <path d={FACE} {...line} strokeWidth={W.outer} />
      <path d="M102 147Q111 156 120 156.4Q129 156 138 147Q130 159.5 120 160Q110 159.5 102 147Z" fill={INK} />
      <Eye blink={blink} />
      <Eye blink={blink} flip />
      <Nose />
      <Mouth />
    </g>
  );
}

import { Underlay, W, c, inked, line } from "./art";
import { DaniFace, EARS, Ears, FACE, Glasses } from "./DaniFace";
import { HAIR_MASS, HairBack, HairFront } from "./DaniHair";

/*
 * Dani from the chest up on a 240 × 280 canvas, head and shoulders turned ~15° to the right:
 * the near (left) shoulder is wider, the chest centre sits right of the middle.
 */

const BODY = "M0 296C2 236 10 206 34 194C58 182 88 174 102 170H146C160 173 182 182 200 194C220 207 228 236 230 296Z";
const HOOD_BACK = "M70 190C62 162 92 148 126 148C160 148 186 162 178 190C166 175 146 167 126 167C104 167 82 175 70 190Z";
/** Runs under the crossed hood edges so the opening shows skin, not a shirt. */
const NECK = "M104 128L103 214Q126 222 147 212L146 122Z";
/** Rolled hood edges crossing over the chest: the near one is wider. */
const EDGES = [
  { d: "M156 165C155 184 148 200 130 212L136 223C156 212 167 194 169 170Z", fold: "M162 169C160 188 150 204 133 217", eyelet: [145, 201], tone: "cream-shade" },
  { d: "M98 166C99 186 108 202 130 212L124 223C100 213 86 196 83 172Z", fold: "M90 170C93 190 104 206 127 217", eyelet: [114, 203], tone: "cream" },
] as const;
const CORDS = [
  { d: "M114 205C111 223 107 240 106 258", tip: [106, 257] },
  { d: "M145 203C147 222 151 240 150 262", tip: [150, 261] },
] as const;

function Torso() {
  return (
    <g>
      <path d={HOOD_BACK} fill={c("cream-shade")} />
      <path d={BODY} fill={c("cream")} />
      {/* Far side in shade, light on the near shoulder */}
      <path d="M156 176C178 184 204 198 216 218C226 236 228 262 228 296H190C194 252 190 222 174 198Z" fill={c("cream-shade")} />
      <path d="M12 236C16 216 28 202 50 194C40 204 30 218 24 240Z" fill={c("cream-light")} />
      <g {...line} strokeWidth={W.inner}>
        <path d="M90 176C70 194 58 230 54 296M160 174C176 192 186 228 188 296" />
        <path d="M70 188Q80 184 88 176M178 188Q170 182 162 174M40 250Q46 238 60 234M204 246Q198 238 188 236" strokeWidth={W.fine} />
      </g>
      {/* Tension folds pulled toward the neckline by the hood */}
      <path d="M96 222Q104 236 102 254Q99 238 92 228Z M152 220Q146 236 150 256Q152 238 158 228Z M124 236Q128 250 126 264Q123 250 120 240Z M64 262Q74 248 90 246Q78 252 68 266Z" fill={c("cream-shade")} />

      <path d={NECK} fill={c("skin")} />
      <path d="M104 134L112 150Q125 160 135 150L146 130L146 158Q126 176 104 160Z" fill={c("skin-shade")} />
      <path d="M136 160Q140 176 141 194L147 190L146 154Z" fill={c("skin-shade")} />
      <path d="M110 156Q114 166 117 176M121 170Q125 173 129 170" {...line} stroke={c("skin-shade")} strokeWidth={W.fine} />

      {EDGES.map((e) => (
        <g key={e.d}>
          <path d={e.d} {...inked(c(e.tone))} />
          <path d={e.fold} {...line} stroke={c("cream-shade")} strokeWidth={W.inner} />
          <circle cx={e.eyelet[0]} cy={e.eyelet[1]} r={3.3} {...inked(c("metal"), 1.8)} />
          <circle cx={e.eyelet[0] - 0.7} cy={e.eyelet[1] - 0.7} r={0.9} fill={c("metal-light")} />
        </g>
      ))}
      {CORDS.map(({ d, tip: [x, y] }) => (
        <g key={d}>
          <path d={d} {...line} strokeWidth={5.6} />
          <path d={d} {...line} stroke={c("cream-light")} strokeWidth={2.8} />
          <rect x={x - 2.7} y={y} width={5.4} height={10.5} rx={1.5} {...inked(c("metal"), 1.8)} />
          <path d={`M${x - 1} ${y + 2}v6`} stroke={c("metal-light")} strokeWidth={1} strokeLinecap="round" />
        </g>
      ))}
    </g>
  );
}

export function DaniBust({ blink }: { blink: boolean }) {
  return (
    <g>
      <g transform="translate(0 -10)">
        <Underlay paths={[HOOD_BACK, BODY, NECK]} />
        <Torso />
      </g>
      {/* Chin up, slight tilt: the head pivots on the neck */}
      <g transform="rotate(-4 125 150)">
        <Underlay paths={[...EARS, HAIR_MASS, FACE]} />
        <Ears />
        <HairBack />
        <DaniFace blink={blink} />
        <HairFront />
        <Glasses />
      </g>
    </g>
  );
}

/** Standalone bust as an SVG (preview and avatar use). */
export function DaniBustSvg({ blink = false, className }: { blink?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 240 280" className={className} aria-hidden>
      <DaniBust blink={blink} />
    </svg>
  );
}

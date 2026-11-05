import { INK, W, c, inked, line } from "./art";
import { DaniFace, Glasses } from "./DaniFace";
import { HairBack, HairFront } from "./DaniHair";

/* Dani from the chest up on a 240 × 280 canvas: cream hoodie with the hood down, drawstrings and folds. */

const BODY = "M4 296C4 236 12 210 36 198C60 186 84 176 98 172H142C156 176 180 186 204 198C228 210 236 236 236 296Z";
const HOOD_BACK = "M64 194C56 166 86 152 120 152C154 152 184 166 176 194C164 178 142 170 120 170C98 170 76 178 64 194Z";
/** Runs down to where the hood edges cross, so the V shows skin, not a shirt. */
const NECK = "M102 138L101 206Q120 216 139 206L138 138Z";
/** Hood opening: two rolled edges that cross over the chest. */
const HOOD_EDGE = "M95 168C96 188 104 205 124 216L118 227C95 218 82 200 80 175Z";
const mirror = "translate(240 0) scale(-1 1)";

function Hoodie() {
  return (
    <g>
      <path d={HOOD_BACK} {...inked(c("cream-shade"))} />
      <path d={BODY} {...inked(c("cream"))} />
      {/* Shade on the far side, light on the near shoulder */}
      <path d="M150 180C176 188 206 202 220 222C230 240 232 262 232 296H186C192 252 188 222 170 200Z" fill={c("cream-shade")} />
      <path d="M14 240C18 220 30 206 52 198C42 208 32 222 26 244Z" fill={c("cream-light")} />
      <path d={BODY} {...line} strokeWidth={W.outer} />
      {/* Raglan seams and fabric folds */}
      <g {...line} strokeWidth={W.inner}>
        <path d="M86 180C66 198 54 234 50 296M154 180C174 198 186 234 190 296" />
        <path d="M38 252Q44 240 58 236M200 250Q194 240 182 238M150 246Q160 256 160 272" strokeWidth={W.fine} />
      </g>
      <path d="M62 262Q72 248 88 246Q76 252 66 266Z M170 228Q178 240 178 256Q174 242 166 232Z" fill={c("cream-shade")} />
      {/* Tension folds: the hood's weight pulls the chest fabric toward the neckline */}
      <path d="M92 224Q100 236 98 252Q96 238 88 228Z M146 222Q140 238 144 256Q146 238 152 228Z M114 238Q118 250 116 262Q114 250 110 242Z" fill={c("cream-shade")} />
      <path d="M68 196Q78 192 84 184M172 196Q162 192 156 184" {...line} strokeWidth={W.fine} />
    </g>
  );
}

function Neck() {
  return (
    <g>
      <path d={NECK} {...inked(c("skin"))} />
      <path d="M102 140Q120 168 138 140L138.4 160Q120 180 101.6 160Z" fill={c("skin-shade")} />
      <path d="M128 162Q132 176 134 192L140 190L139 150Z" fill={c("skin-shade")} />
      <path d="M118 174Q120 177 122 174" {...line} stroke={c("skin-shade")} strokeWidth={W.fine} />
    </g>
  );
}

function HoodFront() {
  const edge = (flip: boolean) => (
    <g transform={flip ? mirror : undefined}>
      <path d={HOOD_EDGE} {...inked(flip ? c("cream-shade") : c("cream"))} />
      <path d="M86 175C90 195 101 210 121 221" {...line} stroke={c("cream-shade")} strokeWidth={W.inner} />
      <circle cx={107} cy={208} r={3.4} fill={c("metal")} stroke={INK} strokeWidth={2} />
      <circle cx={106.4} cy={207.3} r={1} fill={c("metal-light")} />
    </g>
  );
  return (
    <g>
      {edge(true)}
      {edge(false)}
    </g>
  );
}

function Drawstrings() {
  const cord = (d: string, tip: [number, number]) => (
    <g>
      <path d={d} {...line} strokeWidth={6.2} />
      <path d={d} {...line} stroke={c("cream-light")} strokeWidth={3} />
      <rect x={tip[0] - 2.8} y={tip[1]} width={5.6} height={11} rx={1.6} {...inked(c("metal"), 2)} />
      <path d={`M${tip[0] - 1} ${tip[1] + 2}v6`} stroke={c("metal-light")} strokeWidth={1} strokeLinecap="round" />
    </g>
  );
  return (
    <g>
      {cord("M107 210C104 228 100 244 99 260", [99, 259])}
      {cord("M133 210C136 230 140 248 138 266", [138, 265])}
    </g>
  );
}

export function DaniBust({ blink }: { blink: boolean }) {
  return (
    <g>
      <g transform="translate(0 -14)">
        <Hoodie />
        <Neck />
        <HoodFront />
        <Drawstrings />
      </g>
      <HairBack />
      <DaniFace blink={blink} />
      <HairFront />
      <Glasses />
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

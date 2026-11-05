import { W, c, line } from "./art";

/*
 * Short textured cut, head turned ~15° to the right: angular tufts leaning forward, faded sides
 * and a choppy, asymmetric fringe (longer on the near side).
 */

/** Skull plus top: each tuft rises on a curved leading edge and drops straight back to the next base. */
export const HAIR_MASS =
  "M81 94L77 80L75 68Q70 64 69 58L77 57Q72 50 73 43L81 46Q81 36 87 31L90 39Q95 27 103 22L102 32" +
  "Q109 22 118 19L115 29Q124 19 131 20L127 28Q137 22 145 25L139 31Q149 30 156 34L149 38" +
  "Q158 40 165 45L158 48Q165 53 169 58L161 60L161 72L160 92L156 92L156 70H84V94Z";

/** Fringe tips, right to left: uneven pointed chunks, shorter on the far side. */
const TIPS =
  "L159 71L155 74L152 70L148 78L144 72L141 75L137 71L134 76L130 72L125 85L121 75L118 78L114 73" +
  "L108 83L104 76L99 79L95 75L90 81L87 74L84 79L80 68";
export const FRINGE = `M78 64C90 48 150 44 162 60L161 64${TIPS}Z`;

/** Clump splits on the top and the strands that break up the fringe (thin, inner weight). */
const SPLITS = [
  "M103 24Q100 34 96 42", "M118 20Q116 32 112 40", "M131 21Q132 32 128 40", "M145 26Q146 34 142 42",
  "M88 32Q88 40 84 48", "M157 35Q156 44 152 50", "M166 46Q164 54 160 58",
  "M88 64L86 74", "M101 58Q102 70 100 77", "M114 57Q116 68 113 74", "M126 56Q128 70 125 79", "M139 58Q141 66 138 71", "M150 60Q152 68 149 75",
];
/** Light catching the ridge of each tuft: angular shards, never round blobs. */
const SHARDS = [
  "M95 32L102 24L99 34Z", "M110 27L117 21L113 30Z", "M124 24L130 21L126 28Z", "M136 27L143 26L137 31Z",
  "M147 33L154 35L148 37Z", "M84 40L88 33L87 42Z", "M76 52L73 45L79 49Z", "M157 44L163 46L157 47Z",
  "M86 50L96 38L112 32L104 40L92 50Z", "M104 60L110 58L105 71Z", "M128 58L133 58L129 70Z", "M92 62L96 61L93 69Z",
];

/** Behind the face: skull, tufts and the faded sides above the ears. */
export function HairBack() {
  return (
    <g>
      <path d={HAIR_MASS} fill={c("hair")} />
      <path d="M76 66L75 80L80 94L84 94L84 66Z M156 64L156 94L160 92L161 70Z" fill={c("hair-shade")} />
      {SHARDS.slice(0, 9).map((d) => <path key={d} d={d} fill={c("hair-light")} />)}
      <g {...line} strokeWidth={W.fine}>{SPLITS.slice(0, 7).map((d) => <path key={d} d={d} />)}</g>
    </g>
  );
}

/** In front of the face: the fringe, its dark underside and its strands. */
export function HairFront() {
  return (
    <g>
      <path d={FRINGE} fill={c("hair")} />
      <path d={`M80 70Q120 62 161 66${TIPS}Z`} fill={c("hair-shade")} />
      {SHARDS.slice(9).map((d) => <path key={d} d={d} fill={c("hair-light")} />)}
      <g {...line} strokeWidth={W.fine}>{SPLITS.slice(7).map((d) => <path key={d} d={d} />)}</g>
      <path d={`M161 64${TIPS}`} {...line} strokeWidth={W.inner} />
    </g>
  );
}

/* Drawing primitives shared by every character layer. */

export const c = (token: string) => `var(--color-${token})`;
export const INK = c("ink");

/** Ink line: round caps and joins, no fill. Spread on a <g> and set strokeWidth per weight. */
export const line = { fill: "none", stroke: INK, strokeLinecap: "round", strokeLinejoin: "round" } as const;

/**
 * Contour weights. `silhouette` is drawn under the fills (half of it shows), so the outer edge
 * reads thick while lines inside the face and hair stay thin.
 */
export const W = { silhouette: 9, edge: 2.4, inner: 1.6, fine: 1.1 } as const;

/** Shape with ink contour: fill plus outline at a given weight. */
export const inked = (fill: string, width: number = W.edge) => ({ ...line, fill, strokeWidth: width });

/** Thick ink silhouettes drawn first; the fills on top leave only the outer half visible. */
export function Underlay({ paths }: { paths: string[] }) {
  return <g {...line} strokeWidth={W.silhouette}>{paths.map((d) => <path key={d} d={d} fill={INK} />)}</g>;
}

/** Deterministic pseudo-random sequence (stable between server and client renders). */
export function seeded(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

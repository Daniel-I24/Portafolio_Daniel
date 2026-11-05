/* Drawing primitives shared by every character layer. */

export const c = (token: string) => `var(--color-${token})`;
export const INK = c("ink");

/** Ink line: round caps and joins, no fill. Spread on a <g> and set strokeWidth per weight. */
export const line = { fill: "none", stroke: INK, strokeLinecap: "round", strokeLinejoin: "round" } as const;

/** Contour weights: silhouette, inner forms and fine details. */
export const W = { outer: 4.5, inner: 2.4, fine: 1.4 } as const;

/** Shape with ink contour: fill plus outline at a given weight. */
export const inked = (fill: string, width: number = W.outer) => ({ ...line, fill, strokeWidth: width });

/** Deterministic pseudo-random sequence (stable between server and client renders). */
export function seeded(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

/**
 * Outline of the hero photo file (public/daniel-sin-hora.webp, 1002 × 880): the picture is a rounded "squircle"
 * on pure white. The points were traced from the file itself (72 rays from the centre, first non-white pixel,
 * lightly smoothed), so the clip, the frame, the LED tube and the halo all follow its real shape.
 */
export const PHOTO_W = 1002;
export const PHOTO_H = 880;
/** Width of the frame band around the photo, in photo pixels. */
export const BAND = 40;

const POINTS: readonly (readonly [number, number])[] = [
  [1000, 440], [1000, 484], [1000, 528], [1000, 574], [997, 621], [993, 670], [986, 721], [976, 774], [960, 826], [928, 866],
  [871, 879], [810, 878], [501, 879], [192, 878], [131, 879], [74, 866], [41, 827], [25, 774], [15, 722], [8, 671],
  [4, 622], [1, 574], [1, 529], [1, 484], [1, 440], [2, 396], [5, 352], [10, 308], [17, 263], [26, 218],
  [39, 173], [58, 130], [86, 92], [123, 63], [166, 42], [212, 28], [257, 18], [301, 11], [343, 6], [384, 3],
  [423, 1], [462, 1], [501, 0], [540, 1], [579, 1], [618, 3], [659, 6], [701, 11], [745, 19], [790, 28],
  [835, 43], [878, 64], [915, 93], [942, 131], [962, 174], [975, 219], [984, 264], [990, 309], [995, 353], [998, 396],
];

const CX = PHOTO_W / 2;
const CY = PHOTO_H / 2;

/** The outline grown (or shrunk) by `by` photo pixels, scaled about the centre (close enough for a convex shape). */
const grown = (by: number) =>
  POINTS.map(([x, y]) => [CX + (x - CX) * (1 + (2 * by) / PHOTO_W), CY + (y - CY) * (1 + (2 * by) / PHOTO_H)] as const);

const num = (n: number) => n.toFixed(1);

/** SVG path of the outline grown by `by`, in photo pixel units: a closed Catmull-Rom curve through the traced points. */
export function shapePath(by = 0): string {
  const p = grown(by);
  const at = (i: number) => p[(i + p.length) % p.length];
  const segments = p.map((_, i) => {
    const [a, b, c, d] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    const c1 = [b[0] + (c[0] - a[0]) / 6, b[1] + (c[1] - a[1]) / 6];
    const c2 = [c[0] - (d[0] - b[0]) / 6, c[1] - (d[1] - b[1]) / 6];
    return `C${num(c1[0])} ${num(c1[1])} ${num(c2[0])} ${num(c2[1])} ${num(c[0])} ${num(c[1])}`;
  });
  return `M${num(p[0][0])} ${num(p[0][1])}${segments.join("")}Z`;
}

/**
 * CSS mask (an inline SVG) that keeps only the outline grown by `by`, for a box covering the photo grown by `box`.
 * A mask, unlike a polygon clip, keeps the curve smooth at every size.
 */
export function shapeMask(by: number, box = 0): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='${-box} ${-box} ${PHOTO_W + 2 * box} ${PHOTO_H + 2 * box}' preserveAspectRatio='none'><path d='${shapePath(by)}'/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 0 0 / 100% 100% no-repeat`;
}

/** viewBox of the whole framed photo: the photo plus the band on every side. */
export const FRAME_VIEWBOX = `${-BAND} ${-BAND} ${PHOTO_W + 2 * BAND} ${PHOTO_H + 2 * BAND}`;

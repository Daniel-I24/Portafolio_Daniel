import { BAND, FRAME_VIEWBOX, shapePath } from "./PhotoShape";

/**
 * Blue light that an LED mirror throws on the wall: a soft halo with the photo's own outline (PhotoShape),
 * stronger below it, breathing slowly (opacity only). The blur lives inside a static SVG, so it is drawn once
 * and the breathing never repaints it. Place it over the same box as the framed photo. With motion off it rests at full light.
 */
export function Glow({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox={FRAME_VIEWBOX} preserveAspectRatio="none"
      className={`pointer-events-none absolute inset-0 -z-10 size-full animate-pulse-led overflow-visible ${className}`}>
      <defs>
        <filter id="glow-soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="46" /></filter>
      </defs>
      <g filter="url(#glow-soft)">
        <path d={shapePath(BAND + 30)} fill="none" stroke="rgb(194 232 255)" strokeOpacity={0.5} strokeWidth={70} />
        <path d={shapePath(BAND + 40)} transform="translate(0 70)" fill="none" stroke="rgb(114 152 175)" strokeOpacity={0.55} strokeWidth={90} />
      </g>
    </svg>
  );
}

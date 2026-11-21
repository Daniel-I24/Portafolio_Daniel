/** Halo layer: a pre-softened ellipse (the falloff is in the gradient, so no blur is ever animated). */
const halo = (inner: string, outer: string) => `radial-gradient(closest-side, ${inner} 0%, ${outer} 45%, transparent 100%)`;

const MIST = "rgb(194 232 255 / 0.75)";
const STEEL = "rgb(114 152 175 / 0.45)";

/**
 * Blue light that an LED mirror throws on the wall: a soft halo around the photo, stronger below it,
 * breathing slowly (opacity only). With motion off it rests at full light.
 */
export function Glow({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute -z-10 animate-pulse-led ${className}`}>
      <span className="absolute inset-[6%] rounded-[40%]" style={{ backgroundImage: halo("rgb(194 232 255 / 0.45)", "rgb(114 152 175 / 0.28)") }} />
      <span className="absolute inset-x-[8%] -bottom-[6%] h-[55%] rounded-full" style={{ backgroundImage: halo(MIST, STEEL) }} />
    </div>
  );
}

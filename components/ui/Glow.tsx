/** Soft radial layer in one tone of the light family; the falloff is in the gradient, so nothing animates a blur. */
const layer = (color: string, core: number) =>
  `radial-gradient(closest-side, ${color} 0%, ${color} ${core}%, ${color.replace("/ 1)", "/ 0.4)")} ${core + 30}%, transparent 100%)`;

const RUST = "rgb(178 54 20 / 1)";
const TERRACOTTA = "rgb(208 80 47 / 1)";
const CORAL = "rgb(242 119 90 / 1)";
const AMBER = "rgb(244 166 42 / 1)";

interface GlowProps {
  /** `photo`: full neon light behind the hero photo. `section`: a faint wash in one corner of a section. */
  variant?: "photo" | "section";
  className?: string;
}

/**
 * Colored light on the paper: three gradient layers in the rust → amber family that drift and cross-fade
 * on 13–19 s cycles (transform and opacity only). Every cycle starts and ends at rest, so with motion off it stays still.
 */
export function Glow({ variant = "photo", className = "" }: GlowProps) {
  const strong = variant === "photo";
  return (
    <div aria-hidden className={`pointer-events-none absolute -z-10 ${strong ? "opacity-100" : "opacity-20"} ${className}`}>
      <span className="absolute -left-[4%] -top-[4%] size-[78%] animate-drift-a rounded-full" style={{ backgroundImage: layer(strong ? RUST : TERRACOTTA, 32) }} />
      <span className="absolute -bottom-[4%] -right-[4%] size-[78%] animate-drift-b rounded-full" style={{ backgroundImage: layer(AMBER, 28) }} />
      <span className="absolute left-[18%] top-[20%] size-[66%] animate-drift-c rounded-full" style={{ backgroundImage: layer(strong ? CORAL : TERRACOTTA, 28) }} />
      {strong && <span className="absolute -bottom-[2%] -left-[2%] size-[56%] animate-drift-b rounded-full [animation-delay:-6s]" style={{ backgroundImage: layer(TERRACOTTA, 24) }} />}
    </div>
  );
}

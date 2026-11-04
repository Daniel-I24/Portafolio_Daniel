import { Reveal } from "./Reveal";

const DRIPS = [
  { left: "14%", height: "h-8 sm:h-12", delay: "delay-100" },
  { left: "41%", height: "h-12 sm:h-16", delay: "delay-300" },
  { left: "74%", height: "h-6 sm:h-9", delay: "delay-500" },
];

interface SectionTitleProps {
  id: string;
  kicker: string;
  children: string;
  /** Paint color of the title and its drips. */
  tone?: "paper" | "hoodie" | "mustard";
  className?: string;
}

const TONES = {
  paper: { text: "text-paper", drip: "bg-paper" },
  hoodie: { text: "text-hoodie", drip: "bg-hoodie" },
  mustard: { text: "text-mustard", drip: "bg-mustard" },
};

/** Section heading painted in spray letters; drips fall once the title enters the viewport. */
export function SectionTitle({ id, kicker, children, tone = "paper", className = "" }: SectionTitleProps) {
  const colors = TONES[tone];
  return (
    <Reveal className={className}>
      <p className="font-marker text-lg text-mustard">{kicker}</p>
      <h2 id={id} className={`relative inline-block whitespace-nowrap font-spray text-[clamp(2rem,9.5vw,4.5rem)] leading-none ${colors.text}`}>
        {children}
        {DRIPS.map((drip) => (
          <span
            key={drip.left}
            aria-hidden
            style={{ left: drip.left }}
            className={`absolute top-[82%] w-2.5 origin-top scale-y-0 rounded-b-full transition-transform duration-700 ease-(--ease-snap) group-data-inview:scale-y-100 ${drip.height} ${drip.delay} ${colors.drip}`}
          />
        ))}
      </h2>
    </Reveal>
  );
}

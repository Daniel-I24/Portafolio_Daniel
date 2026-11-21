import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import type { IconName } from "@/lib/domain";
import type { InterestData } from "@/lib/schemas";

export type InterestView = InterestData & { icon: IconName };

/**
 * Tile colors in turn, all solid so every interest carries the same weight; each pair keeps text at 4.5:1 or more.
 * A cycle of four never puts two equal colors side by side on one, two or three columns.
 */
const TONES = ["bg-pine text-card", "bg-rust text-card", "bg-marigold text-ink", "bg-ink text-card"];

/** Even grid of current interests: same-sized tiles, each with its own icon, title and note. */
export function OffTheClock({ interests }: { interests: InterestView[] }) {
  return (
    <Section id="mas-alla-del-codigo" glow title="Más allá del código" lead="Lo que disfruto cuando no estoy programando.">
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {interests.map((interest, i) => (
          <Reveal as="li" key={interest.id} index={i}
            className={`group flex min-h-56 flex-col justify-between rounded-3xl p-7 transition-[translate,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lift ${TONES[i % TONES.length]}`}>
            <Icon name={interest.icon} size={44} className="transition-transform duration-500 ease-(--ease-soft) group-hover:-rotate-12 group-hover:scale-110" />
            <div className="mt-10">
              <h3 className="font-display text-xl font-semibold">{interest.title}</h3>
              {interest.note && <p className="mt-2 max-w-md">{interest.note}</p>}
              {interest.playlistUrl && (
                <a href={interest.playlistUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold underline underline-offset-4">
                  Escuchar mi playlist <Icon name="external" size={16} /><span className="sr-only"> (abre en una pestaña nueva)</span>
                </a>
              )}
            </div>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}

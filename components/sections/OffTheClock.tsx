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
const TONES = ["bg-navy text-ice", "bg-slate text-ice", "bg-mist text-abyss", "bg-deep text-ice border border-steel"];

/** Even grid of current interests: same-sized tiles with their own icon, title and note, lifting in 3D on hover. */
export function OffTheClock({ interests }: { interests: InterestView[] }) {
  return (
    <Section id="mas-alla-del-codigo" title="Más allá del código" lead="Lo que disfruto cuando no estoy programando." surface="bone">
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {interests.map((interest, i) => (
          <Reveal as="li" key={interest.id} index={i} className="[perspective:900px]">
            {/* Hover: the tile lifts and tilts in 3D, an inner glow lights up and the icon swings (transform/opacity only). */}
            <div className={`group relative flex h-full min-h-56 flex-col justify-between rounded-3xl p-7 transition-[transform,box-shadow] duration-500 ease-(--ease-soft) hover:shadow-lift hover:[transform:translateY(-8px)_rotateX(7deg)_rotateY(-4deg)] ${TONES[i % TONES.length]}`}>
              <span aria-hidden className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 shadow-[inset_0_0_0_1.5px_var(--color-mist),inset_0_0_48px_-10px_var(--color-mist)] transition-opacity duration-500 group-hover:opacity-100" />
              <Icon name={interest.icon} size={44} className="transition-transform duration-700 ease-(--ease-soft) group-hover:-translate-y-1.5 group-hover:-rotate-12 group-hover:scale-115" />
              <div className="mt-10">
                <h3 className="font-display text-xl font-semibold">{interest.title}</h3>
                {interest.note && <p className="mt-2 max-w-md">{interest.note}</p>}
                {interest.playlistUrl && (
                  <a href={interest.playlistUrl} target="_blank" rel="noopener noreferrer" className="relative mt-3 inline-flex items-center gap-1.5 text-sm font-semibold underline underline-offset-4">
                    Escuchar mi playlist <Icon name="external" size={16} /><span className="sr-only"> (abre en una pestaña nueva)</span>
                  </a>
                )}
              </div>
            </div>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}

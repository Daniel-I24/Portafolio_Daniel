import { Character } from "@/components/ui/Character";
import { Reveal } from "@/components/ui/Reveal";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Sticker } from "@/components/ui/Sticker";
import type { ProfileData, SkillData } from "@/lib/schemas";

interface AboutProps {
  profile: ProfileData;
  skills: SkillData[];
  /** Current studies, e.g. "Ingeniería de Software · UCC". */
  studies: string;
  interests: string[];
}

const TAPE_TILTS = ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2"];

export function About({ profile, skills, studies, interests }: AboutProps) {
  const facts = [
    { label: "Ubicación", value: profile.location, tone: "mustard", tilt: -6 },
    { label: "Estudio", value: studies, tone: "paper", tilt: 4 },
    { label: "Meta", value: profile.goal, tone: "hoodie", tilt: -3 },
    { label: "Fuera del código", value: interests.join(" · "), tone: "denim", tilt: 5 },
  ] as const;

  return (
    <section id="sobre-mi" aria-labelledby="sobre-mi-title" className="scroll-mt-16 px-4 py-24 sm:px-6">
      <div className="mx-auto grid max-w-7xl items-start gap-14 lg:grid-cols-[1.25fr_1fr]">
        <div>
          <SectionTitle id="sobre-mi-title" kicker="quién pinta esta pared">Sobre mí</SectionTitle>
          <Reveal delay={0.1} className="mt-10">
            <article className="shape-torn relative -rotate-1 bg-paper px-6 py-10 text-ink sm:px-10">
              <span aria-hidden className="absolute -top-1 left-1/2 h-7 w-28 -translate-x-1/2 rotate-2 bg-mustard/70" />
              <p className="text-lg leading-relaxed sm:text-xl">{profile.about}</p>
              <p className="mt-6 text-right font-tag text-3xl text-ink">— {profile.tag}</p>
            </article>
          </Reveal>

          <Reveal delay={0.15} className="mt-12">
            <h3 className="font-marker text-2xl text-paper">Mi stack</h3>
            <ul className="mt-5 flex flex-wrap gap-3" aria-label="Habilidades y tecnologías">
              {skills.map((skill, i) => (
                <li key={skill.id} className={`border-x-2 border-dashed border-ink/30 bg-mustard/90 px-3 py-1 font-mono text-sm text-ink shadow-sticker-sm ${TAPE_TILTS[i % TAPE_TILTS.length]}`}>
                  {skill.name}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <div className="relative lg:pt-28">
          <Character pose="chill" title="Dani con la mano en el pelo" className="mx-auto w-48 sm:w-56" />
          <h3 className="sr-only">Datos rápidos</h3>
          <p className="mt-4 text-center font-mono text-sm text-cement" aria-hidden>arrastra los stickers ↓</p>
          <dl className="mt-4 flex flex-wrap justify-center gap-5">
            {facts.map((fact) => (
              <Sticker key={fact.label} tone={fact.tone} tilt={fact.tilt} draggable className="max-w-64">
                <dt className="font-mono text-sm uppercase">{fact.label}</dt>
                <dd className="text-lg leading-tight">{fact.value}</dd>
              </Sticker>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

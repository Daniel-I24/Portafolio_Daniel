import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import type { ProfileData, SkillData } from "@/lib/schemas";

interface AboutProps {
  profile: ProfileData;
  skills: SkillData[];
  /** Current studies, e.g. "Ingeniería de Software · UCC". */
  studies: string;
}

/** Profile text, photo, quick facts and the stack grouped by category (no levels or percentages). */
export function About({ profile, skills, studies }: AboutProps) {
  const facts = [
    ["Ubicación", profile.location],
    ["Estudio", studies],
    ["Meta", profile.goal],
  ].filter(([, value]) => value);
  const groups = [...new Set(skills.map((skill) => skill.group))];

  return (
    <Section id="sobre-mi" title="Sobre mí" lead="Quién soy y con qué trabajo.">
      <div className="grid items-start gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
        {profile.photo && (
          <Reveal className="mx-auto w-full max-w-80 lg:sticky lg:top-28">
            <div className="rounded-3xl border border-line bg-card p-3">
              <Image src={profile.photo} alt="" width={1002} height={880} sizes="320px" className="h-auto w-full" />
            </div>
          </Reveal>
        )}

        <div>
          <Reveal>
            <p className="font-display text-lg leading-relaxed sm:text-xl sm:leading-snug">{profile.about}</p>
          </Reveal>
          <Reveal index={1}>
            <dl className="mt-10 grid gap-x-8 gap-y-5 border-t border-line pt-8 sm:grid-cols-3">
              {facts.map(([label, value]) => (
                <div key={label}>
                  <dt className="text-sm font-medium uppercase tracking-[0.12em] text-muted">{label}</dt>
                  <dd className="mt-1.5 font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>

      <h3 className="mt-20 font-display text-xl font-semibold">Mi stack</h3>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((group, i) => (
          <Reveal as="li" key={group} index={i} className="rounded-2xl border border-line bg-card p-6 transition-colors duration-150 hover:border-ink">
            <h4 className="text-sm font-medium uppercase tracking-[0.12em] text-rust">{group}</h4>
            <ul className="mt-4 flex flex-wrap gap-2" aria-label={`Tecnologías de ${group}`}>
              {skills.filter((skill) => skill.group === group).map((skill) => (
                <li key={skill.id} className="rounded-full border border-line bg-paper px-3 py-1.5 text-sm font-medium">{skill.name}</li>
              ))}
            </ul>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}

import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import type { ProfileData, SkillData } from "@/lib/schemas";

interface AboutProps {
  profile: ProfileData;
  skills: SkillData[];
}

/** Profile text beside the quick facts, then the stack grouped by category (no levels or percentages). */
export function About({ profile, skills }: AboutProps) {
  const facts = [
    ["Ubicación", profile.location],
    ["Enfoque", "Web, móvil y APIs"],
    ["Meta", profile.goal],
  ].filter(([, value]) => value);
  const groups = [...new Set(skills.map((skill) => skill.group))];

  return (
    <Section id="sobre-mi" title="Sobre mí" lead="Quién soy y con qué trabajo.">
      <div className="grid gap-10 lg:grid-cols-[1.7fr_1fr] lg:gap-16">
        <Reveal>
          <p className="font-display text-lg leading-relaxed sm:text-xl sm:leading-relaxed lg:text-2xl lg:leading-snug">{profile.about}</p>
        </Reveal>
        <Reveal index={1}>
          <dl className="grid gap-x-8 gap-y-6 border-t border-line pt-8 sm:grid-cols-3 lg:grid-cols-1 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-1">
            {facts.map(([label, value]) => (
              <div key={label}>
                <dt className="text-sm font-medium uppercase tracking-[0.12em] text-mist">{label}</dt>
                <dd className="mt-1.5 text-lg font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>

      <h3 className="mt-16 font-display text-xl font-semibold">Mi stack</h3>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((group, i) => (
          <Reveal as="li" key={group} index={i} className="rounded-2xl border border-line bg-deep p-6 transition-colors duration-150 hover:border-steel">
            <h4 className="text-sm font-medium uppercase tracking-[0.12em] text-sky">{group}</h4>
            <ul className="mt-4 flex flex-wrap gap-2" aria-label={`Tecnologías de ${group}`}>
              {skills.filter((skill) => skill.group === group).map((skill) => (
                <li key={skill.id} className="rounded-full border border-line bg-abyss px-3 py-1.5 text-sm font-medium">{skill.name}</li>
              ))}
            </ul>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}

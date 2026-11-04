import { Icon } from "@/components/ui/Icon";
import { shortPhrase, type IconName } from "@/lib/domain";
import { getPortfolio } from "@/lib/patterns";

// Phase 1 placeholder: proves tokens, fonts, textures, icons and the repository end to end.
// Phase 2 replaces it with the composed sections.
const ICONS: IconName[] = [
  "spray", "github", "linkedin", "mail", "download", "apk", "arrow", "volley", "football",
  "moto", "pool", "music", "shield", "code", "edit", "trash", "plus", "logout",
];

export default async function HomePage() {
  const { profile, projects, skills } = await getPortfolio();
  return (
    <main id="inicio" className="texture-concrete texture-cracks min-h-dvh bg-concrete px-4 py-16 sm:px-10">
      <p className="font-tag text-5xl text-hoodie">{profile.tag}</p>
      <h1 className="mt-4 max-w-3xl font-spray text-5xl leading-none text-paper sm:text-7xl">{profile.fullName}</h1>
      <p className="mt-6 inline-block -rotate-2 bg-mustard px-3 py-1 font-marker text-lg text-ink shadow-sticker">
        {profile.goal}
      </p>
      <p className="mt-6 max-w-xl text-lg">{shortPhrase(profile)}</p>

      <ul className="mt-10 flex flex-wrap gap-4 text-paper" aria-label="Iconos">
        {ICONS.map((name) => (
          <li key={name}><Icon name={name} size={32} label={name} /></li>
        ))}
      </ul>

      <ul className="mt-10 flex flex-wrap gap-3">
        {skills.map((skill) => (
          <li key={skill.id} className="bg-paper px-2 py-1 font-mono text-sm text-ink shadow-sticker-sm">
            {skill.data.name} · {skill.levelLabel}
          </li>
        ))}
      </ul>

      <p className="mt-10 font-mono text-sm text-cement">
        {projects.length} proyectos publicados · fuente: {process.env.NEXT_PUBLIC_SUPABASE_URL ? "Supabase" : "seed.json"}
      </p>
    </main>
  );
}

import { Character } from "@/components/ui/Character";
import { Icon } from "@/components/ui/Icon";
import type { IconName } from "@/lib/domain";
import type { ProfileData } from "@/lib/schemas";
import { SECTIONS } from "./Navbar";

interface FooterProps {
  profile: ProfileData;
  socials: { label: string; url: string; icon: IconName }[];
}

/** Wall strip with the big tag, quick links, socials and a spray can that shoots back to the top. */
export function Footer({ profile, socials }: FooterProps) {
  const year = new Date().getFullYear();
  return (
    <footer id="footer" className="texture-concrete relative mt-16 border-t-[3px] border-ink bg-concrete px-4 pb-10 pt-20 sm:px-6">
      {/* Hips (≈77% of the drawing) rest on the top edge so the legs hang over the wall. */}
      <Character pose="sitting" className="absolute right-6 top-0 w-20 -translate-y-[77%] sm:right-16 sm:w-24" />

      <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-tag text-8xl leading-none text-mustard" aria-hidden>{profile.tag}</p>
          <p className="mt-4 max-w-sm text-paper">{profile.role} · {profile.goal}</p>
        </div>

        <nav aria-label="Enlaces rápidos">
          <h2 className="font-marker text-xl text-paper">Enlaces rápidos</h2>
          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 font-mono text-sm">
            {SECTIONS.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`} className="text-paper underline decoration-mustard decoration-2 underline-offset-4 hover:text-mustard">{section.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="font-marker text-xl text-paper">Redes</h2>
          <ul className="mt-4 flex gap-3">
            {socials.map((social) => {
              const external = social.url.startsWith("http");
              return (
                <li key={social.url}>
                  <a href={social.url} aria-label={external ? `${social.label} (abre en una pestaña nueva)` : social.label}
                    {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="grid size-12 place-items-center border-[3px] border-ink bg-paper text-ink shadow-sticker-sm transition-transform duration-150 hover:-rotate-6 hover:bg-mustard">
                    <Icon name={social.icon} size={24} />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-14 flex max-w-7xl flex-wrap items-end justify-between gap-6 border-t-2 border-dashed border-ink pt-6 text-sm text-paper">
        <div className="space-y-1">
          <p>© {year} {profile.fullName} · {profile.location}</p>
          <p className="font-mono">Hecho con Next.js + Tailwind CSS</p>
        </div>
        <a href="#inicio" className="group mr-20 inline-flex items-center gap-2 font-marker text-lg text-paper">
          <span className="grid size-12 place-items-center rounded-full border-[3px] border-ink bg-mustard text-ink shadow-sticker transition-transform duration-300 ease-(--ease-snap) group-hover:-translate-y-2 group-active:-translate-y-24">
            <Icon name="spray" size={26} />
          </span>
          Volver arriba
        </a>
      </div>
    </footer>
  );
}

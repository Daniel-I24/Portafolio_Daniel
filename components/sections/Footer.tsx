import { Icon } from "@/components/ui/Icon";
import { container, SECTIONS } from "@/components/ui/Section";
import type { IconName } from "@/lib/domain";
import type { ProfileData } from "@/lib/schemas";

interface FooterProps {
  profile: ProfileData;
  socials: { label: string; url: string; icon: IconName }[];
}

const linkClass = "text-card/85 underline-offset-4 transition-colors duration-150 hover:text-card hover:underline";

/** Name, quick links, socials, back to top and the credits line. */
export function Footer({ profile, socials }: FooterProps) {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-ink pb-10 pt-20 text-card">
      <div className={container}>
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_auto]">
          <div>
            <p className="font-display text-3xl font-semibold leading-none sm:text-4xl">{profile.displayName}</p>
            <p className="mt-4 max-w-sm text-card/85">{profile.role} · {profile.location}</p>
          </div>

          <nav aria-label="Enlaces rápidos">
            <h2 className="text-sm font-medium uppercase tracking-[0.12em] text-marigold">Enlaces rápidos</h2>
            <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5">
              {SECTIONS.map((section) => (
                <li key={section.id}><a href={`#${section.id}`} className={linkClass}>{section.label}</a></li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-sm font-medium uppercase tracking-[0.12em] text-marigold">Redes</h2>
            <ul className="mt-4 flex gap-3">
              {socials.map((social) => {
                const external = social.url.startsWith("http");
                return (
                  <li key={social.url}>
                    <a href={social.url} aria-label={external ? `${social.label} (abre en una pestaña nueva)` : social.label}
                      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="grid size-12 place-items-center rounded-full border border-card/30 transition-[background-color,color,translate] duration-150 hover:-translate-y-0.5 hover:bg-card hover:text-ink">
                      <Icon name={social.icon} />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-6 border-t border-card/20 pt-8 text-sm">
          <div className="space-y-1 text-card/85">
            <p>© {year} {profile.fullName}</p>
            <p>Hecho con Next.js + Tailwind</p>
          </div>
          <a href="#inicio" className="group inline-flex items-center gap-3 font-semibold">
            Volver arriba
            <span className="grid size-11 place-items-center rounded-full bg-card text-ink transition-transform duration-300 ease-(--ease-soft) group-hover:-translate-y-1">
              <Icon name="arrow" size={18} className="-rotate-90" />
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}

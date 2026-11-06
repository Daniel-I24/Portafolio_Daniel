import { SprayButton } from "@/components/ui/SprayButton";
import type { ProfileData } from "@/lib/schemas";

/** Page sections in order; `keywords` feed the bubble-menu Trie search. */
export const SECTIONS = [
  { id: "inicio", label: "Inicio", keywords: "home portada cv" },
  { id: "sobre-mi", label: "Sobre mí", keywords: "perfil quien soy datos stack habilidades" },
  { id: "proyectos", label: "Proyectos", keywords: "trabajos apps codigo github demo apk" },
  { id: "testimonios", label: "Testimonios", keywords: "opiniones recomendaciones referencias" },
  { id: "experiencia", label: "Experiencia", keywords: "estudios academica laboral universidad trayectoria" },
  { id: "contacto", label: "Contacto", keywords: "correo email mensaje escribir linkedin" },
  { id: "mas-alla-del-codigo", label: "Más allá del código", keywords: "fuera gustos hobbies voley futbol motos billar musica rap ejercicio" },
] as const;

/** Thin fixed bar: tag on the left, anchors from lg up, CV on the right. Mobile navigation lives in BubbleMenu. */
export function Navbar({ profile, cvNote }: { profile: ProfileData; cvNote?: string }) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b-[3px] border-ink bg-asphalt">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:bg-mustard focus:px-3 focus:py-1 focus:text-ink">
        Saltar al contenido
      </a>
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="#inicio" className="font-tag text-3xl leading-none text-hoodie transition-transform duration-150 hover:-rotate-3" aria-label={`${profile.tag}, ir al inicio`}>
          {profile.tag}
        </a>
        <nav aria-label="Secciones" className="hidden lg:block">
          <ul className="flex items-center gap-1 font-mono text-sm">
            {SECTIONS.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`} className="px-2 py-1 text-paper decoration-mustard decoration-[3px] underline-offset-4 transition-colors duration-150 hover:text-mustard hover:underline">
                  {section.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <SprayButton href={profile.cvUrl} download icon="download" size="sm" missingNote={cvNote}>
          Descargar CV
        </SprayButton>
      </div>
    </header>
  );
}

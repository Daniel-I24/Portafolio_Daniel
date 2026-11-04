import type {
  ExperienceData, InterestData, InterestSlug, ProfileData, ProjectData, ProjectKind,
  SkillData, SkillLevel, TestimonialData,
} from "./schemas";
import { periodKey } from "./structures";

export type IconName =
  | "spray" | "github" | "linkedin" | "mail" | "download" | "apk" | "arrow"
  | "volley" | "football" | "moto" | "pool" | "music" | "shield" | "code"
  | "edit" | "trash" | "plus" | "logout";

/** Short hero phrase: the explicit tagline, or the first sentence of "about". */
export const shortPhrase = (profile: ProfileData): string => profile.tagline || (profile.about.match(/^[^.!?]+[.!?]/)?.[0] ?? "");

export type Accent = "hoodie" | "mustard" | "denim" | "spray-red" | "slime";

export type Card = { title: string; subtitle: string; tags: string[] };
export type CardAction = { label: string; href: string; icon: IconName; note?: string }; // note: why it is the README

type EntityMeta = { id: string; order: number; published: boolean };

/** Base of every content model: wraps its validated row and renders itself as a card. */
export abstract class Entity<T extends EntityMeta = EntityMeta> {
  constructor(readonly data: T) {}

  get id(): string { return this.data.id; }
  get order(): number { return this.data.order; }
  get published(): boolean { return this.data.published; }

  abstract toCard(): Card;
}

type LinkSpec = { label: string; icon: IconName; url: (p: ProjectData) => string };

/** The kind decides the main link shown next to "Código". */
const KIND_ACTIONS: Record<ProjectKind, LinkSpec> = {
  web: { label: "Demo en vivo", icon: "arrow", url: (p) => p.liveUrl },
  mobile: { label: "Descargar APK", icon: "apk", url: (p) => p.apkUrl || p.liveUrl },
  api: { label: "Documentación", icon: "code", url: (p) => p.liveUrl },
  desktop: { label: "Ver código", icon: "github", url: (p) => p.repoUrl },
  game: { label: "Descargar juego", icon: "download", url: (p) => p.downloadUrl },
};

/** "Código" first, then the kind action, then any other link the project carries. */
const LINK_ORDER: LinkSpec[] = [
  { label: "Código", icon: "github", url: (p) => p.repoUrl },
  { label: "Ver sitio", icon: "arrow", url: (p) => p.liveUrl },
  { label: "Descargar APK", icon: "apk", url: (p) => p.apkUrl },
  { label: "Descargar", icon: "download", url: (p) => p.downloadUrl },
];

const NO_DEMO_NOTES: Record<ProjectKind, string> = {
  web: "La demo pública todavía no está desplegada: el README explica cómo correr el proyecto en local.",
  mobile: "Todavía no hay un APK publicado: el README explica cómo compilar e instalar la app.",
  api: "Es una API sin interfaz web pública: el README documenta cómo ejecutarla y probar sus endpoints.",
  desktop: "Es una aplicación de escritorio, no corre en el navegador: el README explica cómo instalarla y ejecutarla.",
  game: "El juego todavía no tiene una versión descargable: el README explica cómo compilarlo y ejecutarlo.",
};

export class Project extends Entity<ProjectData> {
  get stack(): string[] { return this.data.stack; }
  get kind(): ProjectKind { return this.data.kind; }
  get repoUrl(): string { return this.data.repoUrl; }
  get liveUrl(): string { return this.data.liveUrl; }
  get apkUrl(): string { return this.data.apkUrl; }

  /** Every existing link, without repeats. With only "Código" left, the README becomes the second link. */
  links(): CardAction[] {
    const [code, ...rest] = LINK_ORDER;
    const seen = new Set<string>();
    const links: CardAction[] = [code, KIND_ACTIONS[this.kind], ...rest].flatMap(({ label, icon, url }) => {
      const href = url(this.data);
      if (!href || seen.has(href)) return [];
      seen.add(href);
      return [{ label: href === this.liveUrl && this.data.liveLabel ? this.data.liveLabel : label, icon, href }];
    });
    if (links.length < 2 && this.repoUrl) {
      links.push({ label: "Documentación", icon: "code", href: `${this.repoUrl}#readme`, note: NO_DEMO_NOTES[this.kind] });
    }
    return links;
  }

  toCard(): Card {
    return { title: this.data.title, subtitle: this.data.summary, tags: this.stack };
  }
}

export class Testimonial extends Entity<TestimonialData> {
  /** Initials for the drawn avatar when there is no photo. */
  get initials(): string {
    return this.data.name.split(/\s+/).slice(0, 2).map((word) => word[0]?.toUpperCase()).join("");
  }

  toCard(): Card {
    return { title: this.data.name, subtitle: this.data.quote, tags: [this.data.role] };
  }
}

const LEVEL_LABELS: Record<SkillLevel, { label: string; fill: number }> = {
  3: { label: "Avanzado", fill: 0.9 },
  2: { label: "Intermedio", fill: 0.6 },
  1: { label: "Aprendiendo", fill: 0.3 },
};

export class Skill extends Entity<SkillData> {
  get levelLabel(): string { return LEVEL_LABELS[this.data.level].label; }
  /** Paint level of the spray can, 0..1. */
  get fill(): number { return LEVEL_LABELS[this.data.level].fill; }

  toCard(): Card {
    return { title: this.data.name, subtitle: this.levelLabel, tags: [this.data.group] };
  }
}

const INTEREST_ICONS: Record<InterestSlug, IconName> = {
  voley: "volley", futbol: "football", motos: "moto", billar: "pool", musica: "music", deporte: "arrow",
};

export class Interest extends Entity<InterestData> {
  get icon(): IconName { return INTEREST_ICONS[this.data.slug]; }

  toCard(): Card {
    return { title: this.data.title, subtitle: this.data.note, tags: [] };
  }
}

export abstract class Experience extends Entity<ExperienceData> {
  abstract badge(): string;
  abstract accent(): Accent;
  abstract icon(): IconName;

  /** Newest-first sort key derived from the period label. */
  get sortKey(): number { return periodKey(this.data.period); }

  toCard(): Card {
    return { title: this.data.title, subtitle: this.data.place, tags: [this.badge(), this.data.period] };
  }
}

export class AcademicExperience extends Experience {
  badge(): string { return "Académica"; }
  accent(): Accent { return "mustard"; }
  icon(): IconName { return "shield"; }
}

export class WorkExperience extends Experience {
  badge(): string { return "Proyectos / laboral"; }
  accent(): Accent { return "hoodie"; }
  icon(): IconName { return "code"; }
}

import type {
  ExperienceData, InterestData, InterestSlug, Platform, ProfileData, ProjectData,
  SkillData, TestimonialData,
} from "./schemas";
import { periodKey } from "./structures";

export type IconName =
  | "github" | "linkedin" | "mail" | "download" | "apk" | "arrow" | "external" | "copy" | "check"
  | "pin" | "menu" | "close" | "pause" | "play" | "volley" | "football" | "moto" | "pool" | "music"
  | "dumbbell" | "shield" | "code" | "edit" | "trash" | "plus" | "logout";

/** Up to two initials, upper-case: the monogram ("DI") and avatars without a photo. */
export const initialsOf = (name: string): string =>
  name.split(/\s+/).slice(0, 2).map((word) => word[0]?.toUpperCase() ?? "").join("");

/** Short hero phrase: the explicit tagline, or the first sentence of "about". */
export const shortPhrase = (profile: ProfileData): string => profile.tagline || (profile.about.match(/^[^.!?]+[.!?]/)?.[0] ?? "");

export type Accent = "sky" | "mist";

export type Card = { title: string; subtitle: string; tags: string[] };
export type CardAction = { label: string; href: string; icon: IconName };

type EntityMeta = { id: string; order: number; published: boolean };

/** Base of every content model: wraps its validated row and renders itself as a card. */
export abstract class Entity<T extends EntityMeta = EntityMeta> {
  constructor(readonly data: T) {}

  get id(): string { return this.data.id; }
  get order(): number { return this.data.order; }
  get published(): boolean { return this.data.published; }

  abstract toCard(): Card;
}

/** Visible name of each platform, in filter order: filter chips, card labels and the "plataformas" figure. */
export const PLATFORM_LABELS: Record<Platform, string> = {
  web: "Web", mobile: "Móvil", wearable: "Wearable", desktop: "Escritorio", game: "Videojuego", api: "API",
};

type LinkSpec = { label: string; icon: IconName; url: (p: ProjectData) => string };

/** Each platform's main link, next to "Código"; the most specific first (watch APK before phone APK). */
const PLATFORM_ACTIONS: [Platform, LinkSpec][] = [
  ["wearable", { label: "APK del reloj", icon: "apk", url: (p) => p.apkUrl }],
  ["mobile", { label: "Descargar APK", icon: "apk", url: (p) => p.apkUrl }],
  ["web", { label: "Demo en vivo", icon: "arrow", url: (p) => p.liveUrl }],
  ["game", { label: "Descargar juego", icon: "download", url: (p) => p.downloadUrl }],
  ["desktop", { label: "Descargar", icon: "download", url: (p) => p.downloadUrl }],
  ["api", { label: "Documentación", icon: "code", url: (p) => p.liveUrl }],
];

/** "Código" first, then the platform actions, then any other link the project carries. */
const LINK_ORDER: LinkSpec[] = [
  { label: "Código", icon: "github", url: (p) => p.repoUrl },
  { label: "Demo en vivo", icon: "arrow", url: (p) => p.liveUrl },
  { label: "Descargar APK", icon: "apk", url: (p) => p.apkUrl },
  { label: "Descargar", icon: "download", url: (p) => p.downloadUrl },
];

export class Project extends Entity<ProjectData> {
  get stack(): string[] { return this.data.stack; }
  get platforms(): Platform[] { return this.data.platforms; }
  get repoUrl(): string { return this.data.repoUrl; }
  get liveUrl(): string { return this.data.liveUrl; }
  get apkUrl(): string { return this.data.apkUrl; }

  /** Gallery relevance: featured, then most complete (ways to try it + detail), then newest; manual order breaks ties. */
  get relevance(): number[] {
    const d = this.data;
    const filled = [d.liveUrl, d.apkUrl, d.downloadUrl, d.imageUrl, d.problem, d.solution, d.myRole, d.learnings].filter(Boolean).length;
    return [Number(d.featured), filled + d.extraLinks.length, periodKey(d.period)];
  }

  /** Every existing link, without repeats, extra links last. With only "Código" left, the README becomes the second link. */
  links(): CardAction[] {
    const [code, ...rest] = LINK_ORDER;
    const seen = new Set<string>();
    const actions = PLATFORM_ACTIONS.filter(([platform]) => this.platforms.includes(platform)).map(([, spec]) => spec);
    const extras = this.data.extraLinks.map(({ label, url }): LinkSpec => ({ label, icon: "external", url: () => url }));
    const links: CardAction[] = [code, ...actions, ...rest, ...extras].flatMap(({ label, icon, url }) => {
      const href = url(this.data);
      if (!href || seen.has(href)) return [];
      seen.add(href);
      return [{ label: href === this.liveUrl && this.data.liveLabel ? this.data.liveLabel : label, icon, href }];
    });
    if (links.length < 2 && this.repoUrl) {
      links.push({ label: "Documentación", icon: "code", href: `${this.repoUrl}#readme` });
    }
    return links;
  }

  toCard(): Card {
    return { title: this.data.title, subtitle: this.data.summary, tags: this.stack };
  }
}

export class Testimonial extends Entity<TestimonialData> {
  /** Initials for the drawn avatar when there is no photo. */
  get initials(): string { return initialsOf(this.data.name); }

  toCard(): Card {
    return { title: this.data.name, subtitle: this.data.quote, tags: [this.data.role] };
  }
}

export class Skill extends Entity<SkillData> {
  toCard(): Card {
    return { title: this.data.name, subtitle: this.data.group, tags: [] };
  }
}

const INTEREST_ICONS: Record<InterestSlug, IconName> = {
  voley: "volley", futbol: "football", motos: "moto", billar: "pool", musica: "music", deporte: "dumbbell",
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
  accent(): Accent { return "sky"; }
  icon(): IconName { return "shield"; }
}

export class WorkExperience extends Experience {
  badge(): string { return "Laboral"; }
  accent(): Accent { return "mist"; }
  icon(): IconName { return "code"; }
}

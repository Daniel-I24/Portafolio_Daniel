import type {
  ExperienceData, InterestData, InterestSlug, ProfileData, ProjectData, ProjectKind,
  SkillData, SkillLevel, TestimonialData,
} from "./schemas";

export type IconName =
  | "spray" | "github" | "linkedin" | "mail" | "download" | "apk" | "arrow"
  | "volley" | "football" | "moto" | "pool" | "music" | "shield" | "code"
  | "edit" | "trash" | "plus" | "logout";

export type Accent = "hoodie" | "mustard" | "denim" | "spray-red" | "slime";

export type Card = { title: string; subtitle: string; tags: string[] };
export type CardAction = { label: string; href: string; icon: IconName };

export abstract class Entity {
  constructor(
    readonly id: string,
    readonly order: number,
    readonly published: boolean,
  ) {}

  abstract toCard(): Card;
}

type KindAction = { label: string; icon: IconName; url: (p: ProjectData) => string };

const KIND_ACTIONS: Record<ProjectKind, KindAction> = {
  web: { label: "Demo en vivo", icon: "arrow", url: (p) => p.liveUrl },
  mobile: { label: "Descargar APK", icon: "apk", url: (p) => p.apkUrl || p.liveUrl },
  api: { label: "Documentación", icon: "code", url: (p) => p.liveUrl },
  desktop: { label: "Ver código", icon: "github", url: (p) => p.repoUrl },
};

export class Project extends Entity {
  constructor(readonly data: ProjectData) {
    super(data.id, data.order, data.published);
  }

  get stack(): string[] { return this.data.stack; }
  get kind(): ProjectKind { return this.data.kind; }
  get repoUrl(): string { return this.data.repoUrl; }
  get liveUrl(): string { return this.data.liveUrl; }
  get apkUrl(): string { return this.data.apkUrl; }

  /** Secondary card action depends on the project kind; null when its URL is missing or repeats "Código". */
  secondaryAction(): CardAction | null {
    const action = KIND_ACTIONS[this.kind];
    const href = action.url(this.data);
    return href && href !== this.repoUrl ? { label: action.label, icon: action.icon, href } : null;
  }

  toCard(): Card {
    return { title: this.data.title, subtitle: this.data.summary, tags: this.stack };
  }
}

export class Testimonial extends Entity {
  constructor(readonly data: TestimonialData) {
    super(data.id, data.order, data.published);
  }

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

export class Skill extends Entity {
  constructor(readonly data: SkillData) {
    super(data.id, data.order, data.published);
  }

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

export class Interest extends Entity {
  constructor(readonly data: InterestData) {
    super(data.id, data.order, data.published);
  }

  get icon(): IconName { return INTEREST_ICONS[this.data.slug]; }

  toCard(): Card {
    return { title: this.data.title, subtitle: this.data.note, tags: [] };
  }
}

export abstract class Experience extends Entity {
  constructor(readonly data: ExperienceData) {
    super(data.id, data.order, data.published);
  }

  abstract badge(): string;
  abstract accent(): Accent;
  abstract icon(): IconName;

  /** Sort key: the latest year in the period ("2024 — hoy" counts as the current year). */
  get year(): number {
    if (/hoy|actual/i.test(this.data.period)) return new Date().getFullYear();
    const years = this.data.period.match(/\d{4}/g)?.map(Number) ?? [];
    return years.length ? Math.max(...years) : 0;
  }

  toCard(): Card {
    return { title: this.data.title, subtitle: this.data.place, tags: [this.badge(), this.data.period] };
  }
}

export class AcademicExperience extends Experience {
  badge(): string { return "Académica"; }
  accent(): Accent { return "mustard"; }
  icon(): IconName { return "shield"; }
}

/** Short hero phrase: the explicit tagline, or the first sentence of "about". */
export const shortPhrase = (profile: ProfileData): string =>
  profile.tagline || (profile.about.match(/^[^.!?]+[.!?]/)?.[0] ?? "");

export class WorkExperience extends Experience {
  badge(): string { return "Proyectos / laboral"; }
  accent(): Accent { return "hoodie"; }
  icon(): IconName { return "code"; }
}

import type {
  ExperienceData, InterestData, InterestKey, ProjectData, ProjectKind,
  SkillData, SkillLevel, TestimonialData,
} from "./schemas";

export type IconName =
  | "spray" | "github" | "linkedin" | "mail" | "download" | "apk" | "arrow"
  | "volley" | "football" | "moto" | "pool" | "music" | "shield" | "code"
  | "edit" | "trash" | "plus" | "logout";

export type Accent = "hoodie" | "mustard" | "denim" | "spray-red" | "slime";

export interface Card {
  title: string;
  subtitle: string;
  tags: string[];
}

export interface CardAction {
  label: string;
  href: string;
  icon: IconName;
}

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
  mobile: { label: "Descargar APK", icon: "apk", url: (p) => p.apkUrl },
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

  /** Secondary card action depends on the project kind; null when its URL is still missing. */
  secondaryAction(): CardAction | null {
    const action = KIND_ACTIONS[this.kind];
    const href = action.url(this.data);
    return href ? { label: action.label, icon: action.icon, href } : null;
  }

  toCard(): Card {
    return { title: this.data.title, subtitle: this.data.summary, tags: this.stack };
  }
}

export class Testimonial extends Entity {
  constructor(readonly data: TestimonialData) {
    super(data.id, data.order, data.published);
  }

  toCard(): Card {
    return { title: this.data.author, subtitle: this.data.quote, tags: [this.data.relation] };
  }
}

const LEVEL_LABELS: Record<SkillLevel, { label: string; fill: number }> = {
  advanced: { label: "Avanzado", fill: 0.9 },
  intermediate: { label: "Intermedio", fill: 0.6 },
  learning: { label: "Aprendiendo", fill: 0.3 },
};

export class Skill extends Entity {
  constructor(readonly data: SkillData) {
    super(data.id, data.order, data.published);
  }

  get levelLabel(): string { return LEVEL_LABELS[this.data.level].label; }
  /** Paint level of the spray can, 0..1. */
  get fill(): number { return LEVEL_LABELS[this.data.level].fill; }

  toCard(): Card {
    return { title: this.data.name, subtitle: this.levelLabel, tags: [this.data.category] };
  }
}

const INTEREST_ICONS: Record<InterestKey, IconName> = {
  volley: "volley", football: "football", moto: "moto", pool: "pool", music: "music",
};

export class Interest extends Entity {
  constructor(readonly data: InterestData) {
    super(data.id, data.order, data.published);
  }

  get icon(): IconName { return INTEREST_ICONS[this.data.key]; }

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

  get startDate(): Date { return new Date(this.data.startDate); }

  /** Human period such as "2023 — actual". */
  period(): string {
    const end = this.data.endDate ? this.data.endDate.slice(0, 4) : "actual";
    return `${this.data.startDate.slice(0, 4)} — ${end}`;
  }

  toCard(): Card {
    return { title: this.data.title, subtitle: this.data.place, tags: [this.badge(), this.period()] };
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

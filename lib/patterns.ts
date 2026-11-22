import { z } from "zod";
import { AcademicExperience, Interest, Project, Skill, Testimonial, WorkExperience, type Experience } from "./domain";
import { CACHE_TAGS, ENTITY_TABLES, entitySchemas, profileSchema, type EntityInput, type EntityRow, type EntityTable } from "./schemas";
import { byKeys, byNewest, byOrder } from "./structures";

/* ---------- Repository + Strategy: interchangeable data sources ---------- */
export { CACHE_TAGS };
/** Unparsed rows as stored (seed or DB); EntityFactory validates them. */
export type Snapshot = { profile: z.input<typeof profileSchema> } & { [T in EntityTable]: Partial<EntityInput<T>>[] };
export interface Repository { snapshot(): Promise<Snapshot> }

/** Reads content/seed.json; used when Supabase env vars are missing so the build never breaks. */
export class SeedRepository implements Repository {
  /** `includeDrafts` is for the admin import, which copies every row (drafts too) into Supabase. */
  constructor(private readonly includeDrafts = false) {}

  async snapshot(): Promise<Snapshot> {
    const seed = (await import("@/content/seed.json")).default as unknown as Snapshot;
    // Seed rows have no id/order: derive them from the slug (or position) and the file order.
    const withMeta = (table: EntityTable) =>
      seed[table]
        .map((row, index) => ({ id: ("slug" in row && row.slug) || `${table}-${index + 1}`, order: index, ...row }))
        .filter((row) => this.includeDrafts || row.published !== false);
    return { profile: seed.profile, ...Object.fromEntries(ENTITY_TABLES.map((t) => [t, withMeta(t)])) } as Snapshot;
  }
}

/** Supabase when its env vars exist, else content/seed.json. The lazy import keeps the SDK out of client bundles. */
export const hasSupabase = (): boolean => Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
export const repository = async (): Promise<Repository> => hasSupabase() ? new (await import("./supabase")).SupabaseRepository() : new SeedRepository();

/** Supabase reads are cached by tag (admin saves revalidate). next/cache is imported lazily: the browser bundle never pulls it in. */
const cachedSnapshot = async (): Promise<Snapshot> =>
  (await import("next/cache")).unstable_cache(async () => (await repository()).snapshot(), ["portfolio"], { tags: [...CACHE_TAGS] })();
/** Falls back to the seed when Supabase fails or its profile row is missing/invalid (empty DB), so builds never break. */
export const getSnapshot = async (): Promise<Snapshot> => {
  const live = hasSupabase() ? await cachedSnapshot().catch((e) => void console.error("Supabase read failed:", e)) : null;
  return live && profileSchema.safeParse(live.profile).success ? live : new SeedRepository().snapshot();
};

/* ---------- Factory: rows → domain subclasses ---------- */
const BUILDERS: { [T in EntityTable]: (data: EntityRow<T>) => Project | Testimonial | Experience | Skill | Interest } = {
  projects: (data) => new Project(data),
  testimonials: (data) => new Testimonial(data),
  skills: (data) => new Skill(data),
  interests: (data) => new Interest(data),
  experience: (data) => (data.type === "academic" ? new AcademicExperience(data) : new WorkExperience(data)),
};

export class EntityFactory {
  /** Validates a row with its schema and builds the matching subclass; invalid rows are skipped. */
  static from(table: EntityTable, row: unknown) {
    const parsed = entitySchemas[table].safeParse(row);
    return parsed.success ? BUILDERS[table](parsed.data as never) : null;
  }

  static build(snapshot: Snapshot) {
    const list = <E>(table: EntityTable) =>
      snapshot[table].map((row) => EntityFactory.from(table, row)).filter(Boolean) as E[];
    return {
      profile: profileSchema.parse(snapshot.profile),
      projects: byKeys(byOrder(list<Project>("projects")), (project) => project.relevance),
      testimonials: byOrder(list<Testimonial>("testimonials")),
      experience: byNewest(list<Experience>("experience"), (e) => e.sortKey),
      skills: byOrder(list<Skill>("skills")),
      interests: byOrder(list<Interest>("interests")),
    };
  }
}

export type Portfolio = ReturnType<typeof EntityFactory.build>;
export const getPortfolio = async (): Promise<Portfolio> => EntityFactory.build(await getSnapshot());
/* ---------- Strategy: validation rules, combined with Zod ---------- */
export interface ValidationRule { check(value: string): string | null }

export class MinLength implements ValidationRule {
  constructor(private readonly min: number, private readonly message: string) {}
  check(value: string) { return value.trim().length >= this.min ? null : this.message; }
}
export class Required extends MinLength {
  constructor(message: string) { super(1, message); }
}
/** Rules backed by a format pattern. Plain RegExps keep the browser (rules + observer only) free of Zod. */
abstract class FormatRule implements ValidationRule {
  constructor(private readonly format: RegExp, private readonly message: string) {}
  check(value: string) { return this.format.test(value.trim()) ? null : this.message; }
}
/** Same shape Zod's z.email() accepts. */
const EMAIL = /^(?!\.)(?!.*\.\.)[\w'+.-]*[\w+-]@([a-z\d][a-z\d-]*\.)+[a-z]{2,}$/i;
export class Email extends FormatRule {
  constructor() { super(EMAIL, "Revisa el correo: debe verse como nombre@dominio.com."); }
}
export class Url extends FormatRule {
  constructor() { super(/^https:\/\/[^\s/$.?#][^\s]*$/i, "El enlace debe empezar por https://"); }
}

/** First failing message, or null. Used for live validation in the browser. */
export const runRules = (value: string, rules: ValidationRule[]): string | null =>
  rules.map((rule) => rule.check(value)).find(Boolean) ?? null;

/** Wraps rules into a Zod string so the server validates with the exact same messages. */
export const ruleField = (rules: ValidationRule[], max: number) =>
  z.string().trim().max(max).superRefine((value, ctx) => {
    const message = runRules(value, rules);
    if (message) ctx.addIssue({ code: "custom", message });
  });

export const contactRules = {
  name: [new Required("Escribe tu nombre."), new MinLength(2, "Tu nombre necesita al menos 2 letras.")],
  email: [new Required("Escribe tu correo para poder responderte."), new Email()],
  message: [new Required("Escribe tu mensaje."), new MinLength(10, "Cuéntame un poco más (mínimo 10 caracteres).")],
} satisfies Record<string, ValidationRule[]>;

const buildContactSchema = () => z.object({
  name: ruleField(contactRules.name, 80),
  email: ruleField(contactRules.email, 120),
  message: ruleField(contactRules.message, 2000),
  website: z.string().max(0).optional(), // honeypot: humans never fill it
});
/** Built through a pure call so client bundles (which only use the rules) can drop it, and Zod with it. */
export const contactSchema = /* @__PURE__ */ buildContactSchema();

export type ContactInput = z.infer<typeof contactSchema>;

/* ---------- Observer: one IntersectionObserver, many subscribers (scroll spy, reveals) ---------- */
export type SectionListener = (id: string, visible: boolean) => void;
export class SectionObserver {
  private readonly listeners = new Set<SectionListener>();
  private readonly observer: IntersectionObserver;

  constructor(options: IntersectionObserverInit = { rootMargin: "-45% 0px -50% 0px" }) {
    this.observer = new IntersectionObserver((entries) => {
      for (const entry of entries) this.listeners.forEach((notify) => notify(entry.target.id, entry.isIntersecting));
    }, options);
  }

  observe(ids: readonly string[]): this {
    ids.map((id) => document.getElementById(id)).forEach((el) => el && this.observer.observe(el));
    return this;
  }

  /** Returns the unsubscribe function. */
  subscribe(listener: SectionListener): () => void {
    this.listeners.add(listener);
    return () => void this.listeners.delete(listener);
  }

  disconnect(): void { this.listeners.clear(); this.observer.disconnect(); }
}

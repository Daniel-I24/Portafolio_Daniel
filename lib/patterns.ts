import { unstable_cache } from "next/cache";
import { z } from "zod";
import {
  AcademicExperience, Interest, Project, Skill, Testimonial, WorkExperience, type Experience,
} from "./domain";
import { entitySchemas, profileSchema, type EntityInput, type EntityRow, type EntityTable } from "./schemas";
import { byNewest, byOrder, toCamel } from "./structures";
import { hasSupabase, publicClient } from "./supabase";

/* ---------- Repository + Strategy: interchangeable data sources ---------- */

export const ENTITY_TABLES = Object.keys(entitySchemas) as EntityTable[];
export const CACHE_TAGS = ["profile", ...ENTITY_TABLES] as const;

/** Unparsed rows as stored (seed or DB); EntityFactory validates them. */
export type Snapshot = { profile: z.input<typeof profileSchema> } & { [T in EntityTable]: Partial<EntityInput<T>>[] };

export interface Repository {
  snapshot(): Promise<Snapshot>;
}

/** Reads content/seed.json; used when Supabase env vars are missing so the build never breaks. */
export class SeedRepository implements Repository {
  async snapshot(): Promise<Snapshot> {
    const seed = (await import("@/content/seed.json")).default as unknown as Snapshot;
    // Seed rows have no id/order: derive them from the slug (or position) and the file order.
    const withMeta = (table: EntityTable) =>
      seed[table]
        .map((row, index) => ({ id: ("slug" in row && row.slug) || `${table}-${index + 1}`, order: index, ...row }))
        .filter((row) => row.published !== false);
    return { profile: seed.profile, ...Object.fromEntries(ENTITY_TABLES.map((t) => [t, withMeta(t)])) } as Snapshot;
  }
}

/** Production source. RLS already limits anonymous reads to published rows. */
export class SupabaseRepository implements Repository {
  async snapshot(): Promise<Snapshot> {
    const db = publicClient();
    const rows = async (table: EntityTable) => {
      const { data, error } = await db.from(table).select("*").eq("published", true).order("order");
      if (error) throw new Error(`Failed to read ${table}`);
      return (data ?? []).map(toCamel);
    };
    const { data: profile } = await db.from("profile").select("*").limit(1).maybeSingle();
    const [projects, testimonials, experience, skills, interests] = await Promise.all(ENTITY_TABLES.map(rows));
    return { profile: toCamel(profile ?? {}), projects, testimonials, experience, skills, interests } as Snapshot;
  }
}

export const repository = (): Repository => (hasSupabase() ? new SupabaseRepository() : new SeedRepository());

/** Raw snapshot cached by tag; admin saves call revalidateTag() so changes show without redeploy. */
export const getSnapshot = unstable_cache(() => repository().snapshot(), ["portfolio"], {
  tags: [...CACHE_TAGS],
});

/* ---------- Factory: rows → domain subclasses ---------- */

export type Portfolio = ReturnType<typeof EntityFactory.build>;

export class EntityFactory {
  /** Validates a row with its schema and builds the matching subclass; invalid rows are skipped. */
  static from(table: EntityTable, row: unknown) {
    const parsed = entitySchemas[table].safeParse(row);
    if (!parsed.success) return null;
    const data = parsed.data as never;
    switch (table) {
      case "projects": return new Project(data);
      case "testimonials": return new Testimonial(data);
      case "skills": return new Skill(data);
      case "interests": return new Interest(data);
      case "experience": {
        const row = data as EntityRow<"experience">;
        return row.type === "academic" ? new AcademicExperience(row) : new WorkExperience(row);
      }
    }
  }

  static build(snapshot: Snapshot) {
    const list = <E>(table: EntityTable) =>
      snapshot[table].map((row) => EntityFactory.from(table, row)).filter(Boolean) as E[];
    return {
      profile: profileSchema.parse(snapshot.profile),
      projects: byOrder(list<Project>("projects")),
      testimonials: byOrder(list<Testimonial>("testimonials")),
      experience: byNewest(list<Experience>("experience"), (e) => e.year),
      skills: byOrder(list<Skill>("skills")),
      interests: byOrder(list<Interest>("interests")),
    };
  }
}

export const getPortfolio = async (): Promise<Portfolio> => EntityFactory.build(await getSnapshot());

/* ---------- Strategy: validation rules, combined with Zod ---------- */

export interface ValidationRule {
  check(value: string): string | null;
}

export class Required implements ValidationRule {
  constructor(private readonly message: string) {}
  check(value: string) { return value.trim() ? null : this.message; }
}

export class MinLength implements ValidationRule {
  constructor(private readonly min: number, private readonly message: string) {}
  check(value: string) { return value.trim().length >= this.min ? null : this.message; }
}

/** Shared base for rules backed by a Zod format check. */
abstract class FormatRule implements ValidationRule {
  protected abstract readonly format: z.ZodType;
  protected abstract readonly message: string;
  check(value: string) { return this.format.safeParse(value.trim()).success ? null : this.message; }
}

export class Email extends FormatRule {
  protected readonly format = z.email();
  protected readonly message = "Revisa el correo: debe verse como nombre@dominio.com.";
}

export class Url extends FormatRule {
  protected readonly format = z.url();
  protected readonly message = "El enlace debe empezar por https://";
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

export const contactSchema = z.object({
  name: ruleField(contactRules.name, 80),
  email: ruleField(contactRules.email, 120),
  message: ruleField(contactRules.message, 2000),
  website: z.string().max(0).optional(), // honeypot: humans never fill it
});

export type ContactInput = z.infer<typeof contactSchema>;

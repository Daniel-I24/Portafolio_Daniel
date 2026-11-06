import { z } from "zod";

// Field names mirror content/seed.json. Labels (`describe`) are UI text in Spanish; EntityForm renders from them.
// Seed rows carry no id/order/published: SeedRepository derives them, the database stores them.
const id = z.string().min(1);
const order = z.number().int().min(0).default(0).describe("Orden");
const published = z.boolean().default(true).describe("Publicado");
/** Optional text: null/undefined in the seed or DB become "". */
const text = (label: string, max = 280) =>
  z.string().trim().max(max).nullish().transform((value) => value ?? "").describe(label);
const url = (label: string) =>
  z.union([z.url(), z.literal("")]).nullish().transform((value) => value ?? "").describe(label);

export const projectKinds = ["web", "mobile", "api", "desktop", "game"] as const;
export const experienceTypes = ["academic", "work"] as const;
export const socialKinds = ["github", "linkedin"] as const;
export const interestSlugs = ["voley", "futbol", "motos", "billar", "musica", "deporte"] as const;

export const socialSchema = z.object({
  kind: z.enum(socialKinds).describe("Red"),
  label: z.string().trim().min(1).max(40).describe("Texto"),
  url: z.url().describe("Enlace"),
});

export const profileSchema = z.object({
  fullName: z.string().trim().min(2).describe("Nombre completo"),
  displayName: z.string().trim().min(2).max(40).describe("Nombre corto"),
  tag: z.string().trim().min(1).max(12).describe("Tag"),
  role: z.string().trim().min(2).describe("Rol"),
  goal: text("Meta"),
  tagline: text("Frase corta", 160),
  location: text("Ubicación"),
  about: text("Sobre mí", 2000),
  photo: z.string().default("").describe("Foto"),
  cvUrl: z.string().default("/cv.pdf").describe("CV (PDF)"),
  email: z.email().describe("Correo"),
  socials: z.array(socialSchema).default([]).describe("Redes"),
});

export const projectSchema = z.object({
  id,
  slug: z.string().trim().regex(/^[a-z0-9-]+$/).describe("Slug"),
  title: z.string().trim().min(2).describe("Título"),
  kind: z.enum(projectKinds).default("web").describe("Tipo"),
  summary: text("Resumen", 400),
  stack: z.array(z.string().trim().min(1)).default([]).describe("Tecnologías"),
  repoUrl: url("Repositorio"),
  liveUrl: url("Demo / sitio"),
  liveLabel: text("Texto del botón de demo (opcional)", 30),
  apkUrl: url("APK"),
  downloadUrl: url("Descarga (juego o instalador)"),
  extraLinks: z.array(z.object({ label: z.string().trim().min(1).max(30), url: z.url() })).default([]).describe("Otros enlaces (modal)"),
  imageUrl: text("Captura", 500),
  featured: z.boolean().default(false).describe("Destacado"),
  collaboration: z.boolean().default(false).describe("Colaboración"),
  period: z.string().trim().max(20).default("").describe("Periodo (ej. 2026-2)"),
  problem: text("Problema", 1000),
  solution: text("Solución", 1000),
  myRole: text("Mi rol", 600),
  learnings: text("Aprendizajes", 1000),
  gallery: z.array(z.string()).default([]).describe("Galería"),
  githubRepo: text("Repo de GitHub (owner/nombre)", 120),
  stars: z.number().int().min(0).default(0).describe("Estrellas"),
  year: z.number().int().min(2000).max(2100).nullish().describe("Año"),
  order,
  published,
});

export const testimonialSchema = z.object({
  id,
  name: z.string().trim().min(2).describe("Nombre"),
  role: text("Cargo o relación", 120),
  quote: z.string().trim().min(10).max(800).describe("Testimonio"),
  avatarUrl: text("Foto", 500),
  order,
  published,
});

export const experienceSchema = z.object({
  id,
  type: z.enum(experienceTypes).describe("Tipo"),
  period: z.string().trim().min(1).max(40).describe("Periodo"),
  title: z.string().trim().min(2).describe("Cargo o título"),
  place: text("Institución o empresa", 160),
  summary: text("Logros", 800),
  order,
  published,
});

export const skillSchema = z.object({
  id,
  group: z.string().trim().min(1).max(40).describe("Categoría"),
  name: z.string().trim().min(1).max(40).describe("Nombre"),
  order,
  published,
});

export const interestSchema = z.object({
  id,
  slug: z.enum(interestSlugs).describe("Tipo"),
  title: z.string().trim().min(2).max(60).describe("Título"),
  note: text("Nota", 200),
  playlistUrl: url("Playlist (Spotify)"),
  order,
  published,
});

export const messageSchema = z.object({
  id,
  name: z.string(),
  email: z.string(),
  body: z.string(),
  read: z.boolean().default(false),
  createdAt: z.string(),
});

export const entitySchemas = {
  projects: projectSchema,
  testimonials: testimonialSchema,
  experience: experienceSchema,
  skills: skillSchema,
  interests: interestSchema,
} as const;

export const ENTITY_TABLES = Object.keys(entitySchemas) as EntityTable[];

export type SocialData = z.infer<typeof socialSchema>;
export type ProfileData = z.infer<typeof profileSchema>;
export type ProjectData = z.infer<typeof projectSchema>;
export type TestimonialData = z.infer<typeof testimonialSchema>;
export type ExperienceData = z.infer<typeof experienceSchema>;
export type SkillData = z.infer<typeof skillSchema>;
export type InterestData = z.infer<typeof interestSchema>;
export type MessageData = z.infer<typeof messageSchema>;
export type ProjectKind = (typeof projectKinds)[number];
export type InterestSlug = (typeof interestSlugs)[number];
export type EntityTable = keyof typeof entitySchemas;
export type EntityRow<T extends EntityTable> = z.infer<(typeof entitySchemas)[T]>;
/** Shape before parsing (what the seed and the DB hold). */
export type EntityInput<T extends EntityTable> = z.input<(typeof entitySchemas)[T]>;

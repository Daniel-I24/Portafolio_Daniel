import { z } from "zod";

// Labels (`describe`) are UI text, so they stay in Spanish; EntityForm renders fields from them.
const id = z.string().min(1);
const order = z.number().int().min(0).default(0).describe("Orden");
const published = z.boolean().default(true).describe("Publicado");
const optionalUrl = z.union([z.url(), z.literal("")]).default("");
const text = (label: string, max = 280) => z.string().trim().max(max).default("").describe(label);

export const projectKinds = ["web", "mobile", "api", "desktop"] as const;
export const skillLevels = ["advanced", "intermediate", "learning"] as const;
export const experienceTypes = ["academic", "work"] as const;
export const interestKeys = ["volley", "football", "moto", "pool", "music"] as const;

export const profileSchema = z.object({
  name: z.string().trim().min(2).describe("Nombre completo"),
  tag: z.string().trim().min(1).max(12).describe("Tag"),
  role: z.string().trim().min(2).describe("Rol"),
  goal: text("Meta"),
  tagline: text("Frase corta", 160),
  about: text("Sobre mí", 2000),
  location: text("Ubicación"),
  university: text("Universidad"),
  photoUrl: z.string().default("").describe("Foto"),
  cvUrl: z.string().default("").describe("CV (PDF)"),
  email: z.union([z.email(), z.literal("")]).default("").describe("Correo"),
  github: optionalUrl.describe("GitHub"),
  linkedin: optionalUrl.describe("LinkedIn"),
});

export const projectSchema = z.object({
  id,
  title: z.string().trim().min(2).describe("Título"),
  summary: text("Resumen", 400),
  kind: z.enum(projectKinds).default("web").describe("Tipo"),
  stack: z.array(z.string().trim().min(1)).default([]).describe("Tecnologías"),
  repoUrl: optionalUrl.describe("Repositorio"),
  liveUrl: optionalUrl.describe("Demo en vivo"),
  apkUrl: optionalUrl.describe("APK"),
  imageUrl: z.string().default("").describe("Captura"),
  problem: text("Problema", 1000),
  solution: text("Solución", 1000),
  myRole: text("Mi rol", 600),
  learnings: text("Aprendizajes", 1000),
  gallery: z.array(z.string()).default([]).describe("Galería"),
  githubRepo: text("Repo de GitHub (owner/nombre)", 120),
  stars: z.number().int().min(0).default(0).describe("Estrellas"),
  year: z.number().int().min(2000).max(2100).describe("Año"),
  order,
  published,
});

export const testimonialSchema = z.object({
  id,
  author: z.string().trim().min(2).describe("Autor"),
  relation: text("Relación", 120),
  quote: z.string().trim().min(10).max(800).describe("Testimonio"),
  avatarUrl: z.string().default("").describe("Foto"),
  order,
  published,
});

export const experienceSchema = z.object({
  id,
  type: z.enum(experienceTypes).describe("Tipo"),
  title: z.string().trim().min(2).describe("Título"),
  place: text("Lugar", 160),
  startDate: z.iso.date().describe("Inicio"),
  endDate: z.union([z.iso.date(), z.literal("")]).default("").describe("Fin"),
  description: text("Descripción", 800),
  order,
  published,
});

export const skillSchema = z.object({
  id,
  name: z.string().trim().min(1).max(40).describe("Nombre"),
  level: z.enum(skillLevels).describe("Nivel"),
  category: text("Categoría", 40),
  order,
  published,
});

export const interestSchema = z.object({
  id,
  key: z.enum(interestKeys).describe("Clave"),
  title: z.string().trim().min(2).max(60).describe("Título"),
  note: text("Nota", 200),
  playlistUrl: optionalUrl.describe("Playlist (Spotify)"),
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

export type ProfileData = z.infer<typeof profileSchema>;
export type ProjectData = z.infer<typeof projectSchema>;
export type TestimonialData = z.infer<typeof testimonialSchema>;
export type ExperienceData = z.infer<typeof experienceSchema>;
export type SkillData = z.infer<typeof skillSchema>;
export type InterestData = z.infer<typeof interestSchema>;
export type MessageData = z.infer<typeof messageSchema>;
export type ProjectKind = (typeof projectKinds)[number];
export type SkillLevel = (typeof skillLevels)[number];
export type InterestKey = (typeof interestKeys)[number];
export type EntityTable = keyof typeof entitySchemas;
export type EntityRow<T extends EntityTable> = z.infer<(typeof entitySchemas)[T]>;

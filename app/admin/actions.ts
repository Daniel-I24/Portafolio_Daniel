"use server";

import { revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { listRepos, parseRepo, repoToProject, type RepoSummary } from "@/lib/github";
import { CACHE_TAGS, SeedRepository } from "@/lib/patterns";
import { ENTITY_TABLES, entitySchemas, profileSchema, type ProjectData } from "@/lib/schemas";
import { toSnake } from "@/lib/structures";
import { isAdmin, serverClient } from "@/lib/supabase";

export type AdminTable = (typeof CACHE_TAGS)[number];
export type ActionResult = { ok: boolean; message: string; errors?: Record<string, string> };

const DENIED: ActionResult = { ok: false, message: "Acceso denegado." };
const FAILED: ActionResult = { ok: false, message: "No se pudo completar la acción. Intenta de nuevo." };
// Server actions are public endpoints: every argument coming from the browser is validated here.
const tableSchema = z.enum(CACHE_TAGS);
const entityTableSchema = z.enum(ENTITY_TABLES as [string, ...string[]]);
const idSchema = z.string().min(1).max(64);

type Db = Awaited<ReturnType<typeof serverClient>>;

/** Admin check → task → cache revalidation. Internal errors never reach the browser. */
async function guarded(tags: readonly string[], task: (db: Db) => PromiseLike<{ error: unknown } | ActionResult>, done = "Guardado."): Promise<ActionResult> {
  if (!(await isAdmin())) return DENIED;
  try {
    const result = await task(await serverClient());
    if ("ok" in result) return result;
    if (result.error) return FAILED;
    tags.forEach((tag) => revalidateTag(tag));
    return { ok: true, message: done };
  } catch {
    return FAILED;
  }
}

/* ---------- Auth ---------- */

export async function signIn(): Promise<void> {
  const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const { data, error } = await (await serverClient()).auth.signInWithOAuth({
    provider: "github",
    options: { redirectTo: `${origin}/auth/callback` },
  });
  redirect(error || !data.url ? "/admin/login?error=oauth" : data.url);
}

export async function signOut(): Promise<void> {
  await (await serverClient()).auth.signOut();
  redirect("/admin/login");
}

/* ---------- Content CRUD (EntityTable / EntityForm) ---------- */

export async function saveEntity(table: AdminTable, input: Record<string, unknown>): Promise<ActionResult> {
  const name = tableSchema.parse(table);
  const schema = name === "profile" ? profileSchema : entitySchemas[name];
  const parsed = schema.safeParse(name === "profile" ? input : { ...input, id: input.id || crypto.randomUUID() });
  if (!parsed.success) {
    const fields = z.flattenError(parsed.error as z.ZodError).fieldErrors as Record<string, string[] | undefined>;
    return { ok: false, message: "Revisa los campos marcados.", errors: Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, v?.[0] ?? ""])) };
  }
  const row = toSnake(parsed.data as Record<string, unknown>);
  return guarded([name], (db) => db.from(name).upsert(name === "profile" ? { id: 1, ...row, updated_at: new Date().toISOString() } : row));
}

export async function deleteEntity(table: string, id: string): Promise<ActionResult> {
  const name = entityTableSchema.parse(table);
  return guarded([name], (db) => db.from(name).delete().eq("id", idSchema.parse(id)), "Eliminado.");
}

export async function setPublished(table: string, id: string, published: boolean): Promise<ActionResult> {
  const name = entityTableSchema.parse(table);
  return guarded([name], (db) => db.from(name).update({ published: z.boolean().parse(published) }).eq("id", idSchema.parse(id)),
    published ? "Publicado." : "Pasado a borrador.");
}

/** Saves the drag-and-drop order: position in the list becomes `order`. */
export async function reorder(table: string, ids: string[]): Promise<ActionResult> {
  const name = entityTableSchema.parse(table);
  const list = z.array(idSchema).max(500).parse(ids);
  return guarded([name], async (db) => {
    const results = await Promise.all(list.map((id, order) => db.from(name).update({ order }).eq("id", id)));
    return { error: results.find((r) => r.error)?.error ?? null };
  }, "Orden guardado.");
}

/** One-time import of content/seed.json (drafts included) into an empty or partial database. */
export async function importSeed(): Promise<ActionResult> {
  return guarded(CACHE_TAGS, async (db) => {
    const seed = await new SeedRepository(true).snapshot();
    const profile = await db.from("profile").upsert({ id: 1, ...toSnake(profileSchema.parse(seed.profile)) });
    const tables = await Promise.all(ENTITY_TABLES.map((table) => {
      const rows = seed[table].map((row) => toSnake(entitySchemas[table].parse(row) as Record<string, unknown>));
      return db.from(table).upsert(rows);
    }));
    return { error: profile.error ?? tables.find((r) => r.error)?.error ?? null };
  }, "Contenido de seed.json importado.");
}

/* ---------- Contact messages ---------- */

export async function markMessage(id: string, read: boolean): Promise<ActionResult> {
  return guarded([], (db) => db.from("messages").update({ read: z.boolean().parse(read) }).eq("id", z.uuid().parse(id)), read ? "Marcado como leído." : "Marcado como no leído.");
}

export async function deleteMessage(id: string): Promise<ActionResult> {
  return guarded([], (db) => db.from("messages").delete().eq("id", z.uuid().parse(id)), "Mensaje eliminado.");
}

/* ---------- GitHub import ---------- */

export async function githubRepos(): Promise<RepoSummary[]> {
  if (!(await isAdmin())) return [];
  try { return await listRepos(); } catch { return []; }
}

/** Prefill from a listed repo or any pasted github.com URL (repos of other accounts → collaboration). */
export async function githubPrefill(input: string): Promise<{ ok: boolean; message: string; data?: Partial<ProjectData> }> {
  if (!(await isAdmin())) return DENIED;
  if (!parseRepo(z.string().max(300).parse(input))) return { ok: false, message: "Pega una URL como https://github.com/usuario/repo." };
  try {
    const data = await repoToProject(input);
    return data ? { ok: true, message: "Datos cargados: revísalos y guarda.", data } : { ok: false, message: "No encontré ese repositorio público." };
  } catch {
    return { ok: false, message: "GitHub no respondió. Intenta de nuevo en un momento." };
  }
}

/** "Sincronizar": refreshes stars, release links and (when empty) the description of every imported project. */
export async function syncGithub(): Promise<ActionResult> {
  return guarded(["projects"], async (db) => {
    const { data, error } = await db.from("projects").select("id, github_repo, summary, apk_url, download_url").neq("github_repo", "");
    if (error) return { error };
    const updates = await Promise.all((data ?? []).map(async (row) => {
      const fresh = await repoToProject(row.github_repo);
      if (!fresh) return { error: null };
      return db.from("projects").update({
        stars: fresh.stars, summary: row.summary || fresh.summary, // never overwrite a curated summary
        apk_url: fresh.apkUrl || row.apk_url, download_url: fresh.downloadUrl || row.download_url,
      }).eq("id", row.id);
    }));
    return { error: updates.find((u) => u.error)?.error ?? null };
  }, "Proyectos sincronizados con GitHub.");
}

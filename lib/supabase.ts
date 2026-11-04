import { createBrowserClient, createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { hasSupabase, type Repository, type Snapshot } from "./patterns";
import { ENTITY_TABLES, type EntityTable } from "./schemas";
import { toCamel } from "./structures";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** Browser client with the user's session (admin uploads to Storage). */
export const browserClient = (): SupabaseClient => createBrowserClient(url, anonKey);

/** Anonymous, cookie-free client: safe inside unstable_cache for public reads (RLS applies). */
export const publicClient = (): SupabaseClient =>
  createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });

/** Server client bound to the request cookies (Server Components, actions, route handlers). */
export async function serverClient(): Promise<SupabaseClient> {
  const { cookies } = await import("next/headers");
  const store = await cookies();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Called from a Server Component: middleware refreshes the session instead.
        }
      },
    },
  });
}

/** Server-side admin check: only the account whose id equals ADMIN_USER_ID passes. */
export async function isAdmin(): Promise<boolean> {
  const adminId = process.env.ADMIN_USER_ID;
  if (!hasSupabase() || !adminId) return false;
  const { data } = await (await serverClient()).auth.getUser();
  return data.user?.id === adminId;
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

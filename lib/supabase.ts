import { createBrowserClient, createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** False when env vars are missing: the app then falls back to content/seed.json. */
export const hasSupabase = (): boolean => Boolean(url && anonKey);

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

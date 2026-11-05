import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { hasSupabase } from "@/lib/patterns";
import { isAdmin } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

// Reads the session on every request: never prerendered or cached.
export const dynamic = "force-dynamic";

/** Second guard layer (after middleware.ts): every admin page re-checks the owner on the server. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const path = (await headers()).get("x-pathname");

  if (!hasSupabase()) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-24">
        <h1 className="font-marker text-4xl text-paper">Admin sin conectar</h1>
        <p className="mt-4 text-paper">
          Faltan <code className="font-mono text-mustard">NEXT_PUBLIC_SUPABASE_URL</code> y{" "}
          <code className="font-mono text-mustard">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>. Sigue la guía del README.
        </p>
      </main>
    );
  }
  if (path !== "/admin/login" && !(await isAdmin())) redirect("/admin/login");

  return <div className="min-h-dvh bg-asphalt text-paper">{children}</div>;
}

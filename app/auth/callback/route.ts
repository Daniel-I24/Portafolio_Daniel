import { NextResponse, type NextRequest } from "next/server";
import { serverClient } from "@/lib/supabase";

/** GitHub OAuth (via Supabase) lands here: exchange the code, then let only the owner in. */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const to = (path: string) => NextResponse.redirect(new URL(path, request.url));
  if (!code) return to("/admin/login?error=oauth");

  const supabase = await serverClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) return to("/admin/login?error=oauth");

  const adminId = process.env.ADMIN_USER_ID;
  if (data.user.id === adminId) return to("/admin");

  await supabase.auth.signOut();
  // First-time setup: show the id so it can be copied into ADMIN_USER_ID. Never reveal it once configured.
  return to(adminId ? "/admin/login?error=denied" : `/admin/login?setup=${data.user.id}`);
}

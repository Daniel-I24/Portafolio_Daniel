import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const LOGIN = "/admin/login";

/**
 * First guard layer: refreshes the Supabase session cookie and keeps /admin/* for the owner.
 * app/admin/layout.tsx checks again on the server (second layer), and RLS is the last word.
 */
export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const { pathname } = request.nextUrl;
  // The admin layout reads the path to skip its guard on the login page.
  const headers = new Headers(request.headers);
  headers.set("x-pathname", pathname);
  let response = NextResponse.next({ request: { headers } });
  if (!url || !anonKey) return response;

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request: { headers } });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  const { data } = await supabase.auth.getUser();
  if (pathname === LOGIN) return response;

  if (!data.user) return NextResponse.redirect(new URL(LOGIN, request.url));
  if (data.user.id !== process.env.ADMIN_USER_ID) {
    await supabase.auth.signOut();
    const denied = NextResponse.redirect(new URL(`${LOGIN}?error=denied`, request.url));
    response.cookies.getAll().forEach((cookie) => denied.cookies.set(cookie));
    return denied;
  }
  return response;
}

// Only the admin needs a session: public pages stay static and never call Supabase Auth.
export const config = { matcher: ["/admin/:path*"] };

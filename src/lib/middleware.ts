import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const ROLE_HOME_ROUTES: Record<string, string> = {
  super_admin: "/super-admin",
  admin: "/admin",
  compliance: "/compliance",
  player: "/player",
};

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Retrieve user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // 1. Unauthenticated users trying to access protected routes -> Redirect to /login
  if (
    !user &&
    !pathname.startsWith("/login") &&
    !pathname.startsWith("/auth") &&
    pathname !== "/"
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/login"; // Fixed path
    return NextResponse.redirect(url);
  }

  // 2. Authenticated users: Enforce RBAC boundary protection
  if (user) {
    const isProtectedWorkspace =
      pathname.startsWith("/admin") ||
      pathname.startsWith("/super-admin") ||
      pathname.startsWith("/compliance") ||
      pathname.startsWith("/player");

    if (isProtectedWorkspace) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      const userRole = profile?.role || "player";

      // Super Admin has access across all workspaces
      if (userRole === "super_admin") {
        return supabaseResponse;
      }

      // Check role permissions per route
      if (
        (pathname.startsWith("/admin") && userRole !== "admin") ||
        (pathname.startsWith("/super-admin") && userRole !== "super_admin") ||
        (pathname.startsWith("/compliance") && userRole !== "compliance")
      ) {
        const url = request.nextUrl.clone();
        url.pathname = ROLE_HOME_ROUTES[userRole] || "/player";
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}

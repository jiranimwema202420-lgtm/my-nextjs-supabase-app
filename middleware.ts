import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Define which paths each role is allowed to access
const ROLE_PATHS: Record<string, string[]> = {
  super_admin: [
    "/super-admin",
    "/admin",
    "/manager",
    "/staff",
    "/compliance",
    "/analyst",
    "/player",
    "/settings",
  ],
  admin: [
    "/admin",
    "/manager",
    "/staff",
    "/compliance",
    "/analyst",
    "/player",
    "/settings",
  ],
  manager: ["/manager", "/staff", "/player", "/settings"],
  staff: ["/staff", "/player", "/settings"],
  compliance: ["/compliance", "/player", "/settings"],
  analyst: ["/analyst", "/player", "/settings"],
  player: ["/player", "/settings"],
};

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: { headers: request.headers },
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
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  // 1. Define public routes
  const publicPaths = [
    "/login",
    "/signup",
    "/forgot-password",
    "/update-password",
    "/auth",
  ];
  const isPublic = publicPaths.some((path) => pathname.startsWith(path));

  // 2. If NOT logged in and trying to access a protected route -> Send to /login
  if (!user) {
    if (!isPublic) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    return response; // Allow public routes for unauthenticated users
  }

  // 3. If LOGGED IN and visiting a public auth route -> Redirect to their dashboard
  if (user && isPublic) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle(); // ✅ Use maybeSingle to prevent crashes

    const userRole = profile?.role || "player";
    const dashboardHome = ROLE_PATHS[userRole]?.[0] || "/player";

    const url = request.nextUrl.clone();
    url.pathname = dashboardHome;
    return NextResponse.redirect(url);
  }

  // 4. Protected routes logic
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  // 🛡️ CRITICAL LOOP PREVENTION: If we can't read the profile (RLS block or missing),
  // DO NOT GUESS. Let the Server Component securely handle the redirect.
  if (!profile) {
    return response;
  }

  const userRole = profile.role;
  const allowedPaths = ROLE_PATHS[userRole] || ROLE_PATHS["player"];

  // Check if current path is allowed
  const isAllowed = allowedPaths.some((path) => pathname.startsWith(path));

  if (!isAllowed) {
    // They are trying to access a forbidden route.
    const dashboardHome = allowedPaths[0];

    // Prevent redirecting to the exact same page
    if (pathname === dashboardHome || pathname.startsWith(dashboardHome)) {
      return response;
    }

    const url = request.nextUrl.clone();
    url.pathname = dashboardHome;
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

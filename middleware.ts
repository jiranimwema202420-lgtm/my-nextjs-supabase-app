import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Define which paths each role is allowed to access
const ROLE_PATHS: Record<string, string[]> = {
  super_admin: ['/super-admin', '/admin', '/manager', '/staff', '/compliance', '/analyst', '/player', '/settings'],
  admin: ['/admin', '/manager', '/staff', '/compliance', '/analyst', '/player', '/settings'],
  manager: ['/manager', '/staff', '/player', '/settings'],
  staff: ['/staff', '/player', '/settings'],
  compliance: ['/compliance', '/player', '/settings'],
  analyst: ['/analyst', '/player', '/settings'],
  player: ['/player', '/settings'],
};

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  // 1. Allow public routes
  const publicPaths = ['/login', '/signup', '/forgot-password', '/update-password', '/auth'];
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return response;
  }

  // 2. Redirect to login if not authenticated
  if (!user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    return NextResponse.redirect(redirectUrl);
  }

  // 3. Fetch user's role to enforce authorization
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const userRole = profile?.role || 'player';
  const allowedPaths = ROLE_PATHS[userRole] || ROLE_PATHS['player'];

  // 4. Block access if the path is not allowed for this role
  const isAllowed = allowedPaths.some((path) => pathname.startsWith(path));
  if (!isAllowed) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = allowedPaths[0]; // Redirect to their highest allowed dashboard
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

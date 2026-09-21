import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  let next = requestUrl.searchParams.get("next") ?? "/player";

  if (!next.startsWith("/") || next.startsWith("//")) {
    next = "/player";
  }

  const canonicalUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://igame-fintech-lovat.vercel.app";

  if (!code) {
    return NextResponse.redirect(`${canonicalUrl}/login?error=Missing_code_in_url`);
  }

  const response = NextResponse.redirect(`${canonicalUrl}${next}`);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
          Object.entries(headers).forEach(([key, value]) => {
            response.headers.set(key, value);
          });
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[Auth Callback] Code exchange failed:", error.message);
    return NextResponse.redirect(`${canonicalUrl}/login?error=${encodeURIComponent(error.message)}`);
  }

  // 🌟 NEW: Dynamically determine the correct dashboard based on the user's role
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const role = profile?.role || 'player';
    const rolePaths: Record<string, string> = {
      super_admin: '/super-admin',
      admin: '/admin',
      manager: '/manager',
      staff: '/staff',
      compliance: '/compliance',
      analyst: '/analyst',
      player: '/player',
    };
    
    // Override the 'next' parameter with the role-appropriate path
    next = rolePaths[role] || '/player';
  }

  console.log("[Auth Callback] Code exchange successful, redirecting to:", next);
  
  // Update the response redirect URL with the correct role-based path
  return NextResponse.redirect(`${canonicalUrl}${next}`);
}

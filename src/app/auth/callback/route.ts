import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Ignore errors when setting cookies in some edge cases
            }
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // 🌟 NEW: Fetch the user's role to redirect to the correct dashboard
      const { data: { user } } = await supabase.auth.getUser();
      let next = "/player"; // Safe default

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        const role = profile?.role || "player";
        const rolePaths: Record<string, string> = {
          super_admin: "/super-admin",
          admin: "/admin",
          manager: "/manager",
          staff: "/staff",
          compliance: "/compliance",
          analyst: "/analyst",
          player: "/player",
        };
        
        next = rolePaths[role] || "/player";
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Redirect to login if OAuth code exchange fails or no code is present
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}

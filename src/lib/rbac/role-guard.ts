import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { AppRole } from "./roles";

// Default workspace routes for each role
const ROLE_HOME_ROUTES: Record<string, string> = {
  super_admin: "/super-admin",
  admin: "/admin",
  compliance: "/compliance",
  player: "/player",
};

export async function requireRole(allowedRoles: AppRole[]) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !profile?.role) {
    console.error("Role lookup error or missing profile:", error);
    redirect("/login");
  }

  const userRole = profile.role as AppRole;

  // 1. Super Admin bypass (optional: grants super_admin access to all workspaces)
  if (userRole === "super_admin") {
    return { user, role: userRole };
  }

  // 2. Check if current role is authorized for this route
  if (!allowedRoles.includes(userRole)) {
    // Redirect user to THEIR assigned workspace to prevent infinite loops
    const destination = ROLE_HOME_ROUTES[userRole] || "/login";
    redirect(destination);
  }

  return {
    user,
    role: userRole,
  };
}

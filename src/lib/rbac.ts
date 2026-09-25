export type UserRole =
  | "super_admin"
  | "admin"
  | "compliance"
  | "player"
  | "user";

export const ROLE_ROUTES: Record<string, string> = {
  super_admin: "/dashboard/admin",
  admin: "/dashboard/admin",
  compliance: "/dashboard/compliance",
  player: "/dashboard/player",
  user: "/dashboard/player",
};

export function getRoleDashboard(role: string | null | undefined): string {
  if (!role) return "/dashboard/player";
  const normalizedRole = role.toLowerCase().trim();
  return ROLE_ROUTES[normalizedRole] || "/dashboard/player";
}

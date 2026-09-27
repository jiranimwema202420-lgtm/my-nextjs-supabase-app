export type UserRole =
  | "super_admin"
  | "admin"
  | "compliance"
  | "manager"
  | "staff"
  | "analyst"
  | "player"
  | "user";

export const ROLE_ROUTES: Record<string, string> = {
  super_admin: "/super-admin",
  admin: "/admin",
  compliance: "/compliance",
  manager: "/manager",
  staff: "/staff",
  analyst: "/analyst",
  player: "/player",
  user: "/player",
};

export function getRoleDashboard(role: string | null | undefined): string {
  if (!role) return "/player";
  const normalizedRole = role.toLowerCase().trim();
  return ROLE_ROUTES[normalizedRole] || "/player";
}
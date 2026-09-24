"use server";

import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/rbac/role-guard";
import type { AppRole } from "@/lib/rbac/roles";
import { ROLES } from "@/lib/rbac/roles";
import { revalidatePath } from "next/cache";

export type AdminActionResult = { success?: boolean; error?: string };

function isValidRole(role: string): role is AppRole {
  return ROLES.includes(role as AppRole);
}

export async function updateUserRole(userId: string, newRole: string): Promise<AdminActionResult> {
  try {
    await requireRole(["super_admin", "admin"]);
    if (!isValidRole(newRole)) return { error: "Invalid role specified." };
    const supabase = await createClient();
    const { error } = await supabase.from("profiles").update({ role: newRole, updated_at: new Date().toISOString() }).eq("id", userId);
    if (error) return { error: error.message };
    revalidatePath("/admin");
    revalidatePath("/super-admin");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unauthorized" };
  }
}

export async function toggleUserActive(userId: string, isActive: boolean): Promise<AdminActionResult> {
  try {
    await requireRole(["super_admin", "admin"]);
    const supabase = await createClient();
    if (isActive === false) {
      const { data: targetProfile } = await supabase.from("profiles").select("role").eq("id", userId).single();
      if (targetProfile?.role === "super_admin") return { error: "Cannot deactivate a super admin." };
    }
    const { error } = await supabase.from("profiles").update({ is_active: isActive, updated_at: new Date().toISOString() }).eq("id", userId);
    if (error) return { error: error.message };
    revalidatePath("/admin");
    revalidatePath("/super-admin");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unauthorized" };
  }
}
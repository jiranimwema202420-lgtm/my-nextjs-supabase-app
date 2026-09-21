"use server";

import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/rbac/role-guard";
import type { AppRole } from "@/lib/rbac/roles";
import { ROLES } from "@/lib/rbac/roles";

export type AdminActionResult = {
  success?: boolean;
  error?: string;
};

// Helper to validate role strings against the AppRole type
function isValidRole(role: string): role is AppRole {
  return ROLES.includes(role as AppRole);
}

export async function updateUserRole(
  userId: string,
  newRole: string
): Promise<AdminActionResult> {
  try {
    // 1. Ensure the caller is a super_admin
    await requireRole(["super_admin"]);

    // 2. Validate the new role
    if (!isValidRole(newRole)) {
      return { error: "Invalid role specified." };
    }

    const supabase = await createClient();

    // 3. Update the profile (RLS "Super admins update any profile" will allow this)
    const { error } = await supabase
      .from("profiles")
      .update({ 
        role: newRole, 
        updated_at: new Date().toISOString() 
      })
      .eq("id", userId);

    if (error) {
      console.error("Failed to update user role:", error);
      return { error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("updateUserRole error:", err);
    return { error: err instanceof Error ? err.message : "Unauthorized" };
  }
}

export async function toggleUserActive(
  userId: string,
  isActive: boolean
): Promise<AdminActionResult> {
  try {
    // 1. Ensure the caller is a super_admin or admin
    await requireRole(["super_admin", "admin"]);

    const supabase = await createClient();

    // 2. Safety check: Prevent admins from deactivating a super_admin
    if (isActive === false) {
      const { data: targetProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();
      
      if (targetProfile?.role === "super_admin") {
        return { error: "Cannot deactivate a super admin." };
      }
    }

    // 3. Update the profile
    const { error } = await supabase
      .from("profiles")
      .update({ 
        is_active: isActive, 
        updated_at: new Date().toISOString() 
      })
      .eq("id", userId);

    if (error) {
      console.error("Failed to toggle user active status:", error);
      return { error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("toggleUserActive error:", err);
    return { error: err instanceof Error ? err.message : "Unauthorized" };
  }
}

export async function settleWager(
  wagerId: string,
  status: "won" | "lost" | "cancelled",
  payout: number
): Promise<AdminActionResult> {
  try {
    // Allow both admin and super_admin to settle wagers
    await requireRole(["super_admin", "admin"]);

    const supabase = await createClient();

    const { error } = await supabase.rpc("settle_wager", {
      wager_id: wagerId,
      final_status: status,
      final_payout: payout,
    });

    if (error) return { error: error.message };
    return { success: true };
  } catch (err) {
    console.error("settleWager error:", err);
    return { error: err instanceof Error ? err.message : "Unauthorized" };
  }
}

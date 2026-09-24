"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type SettingsActionResult = {
  success?: boolean;
  error?: string;
};

export async function updateProfile(fullName: string): Promise<SettingsActionResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    if (error) return { error: error.message };
    
    revalidatePath("/settings");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to update profile" };
  }
}

export async function updateEmail(newEmail: string): Promise<SettingsActionResult> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    
    if (error) return { error: error.message };
    
    return { success: true, error: "Please check your new email for a confirmation link." };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to update email" };
  }
}

export async function updatePassword(newPassword: string): Promise<SettingsActionResult> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    
    if (error) return { error: error.message };
    
    revalidatePath("/settings");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to update password" };
  }
}
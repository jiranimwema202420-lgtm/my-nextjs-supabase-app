"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/rbac/role-guard";

export async function reviewKycDocument(docId: string, action: "approve" | "reject", auditNote: string) {
  await requireRole(["super_admin", "admin", "compliance"]);
  const supabase = await createClient();
  const { error } = await supabase.from("kyc_documents").update({
    status: action === "approve" ? "approved" : "rejected",
    audit_note: auditNote,
    reviewed_at: new Date().toISOString()
  }).eq("id", docId);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  return { success: true };
}

export async function reviewTransactionFlag(txId: string, action: "approve" | "reject", auditNote: string) {
  await requireRole(["super_admin", "admin", "compliance"]);
  const supabase = await createClient();
  const { error } = await supabase.from("transactions").update({
    is_flagged: action === "reject",
    audit_note: auditNote
  }).eq("id", txId);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  return { success: true };
}
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type ActionResult = { success?: boolean; error?: string };

export async function placeBet(amount: number): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("place_bet", { bet_amount: amount });
  if (error) return { error: error.message };
  revalidatePath("/player");
  return { success: true };
}

export async function depositFunds(amount: number): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("deposit_funds", { amount });
  if (error) return { error: error.message };
  revalidatePath("/player");
  return { success: true };
}

export async function withdrawFunds(amount: number): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("withdraw_funds", { amount });
  if (error) return { error: error.message };
  revalidatePath("/player");
  return { success: true };
}
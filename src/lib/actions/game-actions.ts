"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type GameResult = {
  outcome: "won" | "lost";
  roll: number;
  multiplier: number;
  payout: number;
  new_balance: number;
  wager_id: string;
};

export async function playGame(
  game: string,
  amount: number,
  pick?: string,
): Promise<{ success?: boolean; error?: string; result?: GameResult }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  if (!Number.isFinite(amount) || amount <= 0 || amount > 100000) {
    return { error: "Invalid bet amount." };
  }

  const { data, error } = await supabase.rpc("play_game", {
    bet_amount: amount,
    game_name: game,
    client_pick: pick ?? null,
  });

  if (error) {
    if (error.message.includes("Insufficient balance")) {
      return { error: "Insufficient balance for this bet." };
    }
    return { error: error.message };
  }

  revalidatePath("/player");
  return { success: true, result: data as GameResult };
}

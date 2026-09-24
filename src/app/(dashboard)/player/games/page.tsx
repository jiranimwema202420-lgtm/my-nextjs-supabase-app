import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/rbac/role-guard";
import { GameLobbyClient } from "./GameLobbyClient";

export default async function GamesPage() {
  await requireRole(["player"]);
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("balance")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  return <GameLobbyClient initialBalance={Number(profile.balance) || 0} />;
}

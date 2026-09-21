import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileSettingsForm } from "@/components/settings/ProfileSettingsForm";

export default async function SettingsPage() {
  // Note: Role-based access is already enforced by middleware.ts.
  // We only need to fetch the user data here.
  
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, created_at")
    .eq("id", user.id)
    .single();

  return (
    <ProfileSettingsForm
      userEmail={user.email || ""}
      userRole={profile?.role || "player"}
      memberSince={profile?.created_at || ""}
    />
  );
}

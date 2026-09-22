import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { ManagerOperations } from "@/components/manager/ManagerOperations";
import { Users, UserCheck, Gift, TrendingUp } from "lucide-react";

export default async function ManagerPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // Middleware protects this, but double-check on the server
  if (!profile || !["super_admin", "admin", "manager"].includes(profile.role)) {
    redirect("/player");
  }

  // 🛡️ Fetch Manager-specific Stats
  const { count: totalStaff } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .in("role", ["staff", "analyst", "compliance"]);

  const { count: activeStaff } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .in("role", ["staff", "analyst", "compliance"])
    .eq("is_active", true);

  const { count: totalPlayers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "player");

  const stats = [
    {
      label: "Total Staff",
      value: totalStaff || 0,
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "Active Staff",
      value: activeStaff || 0,
      icon: UserCheck,
      color: "text-green-400",
      bg: "bg-green-500/10",
    },
    {
      label: "Total Players",
      value: totalPlayers || 0,
      icon: TrendingUp,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
    {
      label: "Pending Bonuses",
      value: 2, // Mocked for now until we build the bonus_requests table
      icon: Gift,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Manager Dashboard
        </h1>
        <p className="mt-2 text-slate-400">
          Team oversight, VIP management, and operational approvals.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <GlassCard key={stat.label} className="flex items-center gap-4 p-6">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg}`}
            >
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">{stat.label}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-indigo-400" />
          <h2 className="text-xl font-semibold text-white">
            Team & Operations
          </h2>
        </div>
        <ManagerOperations />
      </div>
    </div>
  );
}

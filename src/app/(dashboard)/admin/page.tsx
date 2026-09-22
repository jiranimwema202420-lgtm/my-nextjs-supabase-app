import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { UserManagementTable } from "@/components/admin/UserManagementTable";
import { ComplianceAndApprovals } from "@/components/admin/ComplianceAndApprovals";
import { Users, UserCheck, Activity, Shield } from "lucide-react";

export default async function AdminPage() {
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

  // Middleware protects this, but double-check on the server for defense-in-depth
  if (!profile || !["super_admin", "admin"].includes(profile.role)) {
    redirect("/player");
  }

  // 🛡️ Fetch Admin-specific Stats (Focus on players and staff)
  const { count: totalPlayers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "player");

  const { count: activePlayers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "player")
    .eq("is_active", true);

  const { count: totalStaff } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .in("role", ["staff", "manager", "compliance", "analyst"]);

  // 🛡️ Fetch recent users, BUT EXCLUDE super_admins for security
  const { data: recentUsers, error } = await supabase
    .from("profiles")
    .select("*")
    .neq("role", "super_admin") // Admins cannot see or modify super admins
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("🚨 Supabase Error fetching admin users:", error.message);
  }

  const stats = [
    {
      label: "Total Players",
      value: totalPlayers || 0,
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "Active Players",
      value: activePlayers || 0,
      icon: UserCheck,
      color: "text-green-400",
      bg: "bg-green-500/10",
    },
    {
      label: "Staff & Managers",
      value: totalStaff || 0,
      icon: Activity,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
    {
      label: "System Status",
      value: "Operational",
      icon: Shield,
      color: "text-indigo-400",
      bg: "bg-indigo-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Admin Dashboard
        </h1>
        <p className="mt-2 text-slate-400">
          Day-to-day operations, player management, and compliance oversight.
        </p>
      </div>

      {/* Stats Grid */}
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

      {/* User Management Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-indigo-400" />
          <h2 className="text-xl font-semibold text-white">User Management</h2>
        </div>
        <p className="text-sm text-slate-400">
          Manage players and staff. Super admin accounts are hidden for
          security.
        </p>
        <UserManagementTable initialUsers={recentUsers || []} />
      </div>

      {/* Compliance & Approvals Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-amber-400" />
          <h2 className="text-xl font-semibold text-white">
            Compliance & Approvals
          </h2>
        </div>
        <ComplianceAndApprovals />
      </div>
    </div>
  );
}

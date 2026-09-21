import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { UserManagementTable } from "@/components/admin/UserManagementTable";
import { SecurityAndPlatformSettings } from "@/components/super-admin/SecurityAndPlatformSettings";
import { Users, Shield, Activity, AlertCircle } from "lucide-react";

export default async function SuperAdminPage() {
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

  if (profile?.role !== "super_admin") {
    redirect("/player");
  }

  // Fetch Dashboard Stats
  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const { count: activeAdmins } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .in("role", ["super_admin", "admin", "manager"])
    .eq("is_active", true);

  const { count: inactiveUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("is_active", false);

  const { data: recentUsers } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, is_active, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  const stats = [
    {
      label: "Total Users",
      value: totalUsers || 0,
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "Active Admins",
      value: activeAdmins || 0,
      icon: Shield,
      color: "text-green-400",
      bg: "bg-green-500/10",
    },
    {
      label: "Inactive Accounts",
      value: inactiveUsers || 0,
      icon: AlertCircle,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      label: "System Status",
      value: "Operational",
      icon: Activity,
      color: "text-indigo-400",
      bg: "bg-indigo-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Super Admin Dashboard
        </h1>
        <p className="mt-2 text-slate-400">
          Full system control, role management, and platform administration.
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
          <h2 className="text-xl font-semibold text-white">User Management</h2>
        </div>
        <UserManagementTable initialUsers={recentUsers || []} />
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-indigo-400" />
          <h2 className="text-xl font-semibold text-white">
            Security & Platform Configuration
          </h2>
        </div>
        <SecurityAndPlatformSettings />
      </div>
    </div>
  );
}

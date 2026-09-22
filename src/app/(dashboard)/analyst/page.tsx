import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { FinancialTrends } from "@/components/analyst/FinancialTrends";
import {
  BarChart3,
  DollarSign,
  TrendingUp,
  Users,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

export default async function AnalystPage() {
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
  if (!profile || !["super_admin", "admin", "analyst"].includes(profile.role)) {
    redirect("/player");
  }

  // 🛡️ Fetch Analyst-specific Stats (Mocked for now until we build the transactions table)
  const stats = [
    {
      label: "Total GGR (7d)",
      value: "$142,500",
      change: "+12.5%",
      isPositive: true,
      icon: DollarSign,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "Total NGR (7d)",
      value: "$98,200",
      change: "+8.2%",
      isPositive: true,
      icon: TrendingUp,
      color: "text-green-400",
      bg: "bg-green-500/10",
    },
    {
      label: "Active Players",
      value: "3,420",
      change: "-2.1%",
      isPositive: false,
      icon: Users,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
    {
      label: "Avg. Bet Size",
      value: "$45.50",
      change: "+0.5%",
      isPositive: true,
      icon: BarChart3,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Analyst Dashboard
        </h1>
        <p className="mt-2 text-slate-400">
          Financial reporting, player behavior analysis, and data exports.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <GlassCard
            key={stat.label}
            className="flex items-center justify-between p-6"
          >
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-400">{stat.label}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <div
                className={`flex items-center gap-1 text-xs font-medium ${stat.isPositive ? "text-green-400" : "text-red-400"}`}
              >
                {stat.isPositive ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {stat.change} vs last week
              </div>
            </div>
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg}`}
            >
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Charts Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-indigo-400" />
          <h2 className="text-xl font-semibold text-white">
            Performance Analytics
          </h2>
        </div>
        <FinancialTrends />
      </div>
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { ComplianceAndApprovals } from "@/components/admin/ComplianceAndApprovals";
import {
  FileCheck,
  AlertTriangle,
  Shield,
  TrendingUp,
  UserX,
  DollarSign,
} from "lucide-react";

export default async function CompliancePage() {
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
  if (
    !profile ||
    !["super_admin", "admin", "compliance"].includes(profile.role)
  ) {
    redirect("/player");
  }

  // 🛡️ Fetch Compliance-specific Stats
  // (These are mocked for now - replace with actual table queries when you create them)
  const { count: totalPlayers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "player");

  const { count: inactivePlayers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "player")
    .eq("is_active", false);

  // Mock data for demo purposes
  const stats = [
    {
      label: "KYC Queue",
      value: 2, // Mock: Replace with actual count from kyc_documents table
      icon: FileCheck,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "Fraud Flags",
      value: 2, // Mock: Replace with actual count from fraud_alerts table
      icon: AlertTriangle,
      color: "text-red-400",
      bg: "bg-red-500/10",
    },
    {
      label: "Risk Limits Breached",
      value: 0, // Mock: Replace with actual count
      icon: Shield,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      label: "Inactive Accounts",
      value: inactivePlayers || 0,
      icon: UserX,
      color: "text-slate-400",
      bg: "bg-slate-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Compliance Dashboard
        </h1>
        <p className="mt-2 text-slate-400">
          KYC validation, fraud detection, AML monitoring, and responsible
          gaming oversight.
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

      {/* Risk Monitoring Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">
              High-Risk Players
            </h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3">
              <div>
                <p className="text-sm font-medium text-white">
                  vip.player@example.com
                </p>
                <p className="text-xs text-slate-400">Risk Score: 85/100</p>
              </div>
              <span className="rounded-full bg-red-500/20 px-2 py-1 text-xs font-medium text-red-400 border border-red-500/20">
                Critical
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3">
              <div>
                <p className="text-sm font-medium text-white">
                  high.roller@example.com
                </p>
                <p className="text-xs text-slate-400">Risk Score: 72/100</p>
              </div>
              <span className="rounded-full bg-amber-500/20 px-2 py-1 text-xs font-medium text-amber-400 border border-amber-500/20">
                High
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-500 pt-2">
            * Risk scores calculated based on deposit patterns, wagering
            behavior, and geographic location.
          </p>
        </GlassCard>

        <GlassCard className="space-y-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-400" />
            <h2 className="text-lg font-semibold text-white">AML Alerts</h2>
          </div>
          <div className="space-y-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-white">
                  Structuring Detected
                </p>
                <span className="text-xs text-slate-400">2 hrs ago</span>
              </div>
              <p className="text-xs text-slate-400">
                Player made 5 deposits of $9,000 each within 24 hours (below
                $10k reporting threshold).
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-white">
                  Rapid Fund Movement
                </p>
                <span className="text-xs text-slate-400">5 hrs ago</span>
              </div>
              <p className="text-xs text-slate-400">
                Large deposit followed by immediate withdrawal request
                (potential money laundering).
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Compliance & Approvals Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-indigo-400" />
          <h2 className="text-xl font-semibold text-white">
            KYC & Transaction Reviews
          </h2>
        </div>
        <ComplianceAndApprovals />
      </div>
    </div>
  );
}

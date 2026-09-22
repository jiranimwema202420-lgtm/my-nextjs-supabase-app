import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { StaffOperations } from "@/components/staff/StaffOperations";
import { Headphones, Ticket, CheckCircle, Clock } from "lucide-react";

export default async function StaffPage() {
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
  if (
    !profile ||
    !["super_admin", "admin", "manager", "staff"].includes(profile.role)
  ) {
    redirect("/player");
  }

  // 🛡️ Fetch Staff-specific Stats
  // (Mocked for now until we build the actual support_tickets table in Supabase)
  const stats = [
    {
      label: "My Open Tickets",
      value: 3,
      icon: Ticket,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "Resolved Today",
      value: 12,
      icon: CheckCircle,
      color: "text-green-400",
      bg: "bg-green-500/10",
    },
    {
      label: "Avg Response Time",
      value: "4m",
      icon: Clock,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      label: "Customer Satisfaction",
      value: "98%",
      icon: Headphones,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Staff Dashboard
        </h1>
        <p className="mt-2 text-slate-400">
          Frontline support, ticket management, and player assistance.
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

      {/* Operations Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Headphones className="h-5 w-5 text-indigo-400" />
          <h2 className="text-xl font-semibold text-white">
            Support Operations
          </h2>
        </div>
        <StaffOperations />
      </div>
    </div>
  );
}

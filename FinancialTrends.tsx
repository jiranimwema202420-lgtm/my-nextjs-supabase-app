"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { TrendingUp } from "lucide-react";

const MOCK_TRENDS = [
  { day: "Mon", revenue: 45, users: 30 },
  { day: "Tue", revenue: 62, users: 45 },
  { day: "Wed", revenue: 55, users: 40 },
  { day: "Thu", revenue: 78, users: 55 },
  { day: "Fri", revenue: 90, users: 70 },
  { day: "Sat", revenue: 95, users: 85 },
  { day: "Sun", revenue: 82, users: 75 },
];

export function FinancialTrends() {
  return (
    <GlassCard className="space-y-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-indigo-400" />
          <h2 className="text-lg font-semibold text-white">
            7-Day Financial Trends
          </h2>
        </div>
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
            <span className="text-slate-400">Revenue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-400">Active Users</span>
          </div>
        </div>
      </div>

      <div className="flex h-64 items-end justify-between gap-2 pt-4">
        {MOCK_TRENDS.map((data) => (
          <div
            key={data.day}
            className="flex flex-1 flex-col items-center gap-2 group"
          >
            <div className="flex w-full items-end justify-center gap-1 h-full">
              <div
                className="w-1/2 rounded-t-md bg-indigo-500/80 hover:bg-indigo-400 transition-all relative group-hover:shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                style={{ height: `${data.revenue}%` }}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-800 text-white text-xs px-2 py-1 rounded border border-white/10 whitespace-nowrap">
                  ${data.revenue}k
                </div>
              </div>
              <div
                className="w-1/2 rounded-t-md bg-emerald-500/80 hover:bg-emerald-400 transition-all"
                style={{ height: `${data.users}%` }}
              />
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {data.day}
            </span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

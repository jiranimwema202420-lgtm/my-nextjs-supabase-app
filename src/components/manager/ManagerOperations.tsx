"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Users, Gift, CheckCircle, XCircle, Loader2 } from "lucide-react";

const MOCK_STAFF = [
  { id: "s1", name: "Alice Support", role: "staff", status: "Active", ticketsResolved: 42, lastActive: "10 mins ago" },
  { id: "s2", name: "Bob Analyst", role: "analyst", status: "Active", ticketsResolved: 15, lastActive: "1 hr ago" },
  { id: "s3", name: "Charlie Compliance", role: "compliance", status: "Away", ticketsResolved: 8, lastActive: "3 hrs ago" },
];

const MOCK_BONUSES = [
  { id: "b1", player: "vip.player@example.com", amount: "$50.00", reason: "Loyalty Reward", requestedBy: "Alice Support", time: "30 mins ago" },
  { id: "b2", player: "high.roller@example.com", amount: "$200.00", reason: "Retention Offer", requestedBy: "Bob Analyst", time: "2 hrs ago" },
];

export function ManagerOperations() {
  const [activeTab, setActiveTab] = useState<"staff" | "bonuses">("staff");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleAction = async (id: string, action: "approve" | "reject") => {
    setProcessingId(id);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log(`${action.toUpperCase()}D: ${id}`);
    setProcessingId(null);
  };

  return (
    <GlassCard className="space-y-6">
      <div className="flex border-b border-white/10">
        <button
          onClick={() => setActiveTab("staff")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "staff" ? "border-indigo-500 text-indigo-400" : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <Users className="h-4 w-4" />
          Staff Overview
          <span className="ml-1 rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs text-indigo-300">{MOCK_STAFF.length}</span>
        </button>
        <button
          onClick={() => setActiveTab("bonuses")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "bonuses" ? "border-amber-500 text-amber-400" : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <Gift className="h-4 w-4" />
          Bonus Approvals
          <span className="ml-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-300">{MOCK_BONUSES.length}</span>
        </button>
      </div>

      {activeTab === "staff" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MOCK_STAFF.map((staff) => (
            <div key={staff.id} className="rounded-xl border border-white/10 bg-white/5 p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-white">{staff.name}</p>
                <p className="text-xs text-slate-400 capitalize">{staff.role} • {staff.status}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-indigo-400">{staff.ticketsResolved}</p>
                <p className="text-xs text-slate-500">Tickets</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "bonuses" && (
        <div className="space-y-4">
          {MOCK_BONUSES.length === 0 ? (
            <p className="text-center text-sm text-slate-500 py-8">No pending bonus requests.</p>
          ) : (
            MOCK_BONUSES.map((bonus) => (
              <div key={bonus.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
                    <Gift className="h-5 w-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{bonus.player}</p>
                    <p className="text-xs text-slate-400">Amount: {bonus.amount} • Reason: {bonus.reason} • By: {bonus.requestedBy}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAction(bonus.id, "reject")}
                    disabled={processingId === bonus.id}
                    className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20 disabled:opacity-50"
                  >
                    {processingId === bonus.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
                    Reject
                  </button>
                  <button
                    onClick={() => handleAction(bonus.id, "approve")}
                    disabled={processingId === bonus.id}
                    className="flex items-center gap-1.5 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-400 hover:bg-green-500/20 disabled:opacity-50"
                  >
                    {processingId === bonus.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
                    Approve
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </GlassCard>
  );
}

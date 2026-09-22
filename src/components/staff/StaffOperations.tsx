"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  Ticket,
  Search,
  User,
  MessageSquare,
  Loader2,
  CheckCircle,
} from "lucide-react";

const MOCK_TICKETS = [
  {
    id: "t1",
    player: "john.doe@example.com",
    subject: "Withdrawal Delay",
    priority: "High",
    status: "Open",
    time: "15 mins ago",
  },
  {
    id: "t2",
    player: "jane.smith@example.com",
    subject: "Bonus Not Credited",
    priority: "Medium",
    status: "Open",
    time: "1 hr ago",
  },
  {
    id: "t3",
    player: "mike.jones@example.com",
    subject: "Password Reset",
    priority: "Low",
    status: "Pending",
    time: "3 hrs ago",
  },
];

export function StaffOperations() {
  const [activeTab, setActiveTab] = useState<"tickets" | "lookup">("tickets");
  const [searchQuery, setSearchQuery] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleResolve = async (id: string) => {
    setProcessingId(id);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    console.log(`RESOLVED: ${id}`);
    setProcessingId(null);
  };

  return (
    <GlassCard className="space-y-6">
      {/* Tabs */}
      <div className="flex border-b border-white/10">
        <button
          onClick={() => setActiveTab("tickets")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "tickets"
              ? "border-indigo-500 text-indigo-400"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <Ticket className="h-4 w-4" />
          Support Queue
          <span className="ml-1 rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs text-indigo-300">
            {MOCK_TICKETS.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("lookup")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "lookup"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <Search className="h-4 w-4" />
          Player Lookup
        </button>
      </div>

      {/* Tickets Tab Content */}
      {activeTab === "tickets" && (
        <div className="space-y-3">
          {MOCK_TICKETS.length === 0 ? (
            <p className="text-center text-sm text-slate-500 py-8">
              No pending tickets. Great job!
            </p>
          ) : (
            MOCK_TICKETS.map((ticket) => (
              <div
                key={ticket.id}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      ticket.priority === "High"
                        ? "bg-red-500/10"
                        : ticket.priority === "Medium"
                          ? "bg-amber-500/10"
                          : "bg-blue-500/10"
                    }`}
                  >
                    <MessageSquare
                      className={`h-5 w-5 ${
                        ticket.priority === "High"
                          ? "text-red-400"
                          : ticket.priority === "Medium"
                            ? "text-amber-400"
                            : "text-blue-400"
                      }`}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-white">{ticket.subject}</p>
                    <p className="text-xs text-slate-400">
                      {ticket.player} • {ticket.time} •{" "}
                      <span className="capitalize">{ticket.status}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleResolve(ticket.id)}
                  disabled={processingId === ticket.id}
                  className="flex items-center gap-1.5 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-400 hover:bg-green-500/20 disabled:opacity-50"
                >
                  {processingId === ticket.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <CheckCircle className="h-3.5 w-3.5" />
                  )}
                  Resolve
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Lookup Tab Content */}
      {activeTab === "lookup" && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by email, username, or player ID..."
              className="w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 outline-none focus:border-indigo-500"
            />
          </div>

          {searchQuery && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center">
              <User className="h-8 w-8 mx-auto text-slate-400 mb-2" />
              <p className="text-sm text-slate-300">
                Player details for{" "}
                <span className="text-white font-medium">{searchQuery}</span>{" "}
                will appear here.
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Connect to the profiles table to fetch real-time player data.
              </p>
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );
}

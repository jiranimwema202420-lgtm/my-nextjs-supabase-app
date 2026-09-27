"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { approveWithdrawal, rejectWithdrawal } from "@/lib/actions/payment-actions";
import { CheckCircle, XCircle, Loader2, Banknote } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

type PendingWithdrawal = { id: string; user_id: string; amount: number; created_at: string };

export function AdminPaymentsQueue() {
  const [withdrawals, setWithdrawals] = useState<PendingWithdrawal[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const supabase = createClient();

  const fetchPending = useCallback(async () => {
    const { data } = await supabase
      .from("payments")
      .select("id, user_id, amount, created_at")
      .eq("type", "withdrawal")
      .eq("status", "pending_review")
      .order("created_at", { ascending: false });
    if (data) setWithdrawals(data as PendingWithdrawal[]);
  }, [supabase]);

  useEffect(() => {
    fetchPending();
    const channel = supabase
      .channel("admin-payments-queue")
      .on("postgres_changes", { event: "*", schema: "public", table: "payments" }, fetchPending)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchPending, supabase]);

  const handleAction = async (id: string, approve: boolean) => {
    setActiveId(id);
    setMessage(null);
    try {
      const result = approve ? await approveWithdrawal(id) : await rejectWithdrawal(id);
      if (result.success) {
        setMessage({ kind: "success", text: approve ? "Withdrawal approved & marked succeeded." : "Withdrawal rejected - funds refunded to player." });
        fetchPending();
      } else {
        setMessage({ kind: "error", text: result.error ?? "Action failed." });
      }
    } catch (err: any) {
      setMessage({ kind: "error", text: err?.message ?? "Unexpected error." });
    } finally {
      setActiveId(null);
    }
  };

  return (
    <GlassCard>
      <div className="flex items-center gap-3 mb-4">
        <Banknote className="h-5 w-5 text-emerald-400" />
        <h2 className="text-lg font-semibold text-white">Compliance: Pending Withdrawals</h2>
      </div>

      {message && (
        <p className={`mb-4 rounded-lg px-3 py-2 text-xs ${message.kind === "success" ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-300" : "border border-rose-500/20 bg-rose-500/10 text-rose-300"}`}>
          {message.text}
        </p>
      )}

      {withdrawals.length === 0 ? (
        <p className="text-sm text-slate-400">No pending withdrawal requests.</p>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
          {withdrawals.map((w) => (
            <div key={w.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3">
              <div>
                <p className="text-sm font-medium text-white">User: <span className="font-mono text-xs text-slate-400">{w.user_id.slice(0, 8)}</span></p>
                <p className="text-lg font-bold text-emerald-400">${Number(w.amount).toFixed(2)}</p>
                <p className="text-[10px] text-slate-500">{new Date(w.created_at).toLocaleString()}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleAction(w.id, false)} disabled={activeId === w.id} className="flex items-center gap-1 rounded-md bg-rose-500/20 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/30 disabled:opacity-50">
                  {activeId === w.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />} Reject
                </button>
                <button onClick={() => handleAction(w.id, true)} disabled={activeId === w.id} className="flex items-center gap-1 rounded-md bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/30 disabled:opacity-50">
                  {activeId === w.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />} Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
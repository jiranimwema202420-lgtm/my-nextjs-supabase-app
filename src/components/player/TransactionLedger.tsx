"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import {
  ArrowUpRight,
  ArrowDownRight,
  Gift,
  RefreshCw,
  AlertCircle,
  type LucideIcon,
} from "lucide-react";

type Transaction = {
  id: string;
  type: "deposit" | "withdrawal" | "bet" | "payout" | "bonus" | "adjustment";
  amount: number;
  balance_after: number;
  status: "pending" | "completed" | "failed";
  description: string;
  created_at: string;
};

const typeConfig: Record<
  Transaction["type"],
  { icon: LucideIcon; color: string; label: string }
> = {
  deposit: {
    icon: ArrowDownRight,
    color: "text-emerald-400",
    label: "Deposit",
  },
  withdrawal: {
    icon: ArrowUpRight,
    color: "text-rose-400",
    label: "Withdrawal",
  },
  bet: { icon: RefreshCw, color: "text-amber-400", label: "Wager" },
  payout: { icon: ArrowDownRight, color: "text-emerald-400", label: "Payout" },
  bonus: { icon: Gift, color: "text-purple-400", label: "Bonus" },
  adjustment: {
    icon: AlertCircle,
    color: "text-slate-400",
    label: "Adjustment",
  },
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
}

export function TransactionLedger({
  transactions,
}: {
  transactions: Transaction[];
}) {
  return (
    <GlassCard className="flex flex-col">
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Transaction Ledger
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Complete history of all wallet movements.
          </p>
        </div>
        <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-slate-300 border border-white/10">
          {transactions.length} Entries
        </span>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[400px] space-y-2 pr-2 custom-scrollbar">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <RefreshCw className="h-10 w-10 mb-3 opacity-50" />
            <p className="text-sm font-medium">No transactions yet.</p>
            <p className="text-xs">Your ledger will update in real-time.</p>
          </div>
        ) : (
          transactions.slice(0, 20).map((tx: Transaction) => {
            const config = typeConfig[tx.type];
            const Icon = config.icon;
            const isNegative = tx.type === "bet" || tx.type === "withdrawal";

            return (
              <div
                key={tx.id}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5">
                    <Icon className={`h-5 w-5 ${config.color}`} />
                  </div>
                  <div>
                    <p className="font-medium text-white">{config.label}</p>
                    <p className="text-xs text-slate-400">
                      {formatDate(tx.created_at)}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {tx.description}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p
                    className={`text-sm font-semibold ${
                      isNegative ? "text-rose-400" : "text-emerald-400"
                    }`}
                  >
                    {isNegative ? "-" : "+"}
                    {formatCurrency(tx.amount)}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Balance: {formatCurrency(tx.balance_after)}
                  </p>
                  {tx.status === "pending" && (
                    <span className="inline-block mt-1 rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-400 border border-amber-500/20">
                      Pending
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </GlassCard>
  );
}

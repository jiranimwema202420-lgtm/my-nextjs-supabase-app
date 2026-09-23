"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  placeBet,
  depositFunds,
  withdrawFunds,
} from "@/lib/actions/wallet-actions";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Dice5,
  Loader2,
} from "lucide-react";

interface WalletActionsProps {
  balance?: number;
}

export function WalletActions({ balance }: WalletActionsProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw" | "bet">(
    "bet",
  );
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const quickAmounts = [10, 25, 50, 100];
  const targetAmount = Number(amount);

  async function handleAction() {
    setMessage("");

    if (!Number.isFinite(targetAmount) || targetAmount <= 0) {
      setMessage("Please enter a valid amount.");
      return;
    }

    if (targetAmount > 100000) {
      setMessage("Amount too large.");
      return;
    }

    // Client-side guard for bets and withdrawals
    if (
      (activeTab === "bet" || activeTab === "withdraw") &&
      balance !== undefined &&
      targetAmount > balance
    ) {
      setMessage("Insufficient balance.");
      return;
    }

    setLoading(true);

    try {
      let result: { success?: boolean; error?: string };

      if (activeTab === "bet") {
        result = await placeBet(targetAmount);
      } else if (activeTab === "deposit") {
        result = await depositFunds(targetAmount);
      } else {
        result = await withdrawFunds(targetAmount);
      }

      if (result.error) {
        setMessage(result.error);
      } else {
        setMessage(
          activeTab === "bet"
            ? "Bet placed successfully!"
            : activeTab === "deposit"
              ? `Deposit of $${targetAmount.toFixed(2)} processed successfully!`
              : `Withdrawal of $${targetAmount.toFixed(2)} processed successfully!`,
        );
        setAmount("");
        // Refresh server data so the Transaction Ledger updates instantly
        router.refresh();
      }
    } catch (error) {
      console.error("[WalletActions]", error);
      setMessage("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex rounded-xl border border-white/10 bg-white/5 p-1">
        {[
          { id: "deposit", label: "Deposit", icon: ArrowDownRight },
          { id: "withdraw", label: "Withdraw", icon: ArrowUpRight },
          { id: "bet", label: "Place Bet", icon: Dice5 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as "deposit" | "withdraw" | "bet");
              setMessage("");
            }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-indigo-600 text-white shadow-lg"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Quick Amounts */}
      <div className="flex flex-wrap gap-2">
        {quickAmounts.map((quickAmount) => (
          <button
            key={quickAmount}
            type="button"
            onClick={() => setAmount(String(quickAmount))}
            className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
              amount === String(quickAmount)
                ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-300"
                : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            ${quickAmount}
          </button>
        ))}
      </div>

      {/* Custom Amount Input */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          $
        </span>
        <input
          type="number"
          min="0"
          max="100000"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pl-8 text-lg font-semibold text-white outline-none transition-colors placeholder:text-slate-600 focus:border-indigo-500"
        />
      </div>

      {/* Action Button */}
      <button
        type="button"
        onClick={handleAction}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Wallet className="h-4 w-4" />
        )}
        {loading
          ? "Processing..."
          : activeTab === "bet"
            ? "Confirm Bet"
            : `Confirm ${activeTab === "deposit" ? "Deposit" : "Withdrawal"}`}
      </button>

      {/* Feedback Message */}
      {message && (
        <p className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-4 py-3 text-sm text-indigo-200 text-center">
          {message}
        </p>
      )}

      {/* Balance Display */}
      {balance !== undefined && (
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center">
          <p className="text-xs text-slate-400 uppercase tracking-wide">
            Available Balance
          </p>
          <p className="text-xl font-bold text-white">${balance.toFixed(2)}</p>
        </div>
      )}
    </div>
  );
}

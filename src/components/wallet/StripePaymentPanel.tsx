"use client";

import { useEffect, useState, useTransition } from "react";
import { createDeposit, requestWithdrawal } from "@/lib/actions/payment-actions";
import { ArrowDownLeft, ArrowUpRight, Loader2 } from "lucide-react";

export function StripePaymentPanel({ balance }: { balance: number }) {
  const [depositAmount, setDepositAmount] = useState("25");
  const [withdrawAmount, setWithdrawAmount] = useState("25");
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("deposit") === "success") {
      setMessage({ kind: "success", text: "Payment received! Balance updating..." });
      window.history.replaceState({}, "", window.location.pathname);
    } else if (params.get("deposit") === "canceled") {
      setMessage({ kind: "error", text: "Checkout canceled - no charge was made." });
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const handleDeposit = () => {
    const amt = Number(depositAmount);
    if (!Number.isFinite(amt) || amt < 1) {
      setMessage({ kind: "error", text: "Minimum deposit is $1." });
      return;
    }
    setMessage(null);
    startTransition(() => {
      createDeposit(amt);
    });
  };

  const handleWithdraw = async () => {
    const amt = Number(withdrawAmount);
    if (!Number.isFinite(amt) || amt <= 0) {
      setMessage({ kind: "error", text: "Enter a valid withdrawal amount." });
      return;
    }
    if (amt > balance) {
      setMessage({ kind: "error", text: "Insufficient balance." });
      return;
    }
    setWithdrawing(true);
    setMessage(null);
    const result = await requestWithdrawal(amt);
    setWithdrawing(false);
    if (result.success) {
      setMessage({ kind: "success", text: "Withdrawal requested - pending compliance review." });
    } else {
      setMessage({ kind: "error", text: result.error ?? "Withdrawal failed." });
    }
  };

  return (
    <div className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        Stripe Payments (Test Mode)
      </p>

      {message && (
        <p
          className={
            message.kind === "success"
              ? "rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300"
              : "rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs text-rose-300"
          }
        >
          {message.text}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs text-slate-400">Deposit via Stripe</label>
          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              step="1"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none focus:border-emerald-300/50"
            />
            <button
              onClick={handleDeposit}
              disabled={pending}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-400 px-3 py-2 text-xs font-bold text-slate-950 transition-colors hover:bg-emerald-300 disabled:opacity-60"
            >
              {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowDownLeft className="h-3.5 w-3.5" />}
              Pay
            </button>
          </div>
          <p className="text-[10px] text-slate-500">Test card: 4242 4242 4242 4242</p>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-slate-400">Request Withdrawal</label>
          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              step="1"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none focus:border-rose-300/50"
            />
            <button
              onClick={handleWithdraw}
              disabled={withdrawing}
              className="flex items-center gap-1.5 rounded-lg bg-rose-400 px-3 py-2 text-xs font-bold text-slate-950 transition-colors hover:bg-rose-300 disabled:opacity-60"
            >
              {withdrawing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
              Request
            </button>
          </div>
          <p className="text-[10px] text-slate-500">Reviewed by compliance before payout</p>
        </div>
      </div>
    </div>
  );
}
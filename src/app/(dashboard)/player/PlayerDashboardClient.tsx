"use client";
"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { WalletActions } from "@/components/wallet/WalletActions";
import { TransactionLedger } from "@/components/player/TransactionLedger";
import { createClient } from "@/lib/supabase/client";
import { useWalletStore } from "@/store/wallet-store";
import { GlassCard } from "@/components/ui/GlassCard";
import { Dice5, Gamepad2 } from "lucide-react";
import type { UserProfile, Wager } from "@/types/wager";
import {
  TransactionLedger,
  type Transaction,
} from "@/components/player/TransactionLedger";

type PlayerDashboardClientProps = {
  initialProfile: UserProfile;
  initialWagers: Wager[];
  initialTransactions: Transaction[];
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function formatCurrency(value: number | string) {
  return currencyFormatter.format(Number(value));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function PlayerDashboardClient({
  initialProfile,
  initialWagers,
  initialTransactions,
}: PlayerDashboardClientProps) {
  const supabase = useMemo(() => createClient(), []);
  const {
    balance,
    wagers,
    isRealtimeConnected,
    setInitialData,
    addWager,
    updateWager,
    deleteWager,
    updateBalance,
    setRealtimeConnected,
  } = useWalletStore();

  useEffect(() => {
    setInitialData(initialProfile, initialWagers);
  }, [initialProfile, initialWagers, setInitialData]);

  useEffect(() => {
    const profileChannel = supabase
      .channel(`player-profile-${initialProfile.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${initialProfile.id}`,
        },
        (payload) => {
          updateBalance(Number((payload.new as UserProfile).balance));
        },
      )
      .subscribe();

    const wagersChannel = supabase
      .channel(`player-wagers-${initialProfile.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "wagers",
          filter: `user_id=eq.${initialProfile.id}`,
        },
        (payload) => {
          addWager(payload.new as Wager);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "wagers",
          filter: `user_id=eq.${initialProfile.id}`,
        },
        (payload) => {
          updateWager(payload.new as Wager);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "wagers",
          filter: `user_id=eq.${initialProfile.id}`,
        },
        (payload) => {
          deleteWager((payload.old as Wager).id);
        },
      )
      .subscribe((status) => {
        setRealtimeConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(profileChannel);
      supabase.removeChannel(wagersChannel);
      setRealtimeConnected(false);
    };
  }, [
    addWager,
    deleteWager,
    initialProfile.id,
    setRealtimeConnected,
    supabase,
    updateBalance,
    updateWager,
  ]);

  const wagerStats = useMemo(() => {
    return wagers.reduce(
      (stats, wager) => {
        const amount = Number(wager.amount);
        const payout = Number(wager.payout);

        stats.totalStaked += amount;
        stats[wager.status] += 1;

        if (wager.status !== "pending") {
          stats.totalPayout += payout;
        }

        return stats;
      },
      {
        totalStaked: 0,
        totalPayout: 0,
        pending: 0,
        won: 0,
        lost: 0,
        cancelled: 0,
      },
    );
  }, [wagers]);

  return (
    <section className="space-y-6">
      {/* Header */}
      <GlassCard className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
            Player Wallet
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-white">
            Welcome back, {initialProfile.email}
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            Manage funds, place wagers, and watch account activity update in
            real time.
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
          <span
            className={
              isRealtimeConnected ? "text-emerald-400" : "text-amber-400"
            }
          >
            {isRealtimeConnected ? "● Realtime connected" : "○ Connecting..."}
          </span>
        </div>
      </GlassCard>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <GlassCard className="md:col-span-2">
          <h2 className="text-sm text-slate-400">Available Balance</h2>
          <p className="mt-2 text-4xl font-bold text-white">
            {formatCurrency(balance)}
          </p>
          <p className="mt-2 text-xs text-slate-400">
            Deposits, withdrawals, and wagers settle against this wallet.
          </p>
        </GlassCard>

        <GlassCard>
          <h2 className="text-sm text-slate-400">Open Wagers</h2>
          <p className="mt-2 text-3xl font-bold text-white">
            {wagerStats.pending}
          </p>
          <p className="mt-2 text-xs text-slate-400">Waiting for settlement.</p>
        </GlassCard>

        <GlassCard>
          <h2 className="text-sm text-slate-400">Net Winnings</h2>
          <p
            className={`mt-2 text-3xl font-bold ${wagerStats.totalPayout - wagerStats.totalStaked >= 0 ? "text-emerald-400" : "text-rose-400"}`}
          >
            {formatCurrency(wagerStats.totalPayout - wagerStats.totalStaked)}
          </p>
          <p className="mt-2 text-xs text-slate-400">
            Across visible wager history.
          </p>
        </GlassCard>
      </div>

      {/* 🆕 Game Lobby Entrance */}
      <Link href="/player/games" className="block">
        <GlassCard className="flex items-center justify-between p-6 transition-colors hover:bg-white/10 cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-fuchsia-500/10">
              <Gamepad2 className="h-6 w-6 text-fuchsia-400" />
            </div>
            <div>
              <p className="font-semibold text-white">Game Lobby</p>
              <p className="text-sm text-slate-400">
                Lucky Dice, Coin Flip & Neon Slots — play now
              </p>
            </div>
          </div>
          <span className="text-sm font-medium text-indigo-300">Enter →</span>
        </GlassCard>
      </Link>

      {/* Actions & History Grid */}
      <div className="grid gap-6 xl:grid-cols-[400px_1fr]">
        <GlassCard>
          <h2 className="text-lg font-semibold text-white">Wallet Actions</h2>
          <p className="mt-1 text-sm text-slate-400">
            Use quick amounts or enter a custom value.
          </p>
          <div className="mt-6">
            <WalletActions balance={balance} />
          </div>
        </GlassCard>

        <GlassCard className="flex flex-col">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-white/10 pb-4 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Wager History
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Recent player wagers and settlement outcomes.
              </p>
            </div>
            <p className="text-sm text-slate-400">{wagers.length} total</p>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[500px] space-y-2 pr-2 custom-scrollbar">
            {wagers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <Dice5 className="h-10 w-10 mb-3 opacity-50" />
                <p className="text-sm font-medium">No wagers yet.</p>
                <p className="text-xs">Place a bet to start your history.</p>
              </div>
            ) : (
              wagers.slice(0, 12).map((wager) => (
                <div
                  key={wager.id}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        wager.status === "won"
                          ? "bg-emerald-500/10"
                          : wager.status === "lost"
                            ? "bg-rose-500/10"
                            : "bg-amber-500/10"
                      }`}
                    >
                      <span className="text-xs font-bold uppercase text-slate-300">
                        {wager.status.slice(0, 1)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-white">
                        Wager {wager.id.slice(0, 8)}
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatDate(wager.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">
                      {formatCurrency(wager.amount)}
                    </p>
                    <p className="text-xs text-slate-400">
                      {wager.status === "pending"
                        ? "Pending"
                        : `Payout: ${formatCurrency(wager.payout)}`}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>

      {/* Game Lobby Entrance */}
      <Link href="/player/games" className="block">
        <GlassCard className="flex items-center justify-between p-6 transition-colors hover:bg-white/10 cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-fuchsia-500/10">
              <Gamepad2 className="h-6 w-6 text-fuchsia-400" />
            </div>
            <div>
              <p className="font-semibold text-white">Game Lobby</p>
              <p className="text-sm text-slate-400">
                Lucky Dice, Coin Flip & Neon Slots — play now
              </p>
            </div>
          </div>
          <span className="text-sm font-medium text-indigo-300">Enter →</span>
        </GlassCard>
      </Link>

      {/* Transaction Ledger Section */}
      <TransactionLedger transactions={initialTransactions} />
    </section>
  );
}

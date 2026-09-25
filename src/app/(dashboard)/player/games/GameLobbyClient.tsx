"use client";

import { useState } from "react";
import Link from "next/link";
import { playGame, type GameResult } from "@/lib/actions/game-actions";
import { GAMES, type Game } from "@/lib/games/catalog";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  Dice5,
  Coins,
  Sparkles,
  Loader2,
  ArrowLeft,
  Trophy,
  Skull,
  Wallet,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<Game["icon"], LucideIcon> = {
  dice: Dice5,
  coin: Coins,
  slots: Sparkles,
};

const QUICK = [5, 10, 25, 100];

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);
}

export function GameLobbyClient({
  initialBalance,
}: {
  initialBalance: number;
}) {
  const [balance, setBalance] = useState(initialBalance);
  const [selected, setSelected] = useState<Game | null>(null);
  const [amount, setAmount] = useState("10");
  const [pick, setPick] = useState<"heads" | "tails">("heads");
  const [playing, setPlaying] = useState(false);
  const [result, setResult] = useState<GameResult | null>(null);
  const [error, setError] = useState("");

  const handlePlay = async () => {
    if (!selected) return;
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      setError("Enter a valid amount.");
      return;
    }
    if (amt > balance) {
      setError("Insufficient balance.");
      return;
    }
    setError("");
    setResult(null);
    setPlaying(true);
    try {
      const res = await playGame(
        selected.id,
        amt,
        selected.needsPick ? pick : undefined,
      );
      if (res.error) {
        setError(res.error);
      } else if (res.result) {
        setResult(res.result);
        setBalance(Number(res.result.new_balance));
      }
    } catch {
      setError("Unexpected error while playing.");
    } finally {
      setPlaying(false);
    }
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/player"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Game Lobby
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Server-verified outcomes. Every round settles atomically in your
              ledger.
            </p>
          </div>
        </div>
        <GlassCard className="flex items-center gap-3 px-5 py-3">
          <Wallet className="h-5 w-5 text-emerald-400" />
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Balance
            </p>
            <p className="text-lg font-bold text-white">{fmt(balance)}</p>
          </div>
        </GlassCard>
      </div>

      {!selected ? (
        /* ============ GAME GRID ============ */
        <div className="grid gap-6 md:grid-cols-3">
          {GAMES.map((game) => {
            const Icon = ICONS[game.icon];
            return (
              <button
                key={game.id}
                onClick={() => {
                  setSelected(game);
                  setResult(null);
                  setError("");
                }}
                className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${game.gradient} p-6 text-left transition-all hover:scale-[1.02] hover:border-white/25`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h2 className="mt-4 text-xl font-semibold text-white">
                  {game.name}
                </h2>
                <p className="mt-1 text-sm text-slate-300">{game.tagline}</p>
                <p className="mt-3 text-xs text-slate-400">{game.edge}</p>
                <span className="mt-4 inline-block rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
                  Play Now →
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        /* ============ PLAY PANEL ============ */
        <GlassCard className="mx-auto max-w-xl space-y-6 p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {(() => {
                const Icon = ICONS[selected.icon];
                return <Icon className="h-6 w-6 text-indigo-300" />;
              })()}
              <h2 className="text-xl font-semibold text-white">
                {selected.name}
              </h2>
            </div>
            <button
              onClick={() => {
                setSelected(null);
                setResult(null);
                setError("");
              }}
              className="text-sm text-slate-400 hover:text-white"
            >
              ← Back to lobby
            </button>
          </div>

          {selected.needsPick && (
            <div className="grid grid-cols-2 gap-3">
              {(["heads", "tails"] as const).map((side) => (
                <button
                  key={side}
                  onClick={() => setPick(side)}
                  className={`rounded-xl border px-4 py-3 text-sm font-semibold capitalize transition-all ${
                    pick === side
                      ? "border-amber-400/50 bg-amber-500/15 text-amber-300"
                      : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"
                  }`}
                >
                  {side}
                </button>
              ))}
            </div>
          )}

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-400">
              Bet Amount
            </label>
            <div className="flex gap-2">
              {QUICK.map((q) => (
                <button
                  key={q}
                  onClick={() => setAmount(String(q))}
                  className={`flex-1 rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                    amount === String(q)
                      ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-300"
                      : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  ${q}
                </button>
              ))}
            </div>
            <div className="relative mt-3">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                $
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pl-8 text-lg font-semibold text-white outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            onClick={handlePlay}
            disabled={playing}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-4 text-base font-bold text-white transition-colors hover:bg-indigo-500 disabled:opacity-60"
          >
            {playing && <Loader2 className="h-5 w-5 animate-spin" />}
            {playing ? "Rolling..." : `Play ${fmt(Number(amount) || 0)}`}
          </button>

          {error && (
            <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-center text-sm text-red-300">
              {error}
            </p>
          )}

          {result && (
            <div
              className={`rounded-2xl border p-6 text-center ${
                result.outcome === "won"
                  ? "border-emerald-500/30 bg-emerald-500/10"
                  : "border-red-500/30 bg-red-500/10"
              }`}
            >
              {result.outcome === "won" ? (
                <Trophy className="mx-auto h-10 w-10 text-emerald-400" />
              ) : (
                <Skull className="mx-auto h-10 w-10 text-red-400" />
              )}
              <p
                className={`mt-3 text-2xl font-bold ${
                  result.outcome === "won" ? "text-emerald-300" : "text-red-300"
                }`}
              >
                {result.outcome === "won"
                  ? `YOU WON ${fmt(result.payout)}`
                  : "NO LUCK THIS TIME"}
              </p>
              <p className="mt-2 text-sm text-slate-300">
                Roll:{" "}
                <span className="font-mono font-semibold text-white">
                  {result.roll}
                </span>
                {result.multiplier > 0 && (
                  <>
                    {" "}
                    • Multiplier:{" "}
                    <span className="font-semibold text-white">
                      {result.multiplier}×
                    </span>
                  </>
                )}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                New balance: {fmt(result.new_balance)}
              </p>
            </div>
          )}
        </GlassCard>
      )}
    </section>
  );
}

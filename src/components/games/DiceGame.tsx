"use client";

import { useState, useEffect } from "react";
import { playGame, type GameResult } from "@/lib/actions/game-actions";
import { Loader2, Dice5 } from "lucide-react";

export function DiceGame({
  balance,
  onResult,
}: {
  balance: number;
  onResult: (result: GameResult) => void;
}) {
  const [amount, setAmount] = useState("10");
  const [playing, setPlaying] = useState(false);
  const [displayNumber, setDisplayNumber] = useState(50);
  const [finalNumber, setFinalNumber] = useState<number | null>(null);
  const [shaking, setShaking] = useState(false);
  const [error, setError] = useState("");

  // Rapid number cycling during "rolling"
  useEffect(() => {
    if (!shaking) return;
    const interval = setInterval(() => {
      setDisplayNumber(Math.floor(Math.random() * 100) + 1);
    }, 60);
    return () => clearInterval(interval);
  }, [shaking]);

  const handlePlay = async () => {
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) { setError("Enter a valid amount."); return; }
    if (amt > balance) { setError("Insufficient balance."); return; }
    setError("");
    setFinalNumber(null);
    setPlaying(true);
    setShaking(true);

    const resultPromise = playGame("dice", amt);
    const minTime = new Promise((r) => setTimeout(r, 1500));

    const [result] = await Promise.all([resultPromise, minTime]);

    if (result.error) {
      setError(result.error);
      setShaking(false);
      setPlaying(false);
      return;
    }

    if (result.result) {
      setFinalNumber(result.result.roll);
      setDisplayNumber(result.result.roll);
      setTimeout(() => setShaking(false), 200);
      setTimeout(() => {
        onResult(result.result!);
        setPlaying(false);
      }, 600);
    }
  };

  const isWinning = finalNumber !== null && finalNumber > 50;
  const isLosing = finalNumber !== null && finalNumber <= 50;

  return (
    <div className="space-y-6">
      {/* Dice Display */}
      <div className="flex justify-center py-8">
        <div
          className={`relative flex h-48 w-48 items-center justify-center rounded-3xl border-4 shadow-2xl transition-all ${
            shaking
              ? "animate-dice-shake border-indigo-400/50 bg-gradient-to-br from-indigo-500/20 to-blue-600/20 shadow-indigo-500/50"
              : isWinning
                ? "border-emerald-400/50 bg-gradient-to-br from-emerald-500/20 to-green-600/20 shadow-emerald-500/50"
                : isLosing
                  ? "border-rose-400/50 bg-gradient-to-br from-rose-500/20 to-red-600/20 shadow-rose-500/50"
                  : "border-white/20 bg-gradient-to-br from-indigo-500/20 to-blue-600/20 shadow-indigo-500/30"
          }`}
        >
          <span
            className={`text-7xl font-black tabular-nums transition-colors ${
              isWinning ? "text-emerald-300" : isLosing ? "text-rose-300" : "text-white"
            }`}
          >
            {displayNumber}
          </span>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-300 backdrop-blur">
            {shaking ? "Rolling..." : finalNumber !== null ? (isWinning ? "WIN!" : "LOSE") : "Roll 51-100 to win"}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Win condition:</span>
          <span className="font-semibold text-emerald-300">Roll 51 - 100</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-slate-400">Payout:</span>
          <span className="font-semibold text-white">1.95×</span>
        </div>
      </div>

      {/* Bet Amount */}
      <BetControls amount={amount} setAmount={setAmount} disabled={playing} />

      {/* Play Button */}
      <button
        onClick={handlePlay}
        disabled={playing}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-4 text-base font-bold text-white shadow-lg shadow-indigo-500/30 transition-all hover:shadow-indigo-500/50 disabled:opacity-60"
      >
        {playing && <Loader2 className="h-5 w-5 animate-spin" />}
        {playing ? "Rolling..." : `Roll for $${Number(amount) || 0}`}
      </button>

      {error && <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-center text-sm text-red-300">{error}</p>}
    </div>
  );
}

type BetControlsProps = {
  amount: string;
  setAmount: (value: string) => void;
  disabled: boolean;
};

function BetControls({ amount, setAmount, disabled }: BetControlsProps) {
  const quick = [5, 10, 25, 100];
  return (
    <div>
      <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-400">Bet Amount</label>
      <div className="flex gap-2">
        {quick.map((q) => (
          <button
            key={q}
            onClick={() => setAmount(String(q))}
            disabled={disabled}
            className={`flex-1 rounded-lg border px-2 py-2 text-xs font-medium transition-colors disabled:opacity-50 ${
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
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
        <input
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={disabled}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pl-8 text-lg font-semibold text-white outline-none focus:border-indigo-500 disabled:opacity-50"
        />
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
import { playGame, type GameResult } from "@/lib/actions/game-actions";
import { Loader2, Coins } from "lucide-react";

export function CoinFlipGame({
  balance,
  onResult,
}: {
  balance: number;
  onResult: (result: GameResult) => void;
}) {
  const [pick, setPick] = useState<"heads" | "tails">("heads");
  const [amount, setAmount] = useState("10");
  const [playing, setPlaying] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [landedSide, setLandedSide] = useState<"heads" | "tails" | null>(null);
  const [error, setError] = useState("");

  const handlePlay = async () => {
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
    setLandedSide(null);
    setPlaying(true);
    setSpinning(true);

    // Start spinning animation immediately
    const resultPromise = playGame("coin_flip", amt, pick);

    // Minimum animation time for suspense
    const minTime = new Promise((r) => setTimeout(r, 1800));

    const [result] = await Promise.all([resultPromise, minTime]);

    if (result.error) {
      setError(result.error);
      setSpinning(false);
      setPlaying(false);
      return;
    }

    if (result.result) {
      // Determine which side the coin landed on
      const finalSide = result.result.roll === 0 ? "heads" : "tails";
      setLandedSide(finalSide);
      // Stop spinning after a brief moment to show the landing
      setTimeout(() => setSpinning(false), 400);
      setTimeout(() => {
        onResult(result.result!);
        setPlaying(false);
      }, 800);
    }
  };

  return (
    <div className="space-y-6">
      {/* 3D Coin */}
      <div className="flex justify-center py-8">
        <div className="relative" style={{ perspective: "1000px" }}>
          <div
            className={`relative h-48 w-48 rounded-full transition-transform ${
              spinning ? "animate-coin-spin" : ""
            }`}
            style={{
              transformStyle: "preserve-3d",
              // ✅ FIX: Remove transform constraint while spinning so CSS animation can take over
              transform: spinning
                ? undefined
                : landedSide === "tails"
                  ? "rotateY(180deg)"
                  : "rotateY(0deg)",
              transition: spinning
                ? "none"
                : "transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            {/* Heads (front) */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center rounded-full border-4 border-amber-300/50 bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 shadow-2xl shadow-amber-500/50"
              style={{ backfaceVisibility: "hidden" }}
            >
              <Coins className="h-20 w-20 text-amber-900/80" />
              <span className="mt-2 text-xs font-bold uppercase tracking-widest text-amber-900/80">
                Heads
              </span>
            </div>
            {/* Tails (back) */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center rounded-full border-4 border-slate-300/50 bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500 shadow-2xl shadow-slate-500/50"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <Coins className="h-20 w-20 text-slate-700/80" />
              <span className="mt-2 text-xs font-bold uppercase tracking-widest text-slate-700/80">
                Tails
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pick Side */}
      <div className="grid grid-cols-2 gap-3">
        {(["heads", "tails"] as const).map((side) => (
          <button
            key={side}
            onClick={() => setPick(side)}
            disabled={playing}
            className={`rounded-xl border px-4 py-3 text-sm font-bold uppercase tracking-wide transition-all disabled:opacity-50 ${
              pick === side
                ? "border-amber-400/50 bg-amber-500/15 text-amber-300 shadow-lg shadow-amber-500/20"
                : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"
            }`}
          >
            {side}
          </button>
        ))}
      </div>

      {/* Bet Amount */}
      <BetControls
        amount={amount}
        setAmount={setAmount}
        disabled={playing}
      />

      {/* Play Button */}
      <button
        onClick={handlePlay}
        disabled={playing}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 px-4 py-4 text-base font-bold text-white shadow-lg shadow-amber-500/30 transition-all hover:shadow-amber-500/50 disabled:opacity-60"
      >
        {playing && <Loader2 className="h-5 w-5 animate-spin" />}
        {playing ? "Flipping..." : `Flip for $${Number(amount) || 0}`}
      </button>

      {error && (
        <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-center text-sm text-red-300">
          {error}
        </p>
      )}
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
      <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-400">
        Bet Amount
      </label>
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
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          $
        </span>
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

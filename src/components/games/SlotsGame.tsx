"use client";

import { useState, useEffect } from "react";
import { playGame, type GameResult } from "@/lib/actions/game-actions";
import { Loader2, Sparkles } from "lucide-react";

const SYMBOLS = ["🍒", "🍋", "🔔", "⭐", "💎", "7️⃣"];

// Map multiplier tier to final symbols
function getSymbolsForMultiplier(multiplier: number): string[] {
  if (multiplier >= 20) return ["💎", "💎", "💎"]; // Jackpot
  if (multiplier >= 4) return ["⭐", "⭐", "⭐"];  // Mid win
  if (multiplier >= 2) return ["🔔", "🔔", "🔔"]; // Small win
  // Loss - random mix
  return [
    SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
    SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
    SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
  ];
}

export function SlotsGame({
  balance,
  onResult,
}: {
  balance: number;
  onResult: (result: GameResult) => void;
}) {
  const [amount, setAmount] = useState("10");
  const [playing, setPlaying] = useState(false);
  const [reels, setReels] = useState<string[]>(["🍒", "🍋", "🔔"]);
  const [spinningReels, setSpinningReels] = useState([false, false, false]);
  const [error, setError] = useState("");

  // Rapid symbol cycling for spinning reels
  useEffect(() => {
    const intervals = spinningReels.map((spinning, i) => {
      if (!spinning) return null;
      return setInterval(() => {
        setReels((prev) => {
          const next = [...prev];
          next[i] = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
          return next;
        });
      }, 80);
    });
    return () => intervals.forEach((int) => int && clearInterval(int));
  }, [spinningReels]);

  const handlePlay = async () => {
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) { setError("Enter a valid amount."); return; }
    if (amt > balance) { setError("Insufficient balance."); return; }
    setError("");
    setPlaying(true);
    setSpinningReels([true, true, true]);

    const resultPromise = playGame("slots", amt);
    const minTime = new Promise((r) => setTimeout(r, 2000));

    const [result] = await Promise.all([resultPromise, minTime]);

    if (result.error) {
      setError(result.error);
      setSpinningReels([false, false, false]);
      setPlaying(false);
      return;
    }

    if (result.result) {
      const finalSymbols = getSymbolsForMultiplier(result.result.multiplier);
      
      // Stop reels sequentially for suspense
      setTimeout(() => {
        setSpinningReels([false, true, true]);
        setReels((prev) => [finalSymbols[0], prev[1], prev[2]]);
      }, 300);
      
      setTimeout(() => {
        setSpinningReels([false, false, true]);
        setReels((prev) => [prev[0], finalSymbols[1], prev[2]]);
      }, 700);
      
      setTimeout(() => {
        setSpinningReels([false, false, false]);
        setReels(finalSymbols);
        setTimeout(() => {
          onResult(result.result!);
          setPlaying(false);
        }, 400);
      }, 1100);
    }
  };

  return (
    <div className="space-y-6">
      {/* Slot Reels */}
      <div className="flex justify-center py-8">
        <div className="flex gap-3 rounded-2xl border-2 border-fuchsia-400/30 bg-gradient-to-b from-fuchsia-900/40 to-purple-900/40 p-6 shadow-2xl shadow-fuchsia-500/30">
          {reels.map((symbol, i) => (
            <div
              key={i}
              className={`flex h-24 w-24 items-center justify-center rounded-xl border border-white/10 bg-black/40 text-6xl transition-all ${
                spinningReels[i] ? "animate-slots-blur" : ""
              }`}
            >
              {symbol}
            </div>
          ))}
        </div>
      </div>

      {/* Paytable */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-2xl">💎💎💎</div>
            <div className="mt-1 text-xs text-slate-400">Jackpot</div>
            <div className="font-bold text-fuchsia-300">20×</div>
          </div>
          <div>
            <div className="text-2xl">⭐⭐⭐</div>
            <div className="mt-1 text-xs text-slate-400">Big Win</div>
            <div className="font-bold text-purple-300">4×</div>
          </div>
          <div>
            <div className="text-2xl">🔔🔔🔔</div>
            <div className="mt-1 text-xs text-slate-400">Win</div>
            <div className="font-bold text-indigo-300">2×</div>
          </div>
        </div>
      </div>

      {/* Bet Amount */}
      <BetControls amount={amount} setAmount={setAmount} balance={balance} disabled={playing} />

      {/* Play Button */}
      <button
        onClick={handlePlay}
        disabled={playing}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 px-4 py-4 text-base font-bold text-white shadow-lg shadow-fuchsia-500/30 transition-all hover:shadow-fuchsia-500/50 disabled:opacity-60"
      >
        {playing && <Loader2 className="h-5 w-5 animate-spin" />}
        {playing ? "Spinning..." : `Spin for $${Number(amount) || 0}`}
      </button>

      {error && <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-center text-sm text-red-300">{error}</p>}
    </div>
  );
}

function BetControls({ amount, setAmount, balance, disabled }: any) {
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
                ? "border-fuchsia-500/50 bg-fuchsia-500/10 text-fuchsia-300"
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
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pl-8 text-lg font-semibold text-white outline-none focus:border-fuchsia-500 disabled:opacity-50"
        />
      </div>
    </div>
  );
}
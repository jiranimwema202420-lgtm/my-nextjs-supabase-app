export type Game = {
  id: "dice" | "coin_flip" | "slots";
  name: string;
  tagline: string;
  icon: "dice" | "coin" | "slots";
  gradient: string;
  edge: string;
  needsPick?: boolean;
};

export const GAMES: Game[] = [
  {
    id: "dice",
    name: "Lucky Dice",
    tagline: "Roll 51–100 to win 1.95×",
    icon: "dice",
    gradient: "from-indigo-600/40 to-blue-600/20",
    edge: "1.95× payout • 50% win chance",
  },
  {
    id: "coin_flip",
    name: "Coin Flip",
    tagline: "Call it in the air — 1.95×",
    icon: "coin",
    gradient: "from-amber-600/40 to-yellow-600/20",
    edge: "1.95× payout • 50% win chance",
    needsPick: true,
  },
  {
    id: "slots",
    name: "Neon Slots",
    tagline: "2×, 4× or a 20× jackpot",
    icon: "slots",
    gradient: "from-fuchsia-600/40 to-purple-600/20",
    edge: "Up to 20× payout • 20% win chance",
  },
];

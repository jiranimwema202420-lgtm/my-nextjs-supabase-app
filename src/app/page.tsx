import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden font-sans selection:bg-indigo-500 selection:text-white">
      {/* Background Ambient Glow Accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/20 to-emerald-500/10 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-emerald-500/10 blur-[150px] pointer-events-none rounded-full" />

      {/* Navigation Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between relative z-10 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/25">
            AP
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            ApexPulse{" "}
            <span className="text-xs font-normal text-indigo-400 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
              FinTech
            </span>
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm text-slate-400 font-medium">
          <a href="#features" className="hover:text-white transition-colors">
            Features
          </a>
          <a href="#security" className="hover:text-white transition-colors">
            Security & AML
          </a>
          <a href="#portals" className="hover:text-white transition-colors">
            Access Portals
          </a>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-4 py-2"
          >
            Sign In
          </Link>
          <Link
            href="/player"
            className="text-sm font-medium px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
          >
            Launch Player App
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 pt-16 pb-24 relative z-10 flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-300 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Next-Gen iGaming & Payment Infrastructure
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Seamless Wagers. <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-400">
              Institutional Compliance.
            </span>
          </h1>

          <p className="text-base md:text-lg text-slate-400 font-normal leading-relaxed">
            The high-throughput gaming platform powering real-time wagers,
            instant multi-currency player wallets, and automated risk
            enforcement for operators.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/player"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold shadow-xl shadow-indigo-600/25 transition-all text-center"
            >
              Enter Player Dashboard
            </Link>
            <a
              href="#portals"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-medium backdrop-blur-xl transition-all text-center"
            >
              Operator & Staff Access
            </a>
          </div>
        </div>

        {/* Separated Role Portals Section */}
        <section id="portals" className="mt-28 space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Select Your Access Portal
            </h2>
            <p className="text-slate-400 text-sm">
              Role-separated environments protected by row-level security and
              mandatory authentication.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Player Track Card */}
            <div className="group relative p-8 rounded-3xl bg-slate-900/60 border border-indigo-500/20 hover:border-indigo-500/50 backdrop-blur-xl transition-all shadow-2xl flex flex-col justify-between overflow-hidden">
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all" />

              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 text-indigo-400">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="inline-block px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold mb-3">
                  PUBLIC PORTAL
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Player Workspace
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Access your personal gaming wallet, track wager analytics,
                  process sub-second deposits, and review active bet receipts.
                </p>
              </div>

              <Link
                href="/player"
                className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-all text-center flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-indigo-600/20"
              >
                <span>Access Player Wallet</span>
                <svg
                  className="w-4 h-4 transition-transform group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </Link>
            </div>

            {/* Staff / Back-Office Track Card */}
            <div className="group relative p-8 rounded-3xl bg-slate-900/60 border border-purple-500/20 hover:border-purple-500/50 backdrop-blur-xl transition-all shadow-2xl flex flex-col justify-between overflow-hidden">
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all" />

              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6 text-purple-400">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <div className="inline-block px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold mb-3">
                  RESTRICTED STAFF ACCESS
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Back-Office & Admin Portal
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  System administration, GGR analytics, operator audit logs, and
                  AML compliance monitoring workspace.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/admin"
                  className="py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-sm transition-all text-center"
                >
                  Admin Hub
                </Link>
                <Link
                  href="/compliance"
                  className="py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-sm transition-all text-center"
                >
                  Compliance / AML
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 py-8 px-6 relative z-10 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© 2026 ApexPulse FinTech Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link
              href="/login"
              className="hover:text-slate-400 transition-colors"
            >
              Staff Login
            </Link>
            <span>•</span>
            <span className="text-slate-600">Encrypted with Supabase RLS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

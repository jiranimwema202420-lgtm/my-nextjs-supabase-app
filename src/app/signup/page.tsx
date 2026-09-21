"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Turnstile } from "@marsidev/react-turnstile";

import { createClient } from "@/lib/supabase/client";
import { GlassCard } from "@/components/ui/GlassCard";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (!captchaToken) {
      setError("Please complete the security check.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setCaptchaToken(null);
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            // 🛡️ SECURITY: Hardcode role to player on the client
            role: "player", 
            full_name: email.split('@')[0],
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          captchaToken,
        },
      });

      if (signUpError) throw signUpError;

      if (data.session) {
        router.push("/player");
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setCaptchaToken(null);
      setError(err instanceof Error ? err.message : "Sign up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <GlassCard className="w-full max-w-md space-y-4 text-center">
          <h1 className="text-2xl font-semibold">Check your email</h1>
          <p className="text-sm text-slate-300">
            We sent a confirmation link to <span className="text-white">{email}</span>.
          </p>
          <Link href="/login" className="text-sm text-blue-400 hover:text-blue-300">Back to login</Link>
        </GlassCard>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <GlassCard className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Create Account</h1>
          <p className="text-sm text-slate-400 mt-2">Join as a Player</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 outline-none text-white placeholder-slate-400" placeholder="Email" autoComplete="email" />
          <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 outline-none text-white placeholder-slate-400" placeholder="Password" autoComplete="new-password" />
          <input type="password" required minLength={6} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 outline-none text-white placeholder-slate-400" placeholder="Confirm Password" autoComplete="new-password" />

          <div className="flex justify-center py-2">
            <Turnstile
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
              onSuccess={(token) => { setCaptchaToken(token); setError(null); }}
              onExpire={() => setCaptchaToken(null)}
              onError={() => { setCaptchaToken(null); setError("Security verification failed."); }}
            />
          </div>

          <button type="submit" disabled={loading || !captchaToken} className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 text-white transition-colors">
            {loading ? "Creating..." : "Sign up"}
          </button>
        </form>

        {error && <p role="alert" className="text-center text-sm text-red-300">{error}</p>}

        <p className="text-center text-sm text-slate-400">
          Already have an account? <Link href="/login" className="text-blue-400 hover:text-blue-300">Sign in</Link>
        </p>
      </GlassCard>
    </main>
  );
}

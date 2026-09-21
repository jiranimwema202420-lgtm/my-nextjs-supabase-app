"use client";

import { useState, useTransition } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Shield, AlertTriangle, Clock, Save, Loader2 } from "lucide-react";

export function SecurityAndPlatformSettings() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [config, setConfig] = useState({
    maintenanceMode: false,
    sessionTimeoutMinutes: 30,
    enforceTurnstile: true,
    maxLoginAttempts: 5,
  });

  const handleSave = () => {
    setMessage(null);
    startTransition(async () => {
      // TODO: Replace with actual Server Action to update system_config table
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setMessage({
        type: "success",
        text: "Platform settings updated successfully.",
      });
    });
  };

  return (
    <GlassCard className="space-y-6">
      <div className="flex items-center gap-3 text-slate-300 border-b border-white/10 pb-4">
        <Shield className="h-5 w-5 text-indigo-400" />
        <h2 className="text-lg font-semibold">
          Security & Platform Configuration
        </h2>
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg text-sm text-center ${message.type === "success" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}
        >
          {message.text}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-medium text-slate-300">
                Maintenance Mode
              </span>
            </div>
            <button
              onClick={() =>
                setConfig((prev) => ({
                  ...prev,
                  maintenanceMode: !prev.maintenanceMode,
                }))
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${config.maintenanceMode ? "bg-amber-500" : "bg-white/10"}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.maintenanceMode ? "translate-x-6" : "translate-x-1"}`}
              />
            </button>
          </div>
          <p className="text-xs text-slate-500">
            {config.maintenanceMode
              ? "System is currently hidden from players."
              : "System is live and accessible."}
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-indigo-400" />
            <span className="text-sm font-medium text-slate-300">
              Session Timeout (Minutes)
            </span>
          </div>
          <input
            type="number"
            value={config.sessionTimeoutMinutes}
            onChange={(e) =>
              setConfig((prev) => ({
                ...prev,
                sessionTimeoutMinutes: parseInt(e.target.value) || 30,
              }))
            }
            className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm text-white outline-none focus:border-indigo-500"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-400" />
              <span className="text-sm font-medium text-slate-300">
                Enforce Turnstile Captcha
              </span>
            </div>
            <button
              onClick={() =>
                setConfig((prev) => ({
                  ...prev,
                  enforceTurnstile: !prev.enforceTurnstile,
                }))
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${config.enforceTurnstile ? "bg-green-500" : "bg-white/10"}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.enforceTurnstile ? "translate-x-6" : "translate-x-1"}`}
              />
            </button>
          </div>
          <p className="text-xs text-slate-500">
            Require bot protection on all auth forms.
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <span className="text-sm font-medium text-slate-300">
              Max Failed Login Attempts
            </span>
          </div>
          <input
            type="number"
            value={config.maxLoginAttempts}
            onChange={(e) =>
              setConfig((prev) => ({
                ...prev,
                maxLoginAttempts: parseInt(e.target.value) || 5,
              }))
            }
            className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm text-white outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="pt-4 border-t border-white/10 flex justify-end">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60 transition-colors"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isPending ? "Saving..." : "Save Configuration"}
        </button>
      </div>
    </GlassCard>
  );
}

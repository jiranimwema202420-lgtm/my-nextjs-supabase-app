"use client";

import { useState, useMemo, useTransition } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  reviewKycDocument,
  reviewTransactionFlag,
} from "@/lib/actions/compliance-actions";
import {
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  DollarSign,
  Loader2,
  Eye,
  Filter,
  MessageSquare,
  X,
  Clock,
  Globe,
} from "lucide-react";

type RiskLevel = "High" | "Medium" | "Low";

type KycRecord = {
  id: string;
  document_type: string;
  country: string | null;
  risk_level: RiskLevel | null;
  status: string;
  created_at: string;
  document_url: string | null;
  profiles?: {
    email?: string | null;
  } | null;
};

type FlaggedTransactionRecord = {
  id: string;
  amount: number | string;
  reference_id: string | null;
  risk_level: RiskLevel | null;
  flag_reason: string | null;
  created_at: string;
  profiles?: {
    email?: string | null;
  } | null;
};

type ReviewListItem = {
  id: string;
  user: string;
  riskLevel: RiskLevel;
  submitted: string;
  status?: string;
  txHash?: string;
  document?: string;
  country?: string;
  docUrl?: string;
  amount?: string;
  reason?: string;
};

// Helper to format dates like "2 hrs ago"
function timeAgo(dateString: string) {
  const seconds = Math.floor(
    (new Date().getTime() - new Date(dateString).getTime()) / 1000,
  );
  if (seconds < 60) return `${seconds} sec ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hrs ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}

export function ComplianceAndApprovals({
  initialKycDocs,
  initialFlaggedTxs,
}: {
  initialKycDocs: KycRecord[];
  initialFlaggedTxs: FlaggedTransactionRecord[];
}) {
  const [kycList, setKycList] = useState<KycRecord[]>(initialKycDocs);
  const [txList, setTxList] =
    useState<FlaggedTransactionRecord[]>(initialFlaggedTxs);

  const [activeTab, setActiveTab] = useState<"kyc" | "transactions">("kyc");
  const [riskFilter, setRiskFilter] = useState<"All" | RiskLevel>("All");
  const [isPending, startTransition] = useTransition();
  const [selectedItem, setSelectedItem] = useState<ReviewListItem | null>(null);
  const [auditNote, setAuditNote] = useState("");
  const [error, setError] = useState("");

  // Map DB data to UI format
  const mappedKyc: ReviewListItem[] = useMemo(
    () =>
      kycList.map((d) => ({
        id: d.id,
        user: d.profiles?.email || "Unknown",
        document: d.document_type,
        country: d.country || "Unknown",
        riskLevel: (d.risk_level || "Medium") as RiskLevel,
        status: d.status,
        submitted: timeAgo(d.created_at),
        docUrl: d.document_url || "#",
      })),
    [kycList],
  );

  const mappedTx: ReviewListItem[] = useMemo(
    () =>
      txList.map((t) => ({
        id: t.id,
        user: t.profiles?.email || "Unknown",
        amount: `$${Number(t.amount).toFixed(2)}`,
        txHash: t.reference_id ? t.reference_id.slice(0, 8) + "..." : "N/A",
        riskLevel: (t.risk_level || "Medium") as RiskLevel,
        reason: t.flag_reason || "Flagged by system",
        submitted: timeAgo(t.created_at),
      })),
    [txList],
  );

  const filteredKyc = useMemo(
    () =>
      riskFilter === "All"
        ? mappedKyc
        : mappedKyc.filter((k) => k.riskLevel === riskFilter),
    [mappedKyc, riskFilter],
  );
  const filteredTx = useMemo(
    () =>
      riskFilter === "All"
        ? mappedTx
        : mappedTx.filter((t) => t.riskLevel === riskFilter),
    [mappedTx, riskFilter],
  );

  const handleAction = async (id: string, action: "approve" | "reject") => {
    if (!auditNote.trim()) {
      setError("Please add an audit note.");
      return;
    }
    setError("");

    startTransition(async () => {
      const result =
        activeTab === "kyc"
          ? await reviewKycDocument(id, action, auditNote)
          : await reviewTransactionFlag(id, action, auditNote);

      if (result.success) {
        // Optimistically remove from UI
        if (activeTab === "kyc")
          setKycList((prev) => prev.filter((k) => k.id !== id));
        else setTxList((prev) => prev.filter((t) => t.id !== id));
        setSelectedItem(null);
        setAuditNote("");
      } else {
        setError(result.error || "Failed to process.");
      }
    });
  };

  const getRiskColor = (risk: RiskLevel) => {
    if (risk === "High") return "bg-red-500/10 text-red-400 border-red-500/20";
    if (risk === "Medium")
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    return "bg-green-500/10 text-green-400 border-green-500/20";
  };

  return (
    <GlassCard className="space-y-6">
      {/* Tabs */}
      <div className="flex border-b border-white/10">
        <button
          onClick={() => {
            setActiveTab("kyc");
            setRiskFilter("All");
          }}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === "kyc" ? "border-indigo-500 text-indigo-400" : "border-transparent text-slate-400 hover:text-white"}`}
        >
          <FileText className="h-4 w-4" /> KYC Reviews{" "}
          <span className="ml-1 rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs text-indigo-300">
            {mappedKyc.length}
          </span>
        </button>
        <button
          onClick={() => {
            setActiveTab("transactions");
            setRiskFilter("All");
          }}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === "transactions" ? "border-amber-500 text-amber-400" : "border-transparent text-slate-400 hover:text-white"}`}
        >
          <AlertTriangle className="h-4 w-4" /> Transaction Flags{" "}
          <span className="ml-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-300">
            {mappedTx.length}
          </span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-slate-500" />
        {(["All", "High", "Medium", "Low"] as const).map((level) => (
          <button
            key={level}
            onClick={() => setRiskFilter(level)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${riskFilter === level ? "bg-white/10 text-white border border-white/20" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
          >
            {level} Risk
          </button>
        ))}
      </div>

      {/* Lists */}
      <div className="space-y-3">
        {(activeTab === "kyc" ? filteredKyc : filteredTx).length === 0 ? (
          <p className="text-center text-sm text-slate-500 py-8">
            No items match this filter.
          </p>
        ) : (
          (activeTab === "kyc" ? filteredKyc : filteredTx).map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 cursor-pointer hover:bg-white/10 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${activeTab === "kyc" ? "bg-blue-500/10" : item.riskLevel === "High" ? "bg-red-500/10" : "bg-amber-500/10"}`}
                >
                  {activeTab === "kyc" ? (
                    <FileText className="h-5 w-5 text-blue-400" />
                  ) : (
                    <DollarSign
                      className={`h-5 w-5 ${item.riskLevel === "High" ? "text-red-400" : "text-amber-400"}`}
                    />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-white">{item.user}</p>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getRiskColor(item.riskLevel)}`}
                    >
                      {item.riskLevel.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                    {activeTab === "kyc" ? (
                      <>
                        <Globe className="h-3 w-3" /> {item.country} •{" "}
                        {item.document}
                      </>
                    ) : (
                      <>
                        Amount: {item.amount} • {item.reason}
                      </>
                    )}{" "}
                    • <Clock className="h-3 w-3" /> {item.submitted}
                  </p>
                </div>
              </div>
              <Eye className="h-4 w-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900/95 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-semibold text-white">
                Review Details
              </h3>
              <button
                onClick={() => {
                  setSelectedItem(null);
                  setAuditNote("");
                  setError("");
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2 text-sm">
              <p>
                <span className="text-slate-400">User:</span>{" "}
                <span className="text-white font-medium">
                  {selectedItem.user}
                </span>
              </p>
              {activeTab === "kyc" ? (
                <>
                  <p>
                    <span className="text-slate-400">Document:</span>{" "}
                    <span className="text-white">{selectedItem.document}</span>
                  </p>
                  <p>
                    <span className="text-slate-400">Country:</span>{" "}
                    <span className="text-white">{selectedItem.country}</span>
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <span className="text-slate-400">Amount:</span>{" "}
                    <span className="text-white font-medium">
                      {selectedItem.amount}
                    </span>
                  </p>
                  <p>
                    <span className="text-slate-400">Reason:</span>{" "}
                    <span className="text-white">{selectedItem.reason}</span>
                  </p>
                </>
              )}
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-300">
                <MessageSquare className="h-3.5 w-3.5" /> Mandatory Audit Note
              </label>
              <textarea
                value={auditNote}
                onChange={(e) => setAuditNote(e.target.value)}
                placeholder="e.g., Verified against national database."
                className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 min-h-[80px] resize-none"
              />
              {error && <p className="text-xs text-red-400">{error}</p>}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => handleAction(selectedItem.id, "reject")}
                disabled={isPending}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/20 disabled:opacity-50"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}{" "}
                Reject
              </button>
              <button
                onClick={() => handleAction(selectedItem.id, "approve")}
                disabled={isPending}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 py-2.5 text-sm font-medium text-green-400 hover:bg-green-500/20 disabled:opacity-50"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}{" "}
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </GlassCard>
  );
}

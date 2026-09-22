"use client";

import { useState, useMemo } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Shield,
  DollarSign,
  Loader2,
  Eye,
  Filter,
  MessageSquare,
  X,
  Clock,
  Globe,
} from "lucide-react";

// --- Enhanced Mock Data ---
type RiskLevel = "High" | "Medium" | "Low";

const MOCK_KYC_REQUESTS = [
  {
    id: "kyc-1",
    user: "john.doe@example.com",
    document: "Passport",
    country: "United Kingdom",
    riskLevel: "High" as RiskLevel,
    status: "Pending",
    submitted: "2 hrs ago",
    docUrl: "#",
  },
  {
    id: "kyc-2",
    user: "jane.smith@example.com",
    document: "Driver's License",
    country: "United States",
    riskLevel: "Medium" as RiskLevel,
    status: "Pending",
    submitted: "5 hrs ago",
    docUrl: "#",
  },
  {
    id: "kyc-3",
    user: "carlos.ruiz@example.com",
    document: "National ID",
    country: "Spain",
    riskLevel: "Low" as RiskLevel,
    status: "Pending",
    submitted: "1 day ago",
    docUrl: "#",
  },
];

const MOCK_TRANSACTION_FLAGS = [
  {
    id: "tx-1",
    user: "high.roller@example.com",
    amount: "$15,000.00",
    txHash: "0x7a8b9c...1d2e3f",
    riskLevel: "High" as RiskLevel,
    reason: "Unusual deposit size (exceeds 24h average by 400%)",
    submitted: "1 hr ago",
  },
  {
    id: "tx-2",
    user: "new.player@example.com",
    amount: "$500.00",
    txHash: "0x4f5g6h...7i8j9k",
    riskLevel: "Medium" as RiskLevel,
    reason: "First time deposit from high-risk jurisdiction",
    submitted: "3 hrs ago",
  },
];

export function ComplianceAndApprovals() {
  const [activeTab, setActiveTab] = useState<"kyc" | "transactions">("kyc");
  const [riskFilter, setRiskFilter] = useState<"All" | RiskLevel>("All");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [auditNote, setAuditNote] = useState("");

  // Filter logic
  const filteredKyc = useMemo(() => {
    if (riskFilter === "All") return MOCK_KYC_REQUESTS;
    return MOCK_KYC_REQUESTS.filter((k) => k.riskLevel === riskFilter);
  }, [riskFilter]);

  const filteredTx = useMemo(() => {
    if (riskFilter === "All") return MOCK_TRANSACTION_FLAGS;
    return MOCK_TRANSACTION_FLAGS.filter((t) => t.riskLevel === riskFilter);
  }, [riskFilter]);

  const handleAction = async (
    id: string,
    action: "approve" | "reject" | "flag",
  ) => {
    if (!auditNote.trim()) {
      alert("Please add an audit note before taking action.");
      return;
    }

    setProcessingId(id);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log(`${action.toUpperCase()}D: ${id} | Note: ${auditNote}`);

    setProcessingId(null);
    setSelectedItem(null);
    setAuditNote("");
  };

  const getRiskColor = (risk: RiskLevel) => {
    switch (risk) {
      case "High":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "Medium":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "Low":
        return "bg-green-500/10 text-green-400 border-green-500/20";
    }
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
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "kyc"
              ? "border-indigo-500 text-indigo-400"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <FileText className="h-4 w-4" />
          KYC Document Reviews
          <span className="ml-1 rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs text-indigo-300">
            {MOCK_KYC_REQUESTS.length}
          </span>
        </button>
        <button
          onClick={() => {
            setActiveTab("transactions");
            setRiskFilter("All");
          }}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "transactions"
              ? "border-amber-500 text-amber-400"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <AlertTriangle className="h-4 w-4" />
          Transaction Flags
          <span className="ml-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-300">
            {MOCK_TRANSACTION_FLAGS.length}
          </span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-slate-500" />
        {(["All", "High", "Medium", "Low"] as const).map((level) => (
          <button
            key={level}
            onClick={() => setRiskFilter(level)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              riskFilter === level
                ? "bg-white/10 text-white border border-white/20"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {level} Risk
          </button>
        ))}
      </div>

      {/* KYC Tab Content */}
      {activeTab === "kyc" && (
        <div className="space-y-3">
          {filteredKyc.length === 0 ? (
            <p className="text-center text-sm text-slate-500 py-8">
              No pending KYC reviews for this filter.
            </p>
          ) : (
            filteredKyc.map((req) => (
              <div
                key={req.id}
                onClick={() => setSelectedItem(req)}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 cursor-pointer hover:bg-white/10 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
                    <FileText className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-white">{req.user}</p>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getRiskColor(req.riskLevel)}`}
                      >
                        {req.riskLevel.toUpperCase()} RISK
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                      <Globe className="h-3 w-3" /> {req.country} •{" "}
                      {req.document} • <Clock className="h-3 w-3" />{" "}
                      {req.submitted}
                    </p>
                  </div>
                </div>
                <Eye className="h-4 w-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
              </div>
            ))
          )}
        </div>
      )}

      {/* Transactions Tab Content */}
      {activeTab === "transactions" && (
        <div className="space-y-3">
          {filteredTx.length === 0 ? (
            <p className="text-center text-sm text-slate-500 py-8">
              No flagged transactions for this filter.
            </p>
          ) : (
            filteredTx.map((tx) => (
              <div
                key={tx.id}
                onClick={() => setSelectedItem(tx)}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 cursor-pointer hover:bg-white/10 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${tx.riskLevel === "High" ? "bg-red-500/10" : "bg-amber-500/10"}`}
                  >
                    <DollarSign
                      className={`h-5 w-5 ${tx.riskLevel === "High" ? "text-red-400" : "text-amber-400"}`}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-white">{tx.user}</p>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getRiskColor(tx.riskLevel)}`}
                      >
                        {tx.riskLevel.toUpperCase()} RISK
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Amount:{" "}
                      <span className="text-white font-medium">
                        {tx.amount}
                      </span>{" "}
                      • {tx.reason}
                    </p>
                  </div>
                </div>
                <Eye className="h-4 w-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
              </div>
            ))
          )}
        </div>
      )}

      {/* Detail & Action Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900/95 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                {activeTab === "kyc" ? (
                  <FileText className="h-5 w-5 text-blue-400" />
                ) : (
                  <DollarSign className="h-5 w-5 text-amber-400" />
                )}
                Review Details
              </h3>
              <button
                onClick={() => {
                  setSelectedItem(null);
                  setAuditNote("");
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">User:</span>
                <span className="text-white font-medium">
                  {selectedItem.user}
                </span>
              </div>
              {activeTab === "kyc" ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Document:</span>
                    <span className="text-white">{selectedItem.document}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Country:</span>
                    <span className="text-white">{selectedItem.country}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Amount:</span>
                    <span className="text-white font-medium">
                      {selectedItem.amount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tx Hash:</span>
                    <span className="text-white font-mono text-xs">
                      {selectedItem.txHash}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Reason:</span>
                    <span className="text-white text-right max-w-[200px]">
                      {selectedItem.reason}
                    </span>
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">Risk Level:</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getRiskColor(selectedItem.riskLevel)}`}
                >
                  {selectedItem.riskLevel.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Audit Notes */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-300">
                <MessageSquare className="h-3.5 w-3.5" /> Mandatory Audit Note
              </label>
              <textarea
                value={auditNote}
                onChange={(e) => setAuditNote(e.target.value)}
                placeholder="e.g., Document verified against national database. No discrepancies found."
                className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-indigo-500 min-h-[80px] resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => handleAction(selectedItem.id, "reject")}
                disabled={processingId === selectedItem.id}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/20 disabled:opacity-50"
              >
                {processingId === selectedItem.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                Reject
              </button>
              <button
                onClick={() => handleAction(selectedItem.id, "approve")}
                disabled={processingId === selectedItem.id}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 py-2.5 text-sm font-medium text-green-400 hover:bg-green-500/20 disabled:opacity-50"
              >
                {processingId === selectedItem.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </GlassCard>
  );
}

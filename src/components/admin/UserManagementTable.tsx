"use client";

import { useState, useTransition, useMemo } from "react";
import { updateUserRole, toggleUserActive } from "@/lib/actions/admin-actions";
import { ROLES, type AppRole } from "@/lib/rbac/roles";
import { GlassCard } from "@/components/ui/GlassCard";
import { Search, UserX, UserCheck, ShieldAlert } from "lucide-react";

type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: AppRole;
  is_active: boolean;
  created_at: string;
};

export function UserManagementTable({
  initialUsers,
}: {
  initialUsers: Profile[];
}) {
  const [users, setUsers] = useState<Profile[]>(initialUsers);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    const lowerQuery = searchQuery.toLowerCase();
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(lowerQuery) ||
        (u.full_name && u.full_name.toLowerCase().includes(lowerQuery)),
    );
  }, [users, searchQuery]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setFeedback(null);
    startTransition(async () => {
      const result = await updateUserRole(userId, newRole);
      if (result.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId ? { ...u, role: newRole as AppRole } : u,
          ),
        );
        setFeedback({ message: "Role updated successfully.", type: "success" });
      } else {
        setFeedback({
          message: result.error || "Failed to update role.",
          type: "error",
        });
      }
    });
  };

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    setFeedback(null);
    startTransition(async () => {
      const result = await toggleUserActive(userId, !currentStatus);
      if (result.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId ? { ...u, is_active: !currentStatus } : u,
          ),
        );
        setFeedback({
          message: `User ${!currentStatus ? "activated" : "deactivated"}.`,
          type: "success",
        });
      } else {
        setFeedback({
          message: result.error || "Failed to update status.",
          type: "error",
        });
      }
    });
  };

  return (
    <GlassCard className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-indigo-400" />
          User Management
        </h2>
        {feedback && (
          <div
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${feedback.type === "success" ? "bg-green-500/20 text-green-300 border border-green-500/20" : "bg-red-500/20 text-red-300 border border-red-500/20"}`}
          >
            {feedback.message}
          </div>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by email or name..."
          className="w-full sm:w-80 rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-white/5 text-xs uppercase text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 bg-white/[0.02]">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="transition-colors hover:bg-white/5">
                <td className="px-4 py-3">
                  <div className="font-medium text-white">
                    {user.full_name || "Unnamed User"}
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    {user.email}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    disabled={isPending}
                    className="rounded-lg border border-white/10 bg-slate-900 px-2 py-1.5 text-xs text-white outline-none focus:border-indigo-500 disabled:opacity-50 cursor-pointer"
                  >
                    {ROLES.map((role) => (
                      <option
                        key={role}
                        value={role}
                        className="bg-slate-800 text-white"
                      >
                        {role.replace("_", " ").toUpperCase()}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${user.is_active ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}
                  >
                    {user.is_active ? (
                      <UserCheck className="h-3 w-3" />
                    ) : (
                      <UserX className="h-3 w-3" />
                    )}
                    {user.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleToggleActive(user.id, user.is_active)}
                    disabled={isPending}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all disabled:opacity-50 ${user.is_active ? "border border-red-500/30 text-red-400 hover:bg-red-500/10" : "border border-green-500/30 text-green-400 hover:bg-green-500/10"}`}
                  >
                    {isPending
                      ? "Processing..."
                      : user.is_active
                        ? "Deactivate"
                        : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-500">
                    <Search className="h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm font-medium">
                      {searchQuery
                        ? "No users match your search."
                        : "No users found."}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}

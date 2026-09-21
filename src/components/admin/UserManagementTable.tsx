"use client";

import { useState, useTransition } from "react";
import { updateUserRole, toggleUserActive, type AdminActionResult } from "@/lib/actions/admin-actions";
import { ROLES, type AppRole } from "@/lib/rbac/roles";
import { GlassCard } from "@/components/ui/GlassCard";

type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: AppRole;
  is_active: boolean;
  created_at: string;
};

export function UserManagementTable({ initialUsers }: { initialUsers: Profile[] }) {
  const [users, setUsers] = useState<Profile[]>(initialUsers);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setFeedback(null);
    startTransition(async () => {
      const result = await updateUserRole(userId, newRole);
      if (result.success) {
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole as AppRole } : u)));
        setFeedback({ message: "Role updated successfully.", type: "success" });
      } else {
        setFeedback({ message: result.error || "Failed to update role.", type: "error" });
      }
    });
  };

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    setFeedback(null);
    startTransition(async () => {
      const result = await toggleUserActive(userId, !currentStatus);
      if (result.success) {
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, is_active: !currentStatus } : u)));
        setFeedback({ message: `User ${!currentStatus ? "activated" : "deactivated"}.`, type: "success" });
      } else {
        setFeedback({ message: result.error || "Failed to update status.", type: "error" });
      }
    });
  };

  return (
    <GlassCard className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">User Management</h2>
        {feedback && (
          <div
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              feedback.type === "success" ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"
            }`}
          >
            {feedback.message}
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="border-b border-white/10 text-xs uppercase text-slate-400">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map((user) => (
              <tr key={user.id} className="transition-colors hover:bg-white/5">
                <td className="px-4 py-3">
                  <div className="font-medium text-white">{user.full_name || "Unnamed"}</div>
                  <div className="text-xs text-slate-400">{user.email}</div>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    disabled={isPending}
                    className="rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-white outline-none focus:border-white/30 disabled:opacity-50"
                  >
                    {ROLES.map((role) => (
                      <option key={role} value={role} className="bg-slate-800 text-white">
                        {role.replace("_", " ").toUpperCase()}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      user.is_active ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"
                    }`}
                  >
                    {user.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleToggleActive(user.id, user.is_active)}
                    disabled={isPending}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
                      user.is_active
                        ? "border border-red-500/30 text-red-300 hover:bg-red-500/10"
                        : "border border-green-500/30 text-green-300 hover:bg-green-500/10"
                    }`}
                  >
                    {isPending ? "Processing..." : user.is_active ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}

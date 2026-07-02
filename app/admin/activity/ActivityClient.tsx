"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import LogoutButton from "@/app/components/LogoutButton";

type Log = {
  id: string;
  actionType: string;
  description: string;
  createdAt: string | Date;
  user: string;
};

const LABELS: Record<string, { label: string; cls: string }> = {
  shift_close: { label: "Shift Close", cls: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  reset_transactions: { label: "Reset", cls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  approval_approve: { label: "Approved", cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  approval_reject: { label: "Rejected", cls: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
  STOCK_AUDIT: { label: "Stock Audit", cls: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
};

function meta(t: string) {
  return LABELS[t] || { label: t, cls: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300" };
}

export default function ActivityClient({ logs }: { logs: Log[] }) {
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");

  const types = useMemo(() => Array.from(new Set(logs.map((l) => l.actionType))), [logs]);

  const filtered = useMemo(
    () =>
      logs.filter(
        (l) =>
          (type === "all" || l.actionType === type) &&
          (q.trim() === "" ||
            l.description.toLowerCase().includes(q.toLowerCase()) ||
            l.user.toLowerCase().includes(q.toLowerCase()))
      ),
    [logs, q, type]
  );

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 p-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Activity Log</h1>
          <div className="flex gap-4 text-sm mt-2">
            <Link href="/admin/dashboard" className="text-amber-600 hover:underline">← Back to Dashboard</Link>
          </div>
        </div>
        <LogoutButton />
      </header>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by description or staff…"
          className="flex-1 px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 outline-none focus:border-amber-500"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-bold outline-none"
        >
          <option value="all">All actions</option>
          {types.map((t) => (
            <option key={t} value={t}>{meta(t).label}</option>
          ))}
        </select>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-xs uppercase font-semibold text-zinc-500">
              <tr>
                <th className="px-4 py-3 whitespace-nowrap">When</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Staff</th>
                <th className="px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filtered.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-10 text-center text-zinc-500">No activity found.</td></tr>
              ) : (
                filtered.map((l) => {
                  const m = meta(l.actionType);
                  return (
                    <tr key={l.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 align-top">
                      <td className="px-4 py-3 text-zinc-500 whitespace-nowrap">
                        {new Date(l.createdAt).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ${m.cls}`}>{m.label}</span>
                      </td>
                      <td className="px-4 py-3 font-medium text-zinc-800 dark:text-zinc-200 whitespace-nowrap">{l.user}</td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{l.description}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-zinc-400 mt-4">Showing the {logs.length} most recent events.</p>
    </div>
  );
}

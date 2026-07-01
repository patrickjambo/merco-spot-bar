"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type PendingSale = {
  id: string;
  quantity: number;
  saleType: string;
  totalAmount: number;
  createdAt: string | Date;
  flagReason?: string | null;
  product: { name: string; stockUnits: number; packetSize: number };
  manager: { fullName: string };
};

export default function ApprovalsPanel({ pending }: { pending: PendingSale[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  const review = async (saleId: string, action: "approve" | "reject") => {
    setBusyId(saleId);
    try {
      const res = await fetch("/api/admin/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ saleId, action }),
      });
      const json = await res.json();
      if (res.ok) {
        // Soft refresh so the panel and the rest of the dashboard update in place.
        router.refresh();
      } else {
        alert(`❌ ${json.error || "Failed to process"}`);
        setBusyId(null);
      }
    } catch {
      alert("System error while processing the approval.");
      setBusyId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border-2 border-amber-400 dark:border-amber-500/60">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-amber-600 dark:text-amber-500 flex items-center gap-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Sales Awaiting Approval
        </h2>
        <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-bold px-2 py-1 rounded-full">
          {pending.length} pending
        </span>
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        {pending.map((s) => {
          const units = s.saleType === "packet" ? s.quantity * s.product.packetSize : s.quantity;
          const enoughStock = s.product.stockUnits >= units;
          const busy = busyId === s.id;
          return (
            <div key={s.id} className="p-3 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-amber-50/50 dark:bg-amber-900/10">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                  <p className="font-bold text-sm text-zinc-900 dark:text-white truncate">
                    {s.quantity} {s.saleType}(s) · {s.product.name}
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    by {s.manager.fullName} · {new Date(s.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                    {units} units · {s.totalAmount.toLocaleString()} RWF
                    {!enoughStock && (
                      <span className="ml-2 text-red-600 font-semibold">only {s.product.stockUnits} in stock</span>
                    )}
                  </p>
                </div>
                <span className="text-right font-bold text-amber-600 dark:text-amber-500 text-sm shrink-0">
                  {s.totalAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => review(s.id, "approve")}
                  disabled={busy || !enoughStock}
                  title={!enoughStock ? "Not enough stock to approve" : undefined}
                  className={`flex-1 py-1.5 text-xs font-bold rounded transition-colors ${busy || !enoughStock ? "bg-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 text-white"}`}
                >
                  {busy ? "Working…" : "Approve"}
                </button>
                <button
                  onClick={() => review(s.id, "reject")}
                  disabled={busy}
                  className={`flex-1 py-1.5 text-xs font-bold rounded transition-colors ${busy ? "bg-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600 cursor-not-allowed" : "bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400"}`}
                >
                  Reject
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

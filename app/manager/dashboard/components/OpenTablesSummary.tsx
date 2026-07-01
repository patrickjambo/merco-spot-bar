"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Table = { id: string; name: string; status: string; totalBill?: number };

export default function OpenTablesSummary() {
  const [tables, setTables] = useState<Table[]>([]);

  useEffect(() => {
    const load = () => {
      try {
        const saved = localStorage.getItem("merico_tables");
        setTables(saved ? JSON.parse(saved) : []);
      } catch {
        setTables([]);
      }
    };
    load();
    // Stay in sync with the POS/Tables screens (fires across tabs and on our manual dispatch).
    window.addEventListener("storage", load);
    return () => window.removeEventListener("storage", load);
  }, []);

  const occupied = tables.filter((t) => t.status === "OCCUPIED");
  const totalUnpaid = occupied.reduce((sum, t) => sum + (t.totalBill || 0), 0);

  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Open Tables</h2>
        <Link href="/manager/tables" className="text-xs font-bold text-amber-600 hover:underline">Manage →</Link>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="flex-1 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-3">
          <p className="text-xs text-zinc-500 uppercase font-bold">Occupied</p>
          <p className="text-2xl font-bold text-red-500">{occupied.length}</p>
        </div>
        <div className="flex-1 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-3">
          <p className="text-xs text-zinc-500 uppercase font-bold">Unpaid Tabs</p>
          <p className="text-2xl font-bold text-amber-500">{totalUnpaid.toLocaleString()} <span className="text-sm">RWF</span></p>
        </div>
      </div>

      <div className="flex-1 space-y-2 max-h-40 overflow-y-auto pr-1">
        {occupied.length === 0 ? (
          <p className="text-sm text-zinc-500 text-center py-4">No open tables right now.</p>
        ) : (
          occupied.map((t) => (
            <Link
              key={t.id}
              href={`/manager/pos?table=${t.id}`}
              className="flex justify-between items-center p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{t.name}</span>
              <span className="text-sm font-bold text-amber-600">{(t.totalBill || 0).toLocaleString()} RWF</span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

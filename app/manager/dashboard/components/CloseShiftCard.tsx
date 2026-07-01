"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Summary = { expectedCash: number; salesCount: number };
type Result = {
  expectedCash: number;
  countedCash: number;
  difference: number;
  status: "balanced" | "over" | "short";
  salesCount: number;
};

export default function CloseShiftCard() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [counted, setCounted] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const openModal = async () => {
    setOpen(true);
    setResult(null);
    setCounted("");
    setSummary(null);
    setLoading(true);
    try {
      const res = await fetch("/api/manager/close-shift");
      if (res.ok) setSummary(await res.json());
    } catch {
      /* shown as 0 below */
    } finally {
      setLoading(false);
    }
  };

  const submit = async () => {
    const amount = Number(counted);
    if (!Number.isFinite(amount) || amount < 0) {
      alert("Enter a valid counted cash amount.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/manager/close-shift", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ countedCash: amount }),
      });
      const json = await res.json();
      if (res.ok) {
        setResult(json);
        router.refresh();
      } else {
        alert(`❌ ${json.error || "Failed to close shift"}`);
      }
    } catch {
      alert("System error while closing the shift.");
    } finally {
      setSubmitting(false);
    }
  };

  const diffColor =
    result?.status === "balanced"
      ? "text-green-600"
      : result?.status === "over"
      ? "text-blue-600"
      : "text-red-600";

  return (
    <>
      <button
        onClick={openModal}
        className="w-full h-full flex flex-col items-center justify-center p-6 bg-white dark:bg-zinc-900 border-2 border-green-500/60 hover:border-green-500 rounded-xl transition-colors shadow-sm text-zinc-900 dark:text-white"
      >
        <svg className="w-8 h-8 mb-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
        <span className="font-bold">Close Shift</span>
        <span className="text-xs text-zinc-500 mt-1">Reconcile your cash</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 w-full max-w-md p-6">
            {!result ? (
              <>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Close Shift & Reconcile Cash</h3>
                <p className="text-sm text-zinc-500 mt-1">
                  Count the physical cash in your drawer and enter it below.
                </p>

                <div className="mt-4 p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800 flex justify-between items-center">
                  <span className="text-sm text-zinc-500">Expected (system)</span>
                  <span className="text-lg font-bold text-zinc-900 dark:text-white">
                    {loading ? "…" : `${(summary?.expectedCash ?? 0).toLocaleString()} RWF`}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  {loading ? "" : `From ${summary?.salesCount ?? 0} confirmed sale(s) this shift.`}
                </p>

                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mt-4 mb-1">
                  Cash counted (RWF)
                </label>
                <input
                  autoFocus
                  type="number"
                  inputMode="numeric"
                  value={counted}
                  onChange={(e) => setCounted(e.target.value)}
                  placeholder="e.g. 145000"
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 outline-none font-bold text-lg"
                />

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setOpen(false)}
                    disabled={submitting}
                    className="px-4 py-2 rounded-lg font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submit}
                    disabled={submitting || loading || counted === ""}
                    className={`px-4 py-2 rounded-lg font-bold text-white ${submitting || loading || counted === "" ? "bg-green-300 dark:bg-green-900/40 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
                  >
                    {submitting ? "Saving…" : "Close Shift"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Shift Report</h3>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-zinc-500">Expected</span><span className="font-bold">{result.expectedCash.toLocaleString()} RWF</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Counted</span><span className="font-bold">{result.countedCash.toLocaleString()} RWF</span></div>
                  <div className="flex justify-between border-t border-zinc-200 dark:border-zinc-800 pt-2">
                    <span className="text-zinc-500">Difference</span>
                    <span className={`font-bold ${diffColor}`}>
                      {result.difference > 0 ? "+" : ""}{result.difference.toLocaleString()} RWF ({result.status})
                    </span>
                  </div>
                </div>
                <p className="text-xs text-zinc-400 mt-3">
                  {result.status === "balanced"
                    ? "Cash matches the system exactly. Nicely done."
                    : result.status === "short"
                    ? "The drawer is short of the expected amount — recount before finishing."
                    : "The drawer has more than expected — recount to be sure."}
                </p>
                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setOpen(false)}
                    className="px-4 py-2 rounded-lg font-bold text-white bg-zinc-900 dark:bg-white dark:text-zinc-900 hover:opacity-90"
                  >
                    Done
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

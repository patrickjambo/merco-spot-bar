"use client";

import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("System self-healing intercepted an error:", error);

    // Automatically attempt to recover and reconnect after 2 seconds
    const recoveryTimer = setTimeout(() => {
      console.log("Attempting automatic restart...");
      reset();
    }, 2000);

    return () => clearTimeout(recoveryTimer);
  }, [error, reset]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-950 w-full rounded-xl">
      <div className="flex flex-col items-center text-center space-y-4 max-w-md">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
          </div>
        </div>
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
            Connection Interrupted
          </h2>
          <p className="text-zinc-500 text-sm mb-6">
            The system encountered a minor disruption and is automatically resolving it. Reconnecting to the network...
          </p>
        </div>
        <button
          onClick={() => reset()}
          className="px-6 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 rounded-full text-sm font-bold transition-all shadow-lg active:scale-95"
        >
          Force Immediate Reconnect
        </button>
      </div>
    </div>
  );
}

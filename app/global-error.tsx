"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Critical Global Framework Error intercepted:", error);
    // Hard refresh automated recovery fallback
    const hardRefreshTimer = setTimeout(() => {
      window.location.reload();
    }, 3000);
    return () => clearTimeout(hardRefreshTimer);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-black text-white w-full">
          <div className="flex flex-col items-center text-center space-y-6 max-w-md">
            <div className="w-16 h-16 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin"></div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                System Healing in Progress
              </h2>
              <p className="text-zinc-400 text-sm">
                A critical framework error occurred. The system is debugging its state and will automatically restart the application engine in 3 seconds.
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded-full text-sm font-bold transition-all shadow-lg active:scale-95"
            >
              Restart Engine Now
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

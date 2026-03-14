"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function NetworkHealer() {
  const [isOffline, setIsOffline] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Initial check just in case
    if (typeof window !== "undefined") {
      setIsOffline(!navigator.onLine);
    }

    const handleOffline = () => {
      console.warn("System detected network disconnect. Entering standby mode...");
      setIsOffline(true);
    };

    const handleOnline = () => {
      console.info("Network restored. Triggering automatic sequence rebuild...");
      setIsOffline(false);
      // Soft refresh all data fetches sequentially to rebuild UI state without dropping user inputs/cart
      router.refresh();
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, [router]);

  if (!isOffline) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[9999] bg-zinc-900 border-2 border-red-500 text-white px-6 py-3 rounded-full shadow-[0_10px_40px_rgba(255,0,0,0.4)] flex items-center justify-center gap-3 w-max max-w-sm animate-pulse">
      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <div className="flex flex-col">
        <span className="text-sm font-bold leading-tight">Connectivity Lost</span>
        <span className="text-xs text-zinc-400 leading-tight">Awaiting network to self-heal...</span>
      </div>
    </div>
  );
}

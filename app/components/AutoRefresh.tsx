"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AutoRefresh({ intervalMs = 15000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh(); // Tells Next.js to re-fetch Server Components softly
    }, intervalMs);
    
    return () => clearInterval(interval);
  }, [router, intervalMs]);

  return null;
}

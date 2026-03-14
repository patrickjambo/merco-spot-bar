"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ManagerList({ managers: initialManagers }: { managers: any[] }) {
  const router = useRouter();
  const [managers, setManagers] = useState(initialManagers);

  // Periodic refresh
  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const res = await fetch("/api/managers");
        if (res.ok) {
          const freshData = await res.json();
          setManagers(freshData);
        }
      } catch (err) {
        // silently fail on network error to avoid console spam
      }
    };

    const interval = setInterval(() => {
      fetchManagers();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 flex flex-col h-96">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          Staff Attendance Activity
        </h2>
        <span className="text-sm text-zinc-500 font-medium">{managers.length} Total</span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {managers.length === 0 ? (
          <p className="text-sm text-zinc-500 text-center mt-10">No managers found.</p>
        ) : (
          managers.map((manager: any) => {
            const lastLogin = manager.lastLogin ? new Date(manager.lastLogin) : null;
            const now = new Date();
            // Simple online check (logged in within last 12 hours)
            const isOnline = lastLogin && (now.getTime() - lastLogin.getTime()) < 12 * 60 * 60 * 1000;
            
            return (
              <div key={manager.id} className="p-3 border rounded-lg border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center font-bold text-zinc-700 dark:text-zinc-300">
                      {manager.fullName.charAt(0).toUpperCase()}
                    </div>
                    {isOnline ? (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-zinc-900 rounded-full"></span>
                    ) : (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-zinc-400 border-2 border-white dark:border-zinc-900 rounded-full"></span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{manager.fullName}</p>
                    <p className="text-xs text-zinc-500">{manager.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  {isOnline ? (
                    <>
                      <p className="text-xs text-green-600 font-bold">Online</p>
                      <p className="text-xs text-zinc-500">In: {lastLogin!.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </>
                  ) : (
                    <>
                      <p className="text-xs text-zinc-500 font-bold">Offline</p>
                      {lastLogin && <p className="text-xs text-zinc-500">Last: {lastLogin.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>}
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

"use client";

import { useTransition } from "react";
import { dismissAlert } from "./actions";
import { useRouter } from "next/navigation";

export default function AlertCard({ alert }: { alert: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleInvestigate = () => {
    // If it's a product low stock, redirect to products
    if (alert.relatedProductId || alert.alertType.includes("STOCK")) {
      router.push("/admin/products");
    } else {
      router.push("/admin/reports/sales"); // Or something generic
    }
  };

  const handleDismiss = () => {
    startTransition(() => {
      dismissAlert(alert.id);
    });
  };

  return (
    <div className={`p-3 border rounded-lg transition-opacity ${isPending ? 'opacity-50' : ''} ${alert.severity === 'critical' ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10' : 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/10'}`}>
      <div className="flex justify-between items-start mb-1">
        <span className={`text-xs font-bold uppercase ${alert.severity === 'critical' ? 'text-red-600' : 'text-yellow-600'}`}>
          {alert.severity}: {alert.alertType}
        </span>
        <span className="text-xs text-zinc-500">
          {new Date(alert.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </span>
      </div>
      <p className="text-sm font-medium mb-1">{alert.title}</p>
      <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-2">{alert.description}</p>
      <div className="flex gap-2">
        <button onClick={handleInvestigate} disabled={isPending} className={`text-xs text-white px-2 py-1 rounded ${alert.severity === 'critical' ? 'bg-red-600 hover:bg-red-700' : 'bg-yellow-600 hover:bg-yellow-700'}`}>
          Investigate
        </button>
        <button onClick={handleDismiss} disabled={isPending} className="text-xs bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 font-medium px-2 py-1 rounded">
          {isPending ? 'Dismissing...' : 'Dismiss'}
        </button>
      </div>
    </div>
  );
}

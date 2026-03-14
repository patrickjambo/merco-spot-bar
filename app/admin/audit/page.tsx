"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import LogoutButton from "@/app/components/LogoutButton";

export default function AuditPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [counts, setCounts] = useState<{ [key: string]: string | number }>({});
  const [reasons, setReasons] = useState<{ [key: string]: string }>({});
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/audit/stock");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
        const initialCounts: any = {};
        data.forEach((p: any) => initialCounts[p.id] = p.stockUnits);
        setCounts(initialCounts);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (productId: string) => {
    const actualCount = parseInt(counts[productId] as string);
    if (isNaN(actualCount) || actualCount < 0) {
      alert("Invalid count");
      return;
    }
    
    setUpdatingId(productId);
    try {
      const res = await fetch("/api/audit/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          actualCount,
          reason: reasons[productId] || "Manual count adjustment"
        })
      });

      if (!res.ok) {
        const err = await res.json();
        alert(`Failed to update: ${err.error}`);
      } else {
        // Optimistic refresh
        const pd = await res.json();
        setProducts((prev) => prev.map(p => p.id === productId ? pd : p));
        setReasons((prev) => ({ ...prev, [productId]: "" }));
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 p-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Manual Stock Audit</h1>
          <div className="flex gap-4 text-sm mt-2">
            <Link href="/admin/dashboard" className="text-amber-600 hover:underline">← Back to Dashboard</Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white dark:bg-zinc-900 rounded-lg px-3 py-2 border border-zinc-300 dark:border-zinc-700 focus-within:border-amber-500 transition-colors w-64 shadow-sm">
            <svg className="w-5 h-5 text-zinc-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              type="text" 
              placeholder="Search product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full text-zinc-900 dark:text-white placeholder-zinc-500"
            />
          </div>
          <LogoutButton />
        </div>
      </header>
      
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-md border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {loading ? (
          <p className="text-zinc-500 text-center py-10 animate-pulse">Loading stock database...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-xs uppercase font-semibold text-zinc-500">
                <tr>
                  <th className="px-4 py-4">Product Name</th>
                  <th className="px-4 py-4">Current System Stock</th>
                  <th className="px-4 py-4">Actual Physical Count</th>
                  <th className="px-4 py-4">Adjustment Reason</th>
                  <th className="px-4 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {products
                  .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(product => {
                  const currentSt = product.stockUnits;
                  const newCount = counts[product.id] || 0;
                  const diff = Number(newCount) - currentSt;
                  const changed = diff !== 0;

                  return (
                    <tr key={product.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                        {product.name}
                        <span className="block text-xs text-zinc-500 font-normal">{product.category} | {product.packetSize} pk</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-mono font-bold ${currentSt <= product.minStockThreshold ? 'text-red-500' : 'text-zinc-800 dark:text-zinc-300'}`}>
                          {currentSt} units
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          value={counts[product.id]}
                          onChange={(e) => setCounts({...counts, [product.id]: e.target.value})}
                          className="w-24 p-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 rounded text-center outline-none focus:border-amber-500"
                        />
                        {changed && (
                          <span className={`ml-2 text-xs font-bold ${diff > 0 ? "text-green-500" : "text-red-500"}`}>
                            {diff > 0 ? `+${diff}` : diff}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          placeholder={changed ? "Reason required" : ""}
                          value={reasons[product.id] || ""}
                          onChange={(e) => setReasons({...reasons, [product.id]: e.target.value})}
                          disabled={!changed}
                          className="w-full min-w-[200px] p-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 rounded outline-none focus:border-amber-500 disabled:opacity-50"
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleUpdate(product.id)}
                          disabled={!changed || updatingId === product.id}
                          className="bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded shadow transition-colors"
                        >
                          {updatingId === product.id ? "Updating..." : "Commit Audit"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
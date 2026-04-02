"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import LogoutButton from "@/app/components/LogoutButton";

export default function ReportsPage() {
  const [range, setRange] = useState("today");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData(range);
  }, [range]);

  const fetchData = async (r: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/financials?range=${r}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    window.location.href = `/api/reports/export?range=${range}&type=excel`;
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 p-6 print:bg-white print:p-0">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Financial Reports</h1>
          <div className="flex gap-4 text-sm mt-2">
            <Link href="/admin/dashboard" className="text-amber-600 hover:underline">← Back to Dashboard</Link>
          </div>
        </div>
        <div className="flex gap-3 items-center">
          <select 
            value={range} 
            onChange={(e) => setRange(e.target.value)}
            className="p-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded font-bold outline-none"
          >
            <option value="today">Today</option>
            <option value="week">Past 7 Days</option>
            <option value="month">Past 30 Days</option>
            <option value="year">Past Year</option>
            <option value="all">All Time</option>
          </select>
          <div className="flex gap-2">
            <button onClick={handleExportCSV} className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded shadow">
              Export Excel
            </button>
            <button onClick={handleExportPDF} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded shadow">
              Download PDF
            </button>
          </div>
          <LogoutButton />
        </div>
      </header>

      {/* Print only header */}
      <div className="hidden print:block text-center mb-8">
        <h1 className="text-3xl font-bold text-black">Financial Report</h1>
        <p className="text-zinc-600 font-medium mt-1">Period: {range.toUpperCase()}</p>
        <p className="text-sm text-zinc-500 mt-2">Merco Spot Bar & Grill</p>
      </div>
      
      {loading || !data ? (
        <div className="flex justify-center items-center h-64 text-zinc-500 print:hidden">
          <p className="animate-pulse">Aggregating financial data...</p>
        </div>
      ) : (
        <div className="space-y-6 print:space-y-4">
          {/* Top Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4 print:gap-2">
            <div className="bg-white dark:bg-zinc-900 print:dark:bg-white p-6 print:p-4 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 print:border-zinc-300">
              <h3 className="text-sm text-zinc-500 print:text-zinc-600 uppercase font-bold tracking-wider mb-2">Total Revenue</h3>
              <p className="text-3xl print:text-2xl font-bold text-green-500">{data.totalRevenue.toLocaleString()} RWF</p>
            </div>
            <div className="bg-white dark:bg-zinc-900 print:dark:bg-white p-6 print:p-4 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 print:border-zinc-300">
              <h3 className="text-sm text-zinc-500 print:text-zinc-600 uppercase font-bold tracking-wider mb-2">Transactions</h3>
              <p className="text-3xl print:text-2xl font-bold text-blue-500">{data.countSales}</p>
            </div>
            <div className="bg-white dark:bg-zinc-900 print:dark:bg-white p-6 print:p-4 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 print:border-zinc-300">
              <h3 className="text-sm text-zinc-500 print:text-zinc-600 uppercase font-bold tracking-wider mb-2">Avg Order Value</h3>
              <p className="text-3xl print:text-2xl font-bold text-purple-500">
                {data.countSales > 0 ? Math.round(data.totalRevenue / data.countSales).toLocaleString() : 0} RWF
              </p>
            </div>
            <div className="bg-white dark:bg-zinc-900 print:dark:bg-white p-6 print:p-4 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 print:border-zinc-300">
              <h3 className="text-sm text-zinc-500 print:text-zinc-600 uppercase font-bold tracking-wider mb-2">Top Category</h3>
              <p className="text-xl font-bold text-amber-500 mt-2 truncate print:text-amber-600">
                {data.byCategory.length > 0 ? data.byCategory.sort((a:any,b:any) => b.value - a.value)[0].name : 'N/A'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 print:block print:space-y-6">
            
            {/* Top Products Section */}
            <div className="space-y-6 print:space-y-6">
              {/* Drinks Table */}
              <div className="bg-white dark:bg-zinc-900 print:dark:bg-white p-6 print:p-4 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 print:border-zinc-300 print:break-inside-avoid">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 print:text-black mb-4">Top Selling Drinks</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-zinc-50 dark:bg-zinc-800/50 print:bg-zinc-100 text-xs uppercase font-semibold text-zinc-500 print:text-zinc-700">
                      <tr>
                        <th className="px-4 py-3">Product Name</th>
                        <th className="px-4 py-3 text-right">Units Sold</th>
                        <th className="px-4 py-3 text-right">Revenue Generated</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 print:divide-zinc-300">
                      {(!data.topSellingDrinks || data.topSellingDrinks.length === 0) && <tr><td colSpan={3} className="text-center py-4 text-zinc-500">No drinks sold in this period.</td></tr>}
                      {data.topSellingDrinks?.map((prod: any, idx: number) => (
                        <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 print:hover:bg-transparent">
                          <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100 print:text-black">{prod.name}</td>
                          <td className="px-4 py-3 text-right text-zinc-600 print:text-zinc-800">{prod.units}</td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-green-600 print:text-green-700">{prod.revenue.toLocaleString()} RWF</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Food Table */}
              <div className="bg-white dark:bg-zinc-900 print:dark:bg-white p-6 print:p-4 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 print:border-zinc-300 print:break-inside-avoid">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 print:text-black mb-4">Top Selling Food & Others</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-zinc-50 dark:bg-zinc-800/50 print:bg-zinc-100 text-xs uppercase font-semibold text-zinc-500 print:text-zinc-700">
                      <tr>
                        <th className="px-4 py-3">Product Name</th>
                        <th className="px-4 py-3 text-right">Units Sold</th>
                        <th className="px-4 py-3 text-right">Revenue Generated</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 print:divide-zinc-300">
                      {(!data.topSellingFood || data.topSellingFood.length === 0) && <tr><td colSpan={3} className="text-center py-4 text-zinc-500">No food or other items sold in this period.</td></tr>}
                      {data.topSellingFood?.map((prod: any, idx: number) => (
                        <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 print:hover:bg-transparent">
                          <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100 print:text-black">{prod.name}</td>
                          <td className="px-4 py-3 text-right text-zinc-600 print:text-zinc-800">{prod.units}</td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-green-600 print:text-green-700">{prod.revenue.toLocaleString()} RWF</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Metrics Section */}
            <div className="bg-white dark:bg-zinc-900 print:dark:bg-white p-6 print:p-4 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 print:border-zinc-300 print:break-inside-avoid">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 print:text-black mb-4">Revenue By Manager (Staff Shift)</h3>
              <div className="space-y-4">
                {data.byManager.length === 0 && <p className="text-zinc-500 text-sm">No sales data.</p>}
                {data.byManager.map((mgr: any, idx: number) => {
                  const maxVal = Math.max(...data.byManager.map((m: any) => m.value));
                  const percentage = maxVal === 0 ? 0 : (mgr.value / maxVal) * 100;
                  return (
                    <div key={idx}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100 print:text-black">{mgr.name}</span>
                        <span className="font-mono text-zinc-600 print:text-zinc-800">{mgr.value.toLocaleString()} RWF</span>
                      </div>
                      <div className="w-full bg-zinc-200 dark:bg-zinc-800 print:bg-zinc-200 rounded-full h-2.5">
                        <div className="bg-amber-500 print:bg-amber-600 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 print:text-black mt-8 mb-4">Revenue By Category</h3>
              <div className="space-y-4">
                {data.byCategory.length === 0 && <p className="text-zinc-500 text-sm">No category data.</p>}
                {data.byCategory.map((cat: any, idx: number) => {
                  const maxVal = Math.max(...data.byCategory.map((c: any) => c.value));
                  const percentage = maxVal === 0 ? 0 : (cat.value / maxVal) * 100;
                  return (
                    <div key={idx}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100 print:text-black">{cat.name}</span>
                        <span className="font-mono text-zinc-600 print:text-zinc-800">{cat.value.toLocaleString()} RWF</span>
                      </div>
                      <div className="w-full bg-zinc-200 dark:bg-zinc-800 print:bg-zinc-200 rounded-full h-2">
                        <div className="bg-purple-500 print:bg-purple-600 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import LogoutButton from "@/app/components/LogoutButton";

type TableStatus = "FREE" | "OCCUPIED" | "RESERVED" | "BILLING";

interface Table {
  id: string;
  name: string;
  status: TableStatus;
  guests: number;
  totalBill: number;
  lastUpdated: number;
  items?: any[];
}

const DEFAULT_TABLES: Table[] = [
  { id: "1", name: "Table 1", status: "FREE", guests: 0, totalBill: 0, lastUpdated: Date.now(), items: [] },
  { id: "2", name: "Table 2", status: "FREE", guests: 0, totalBill: 0, lastUpdated: Date.now(), items: [] },
  { id: "3", name: "Table 3", status: "FREE", guests: 0, totalBill: 0, lastUpdated: Date.now(), items: [] },
  { id: "4", name: "Table 4", status: "FREE", guests: 0, totalBill: 0, lastUpdated: Date.now(), items: [] },
  { id: "5", name: "Table 5", status: "FREE", guests: 0, totalBill: 0, lastUpdated: Date.now(), items: [] },
  { id: "bar", name: "Bar Seats", status: "FREE", guests: 0, totalBill: 0, lastUpdated: Date.now(), items: [] },
  { id: "vip1", name: "VIP 1", status: "FREE", guests: 0, totalBill: 0, lastUpdated: Date.now(), items: [] },
  { id: "vip2", name: "VIP 2", status: "FREE", guests: 0, totalBill: 0, lastUpdated: Date.now(), items: [] },
];

export default function ManagerTablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  useEffect(() => {
    // Load state from localStorage to synchronize across tabs seamlessly
    const saved = localStorage.getItem("merico_tables");
    if (saved) {
      setTables(JSON.parse(saved));
    } else {
      setTables(DEFAULT_TABLES);
      localStorage.setItem("merico_tables", JSON.stringify(DEFAULT_TABLES));
    }

    // Sync state changes from other tabs in real-time
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "merico_tables" && e.newValue) {
        setTables(JSON.parse(e.newValue));
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const updateTable = (id: string, updates: Partial<Table>) => {
    const newTables = tables.map(t => t.id === id ? { ...t, ...updates, lastUpdated: Date.now() } : t);
    setTables(newTables);
    localStorage.setItem("merico_tables", JSON.stringify(newTables));
    if (selectedTable?.id === id) {
      setSelectedTable({ ...selectedTable, ...updates, lastUpdated: Date.now() } as Table);
    }
  };

  const addTable = () => {
    const newId = `t-${Date.now()}`;
    const newName = prompt("Enter new table name", `Table ${tables.length + 1}`);
    if (!newName) return;
    
    const newTable: Table = {
      id: newId,
      name: newName,
      status: "FREE",
      guests: 0,
      totalBill: 0,
      lastUpdated: Date.now(),
      items: []
    };
    
    const newTables = [...tables, newTable];
    setTables(newTables);
    localStorage.setItem("merico_tables", JSON.stringify(newTables));
  };

  const getStatusColor = (status: TableStatus) => {
    switch (status) {
      case "FREE": return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800";
      case "OCCUPIED": return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800";
      case "RESERVED": return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800";
      case "BILLING": return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800";
    }
  };

  // Stats
  const activeTables = tables.filter(t => t.status !== "FREE").length;
  const totalOccupiedValues = tables.reduce((acc, t) => acc + (t.status === "OCCUPIED" ? t.totalBill : 0), 0);

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 p-6 flex flex-col">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href="/manager/dashboard" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
              &larr; Back
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Active Tables</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Manage real-time dining areas</p>
        </div>
        
        <div className="flex gap-4">
           {/* Stat Badges */}
           <div className="bg-white dark:bg-zinc-900 px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-center">
              <span className="block text-xs uppercase text-zinc-500 font-bold">Active/Total</span>
              <span className="text-xl font-bold">{activeTables}/{tables.length}</span>
           </div>
           <div className="bg-white dark:bg-zinc-900 px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-center">
              <span className="block text-xs uppercase text-zinc-500 font-bold">Open Orders</span>
              <span className="text-xl font-bold text-amber-500">{totalOccupiedValues.toLocaleString()} RWF</span>
           </div>
           <LogoutButton />
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table Map */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <div className="flex justify-between items-center mb-6">
             <h2 className="text-xl font-bold dark:text-white">All Tables</h2>
             <button 
               onClick={addTable} 
               className="bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors"
             >
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
               Add Table
             </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {tables.map(table => (
              <button 
                key={table.id}
                onClick={() => setSelectedTable(table)}
                className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center transition-all min-h-[140px]
                  ${getStatusColor(table.status)}
                  ${selectedTable?.id === table.id ? 'ring-4 ring-zinc-400 border-transparent scale-105 shadow-xl' : 'hover:scale-105 hover:shadow-md'}
                `}
              >
                <span className="text-2xl font-black mb-1">{table.name}</span>
                <span className="text-xs font-bold uppercase tracking-wider mb-2 px-2 py-1 bg-white/50 rounded-md">
                  {table.status}
                </span>
                
                {table.status !== "FREE" && (
                  <>
                    <div className="flex items-center gap-1 text-sm font-semibold mt-auto">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                      {table.guests}
                    </div>
                    {table.totalBill > 0 && <span className="font-bold text-sm mt-1">{table.totalBill.toLocaleString()} RWF</span>}
                  </>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Table Actions */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col">
          {selectedTable ? (
            <>
              <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-6">
                <h2 className="text-2xl font-bold">{selectedTable.name}</h2>
                <p className="text-zinc-500 uppercase text-xs font-bold tracking-wider mb-2">Current Status: {selectedTable.status}</p>
                <div className="flex gap-2 mt-4">
                   <button onClick={() => updateTable(selectedTable.id, { status: "FREE", guests: 0, totalBill: 0, items: [] })} className="flex-1 py-2 text-xs font-bold rounded bg-green-100 hover:bg-green-200 text-green-800 transition-colors">Set Free</button>
                   <button onClick={() => updateTable(selectedTable.id, { status: "OCCUPIED", guests: selectedTable.guests || 2 })} className="flex-1 py-2 text-xs font-bold rounded bg-red-100 hover:bg-red-200 text-red-800 transition-colors">Set Occupied</button>
                   <button onClick={() => updateTable(selectedTable.id, { status: "RESERVED" })} className="flex-1 py-2 text-xs font-bold rounded bg-amber-100 hover:bg-amber-200 text-amber-800 transition-colors">Set Reserved</button>
                </div>
              </div>

              {selectedTable.status !== "FREE" && selectedTable.status !== "RESERVED" && (
                <div className="space-y-4 flex-1 flex flex-col">
                  <div>
                    <label className="text-sm font-medium text-zinc-600 block mb-1">Guests Checked In</label>
                    <div className="flex gap-2">
                       <button onClick={() => updateTable(selectedTable.id, { guests: Math.max(1, selectedTable.guests - 1) })} className="w-10 h-10 rounded bg-zinc-100 dark:bg-zinc-800 font-bold">-</button>
                       <div className="flex-1 flex items-center justify-center font-bold text-xl">{selectedTable.guests}</div>
                       <button onClick={() => updateTable(selectedTable.id, { guests: selectedTable.guests + 1 })} className="w-10 h-10 rounded bg-zinc-100 dark:bg-zinc-800 font-bold">+</button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-zinc-600 block mb-1">Simulated Tab Value (RWF)</label>
                    <input 
                      type="number" 
                      value={selectedTable.totalBill || ""}
                      onChange={(e) => updateTable(selectedTable.id, { totalBill: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 rounded-lg bg-zinc-50 dark:bg-zinc-800 border-none !outline-none font-bold text-xl"
                      placeholder="e.g. 15000"
                    />
                    <p className="text-xs text-zinc-400 mt-2">Adjusted dynamically based on cart entries.</p>
                  </div>

                  {selectedTable.items && selectedTable.items.length > 0 && (
                    <div className="mt-4 flex-1 mt-auto bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4">
                      <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2 border-b border-zinc-200 dark:border-zinc-700 pb-2">Items Consumed</h3>
                      <ul className="space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                        {(() => {
                          // Group identical items by id
                          const groupedItems = selectedTable.items.reduce((acc, item) => {
                            const existing = acc.find((i: any) => i.id === item.id);
                            if (existing) {
                              existing.quantity += item.quantity;
                            } else {
                              acc.push({ ...item });
                            }
                            return acc;
                          }, [] as any[]);
                          
                          return groupedItems.map((item: any, idx: number) => (
                            <li key={idx} className="flex justify-between items-center text-sm">
                              <span className="text-zinc-700 dark:text-zinc-300">
                                <span className="font-bold text-yellow-500 mr-2">{item.quantity}x</span>
                                {item.name}
                              </span>
                              <span className="font-semibold text-zinc-900 dark:text-white">
                                {(item.price * item.quantity).toLocaleString()} RWF
                              </span>
                            </li>
                          ));
                        })()}
                      </ul>
                    </div>
                  )}

                  <div className="mt-auto pt-6">
                    <Link href={`/manager/pos?table=${selectedTable.id}`} className="w-full py-4 bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-lg rounded-xl flex items-center justify-center gap-2 transition-all">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                      Open in POS
                    </Link>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-400">
               <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
               <p className="font-bold">Select a table to manage</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

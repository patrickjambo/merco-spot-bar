"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import LogoutButton from "@/app/components/LogoutButton";

export default function ManagersPage() {
  const [managers, setManagers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [isAdding, setIsAdding] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/managers");
      const data = await res.json();
      setManagers(data);
    } catch (error) {
      console.error("Failed to fetch managers", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?\nTheir past sales will remain intact.`)) return;
    try {
      await fetch(`/api/managers/${id}`, { method: "DELETE" });
      setManagers(managers.filter(m => m.id !== id));
    } catch (error) {
      console.error("Failed to delete manager", error);
    }
  };

  const handleEditClick = (manager: any) => {
    setIsEditing(manager.id);
    setFormData({ ...manager, password: "" }); // Password blank by default
    setErrorMsg("");
  };

  const handleSave = async () => {
    setErrorMsg("");
    try {
      const res = await fetch(`/api/managers/${isEditing}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setIsEditing(null);
        fetchManagers();
      } else {
        setErrorMsg(data.error || "Failed to save");
      }
    } catch (error) {
      setErrorMsg("Network error saving manager");
    }
  };

  const handleAdd = async () => {
    setErrorMsg("");
    if (!formData.username || !formData.fullName || !formData.password) {
      setErrorMsg("Full Name, Username, and Password are required");
      return;
    }
    
    try {
      const res = await fetch(`/api/managers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          isBlocked: formData.isBlocked || false,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsAdding(false);
        setFormData({});
        fetchManagers();
      } else {
        setErrorMsg(data.error || "Failed to create manager");
      }
    } catch (error) {
      setErrorMsg("Network error creating manager");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 p-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Manager Accounts</h1>
          <div className="flex gap-4 text-sm mt-2">
            <Link href="/admin/dashboard" className="text-amber-600 hover:underline">← Back to Dashboard</Link>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { setIsAdding(true); setFormData({}); setErrorMsg(""); }}
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded shadow"
          >
            + Create New Manager
          </button>
          <LogoutButton />
        </div>
      </header>

      {errorMsg && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-sm">
          <p className="font-bold">Error</p>
          <p>{errorMsg}</p>
        </div>
      )}

      {isAdding && (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-md border border-zinc-200 dark:border-zinc-800 mb-8">
          <h2 className="text-xl font-bold mb-4">Create Manager Account</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <input type="text" placeholder="Full Name (e.g. John Doe)" className="border p-2 rounded dark:bg-zinc-800 dark:border-zinc-700" value={formData.fullName || ''} onChange={e => setFormData({...formData, fullName: e.target.value})} />
            <input type="text" placeholder="Login Username" className="border p-2 rounded dark:bg-zinc-800 dark:border-zinc-700" value={formData.username || ''} onChange={e => setFormData({...formData, username: e.target.value.toLowerCase()})} />
            <input type="text" placeholder="Temporary Password" className="border p-2 rounded dark:bg-zinc-800 dark:border-zinc-700" value={formData.password || ''} onChange={e => setFormData({...formData, password: e.target.value})} />
            <input type="text" placeholder="Phone Number" className="border p-2 rounded dark:bg-zinc-800 dark:border-zinc-700" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} />
            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-500">Shift Start (Optional)</label>
              <input type="time" className="border p-2 rounded dark:bg-zinc-800 dark:border-zinc-700" value={formData.shiftStart || ''} onChange={e => setFormData({...formData, shiftStart: e.target.value})} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-500">Shift End (Optional)</label>
              <input type="time" className="border p-2 rounded dark:bg-zinc-800 dark:border-zinc-700" value={formData.shiftEnd || ''} onChange={e => setFormData({...formData, shiftEnd: e.target.value})} />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-bold">Save Manager</button>
            <button onClick={() => setIsAdding(false)} className="bg-zinc-300 hover:bg-zinc-400 dark:bg-zinc-800 dark:hover:bg-zinc-700 px-4 py-2 rounded">Cancel</button>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="text-center py-10">Loading managers...</p>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-md border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-xs uppercase font-semibold text-zinc-500 dark:text-zinc-400">
                <tr>
                  <th className="px-4 py-3">Full Name</th>
                  <th className="px-4 py-3">Username</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Shift Hours</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {managers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">No managers found. Click above to add some staff.</td>
                  </tr>
                ) : (
                  managers.map(manager => (
                    <tr key={manager.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                      {isEditing === manager.id ? (
                        <td colSpan={6} className="px-4 py-4 bg-amber-50 dark:bg-amber-900/10">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                            <input type="text" className="border p-1 rounded text-black" value={formData.fullName || ''} onChange={e => setFormData({...formData, fullName: e.target.value})} placeholder="Full Name" />
                            <input type="text" className="border p-1 rounded text-black" value={formData.username || ''} onChange={e => setFormData({...formData, username: e.target.value})} placeholder="Username" />
                            <input type="text" className="border p-1 rounded text-black" value={formData.password || ''} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="New Password (leave blank to keep)" />
                            <input type="text" className="border p-1 rounded text-black" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="Phone" />
                            <div className="flex items-center gap-2 border p-1 rounded bg-white">
                              <span className="text-zinc-400 text-xs">Start:</span>
                              <input type="time" className="text-black outline-none" value={formData.shiftStart || ''} onChange={e => setFormData({...formData, shiftStart: e.target.value})} />
                            </div>
                            <div className="flex items-center gap-2 border p-1 rounded bg-white">
                              <span className="text-zinc-400 text-xs">End:</span>
                              <input type="time" className="text-black outline-none" value={formData.shiftEnd || ''} onChange={e => setFormData({...formData, shiftEnd: e.target.value})} />
                            </div>
                            <div className="flex items-center gap-2 md:col-span-2">
                              <input type="checkbox" id="isBlocked" checked={formData.isBlocked} onChange={e => setFormData({...formData, isBlocked: e.target.checked})} />
                              <label htmlFor="isBlocked" className="text-red-600 font-bold text-sm">Account Blocked (Lockout)</label>
                            </div>
                          </div>
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => setIsEditing(null)} className="px-3 py-1 bg-zinc-300 hover:bg-zinc-400 dark:bg-zinc-700 rounded text-black dark:text-white">Cancel</button>
                            <button onClick={handleSave} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium">Save Changes</button>
                          </div>
                        </td>
                      ) : (
                        <>
                          <td className="px-4 py-3 font-medium text-zinc-900 dark:text-white">
                            {manager.fullName}
                          </td>
                          <td className="px-4 py-3 font-mono text-zinc-600 dark:text-zinc-300">@{manager.username}</td>
                          <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{manager.phone || '-'}</td>
                          <td className="px-4 py-3">
                            {(manager.shiftStart || manager.shiftEnd) ? (
                              <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-xs dark:text-white">
                                {manager.shiftStart || '--:--'} to {manager.shiftEnd || '--:--'}
                              </span>
                            ) : (
                              <span className="text-zinc-400 text-xs italic">No shift set</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {manager.isBlocked ? (
                              <span className="bg-red-100 text-red-700 dark:bg-red-900/30 text-xs font-bold px-2 py-1 rounded-full uppercase">Blocked</span>
                            ) : (
                              <span className="bg-green-100 text-green-700 dark:bg-green-900/30 text-xs font-bold px-2 py-1 rounded-full uppercase">Active</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button onClick={() => handleEditClick(manager)} className="text-blue-600 hover:text-blue-800 font-medium mr-3">Edit</button>
                            <button onClick={() => handleDelete(manager.id, manager.fullName)} className="text-red-600 hover:text-red-800 font-medium">Delete</button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
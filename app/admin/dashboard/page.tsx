import Link from "next/link";
import LogoutButton from "@/app/components/LogoutButton";
import { getPrisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import AlertCard from "./components/AlertCard";
import ManagerList from "./components/ManagerList";
import AutoRefresh from "@/app/components/AutoRefresh";

// This makes the page dynamically render on every request instead of being statically cached
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const prisma = getPrisma();
  const session = await verifySession();
  // Fetch real data from the database
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Run queries sequentially to avoid connection limit issues with the local 1-connection database
  // 1. Get today's sales
  const todaysSales = await prisma.sale.findMany({
    where: {
      createdAt: { gte: today },
      status: "confirmed"
    },
    include: {
      product: true,
      manager: true
    },
    orderBy: { createdAt: "desc" }
  });
  
  // 2. Fetch all products for stock value tracking
  const allProducts = await prisma.product.findMany();

  // 3. Alerts
  const allUnresolvedAlerts = await prisma.alert.findMany({
    where: { isResolved: false },
    orderBy: { createdAt: "desc" },
    include: { manager: true, product: true }
  });

  // Auto-resolve 'low_stock' alerts if product stock is now above threshold
  let resolvedIds: string[] = [];
  try {
    const alertsToResolve = allUnresolvedAlerts.filter((alert: any) => {
      // Both "low_stock" and "LOW_STOCK" to be safe
      return alert.alertType.toLowerCase() === "low_stock" && alert.product && alert.product.stockUnits > alert.product.minStockThreshold;
    });

    if (alertsToResolve.length > 0) {
      resolvedIds = alertsToResolve.map((a: any) => a.id);
      await prisma.alert.updateMany({
        where: { id: { in: resolvedIds } },
        data: { isResolved: true, resolvedAt: new Date() }
      });
    }
  } catch (error) {
    console.error("Auto-resolve alerts error:", error);
  }

  const unresolvedAlerts = allUnresolvedAlerts.filter(
    (a: any) => !resolvedIds.includes(a.id)
  );

  // 4. Managers
  const managers = await prisma.user.findMany({
    where: { role: "manager", isDeleted: false },
    select: { id: true, fullName: true, role: true, lastLogin: true }
  });

  const todayRevenue = todaysSales.reduce((acc: number, sale: any) => acc + sale.totalAmount, 0);
  const unitsSoldToday = todaysSales.reduce((acc: number, sale: any) => {
    // Treat packet as multiple units for count, or just count the `quantity` of the sale type
    return acc + (sale.saleType === 'packet' ? sale.quantity * sale.product.packetSize : sale.quantity);
  }, 0);

  const totalStockValue = allProducts.reduce((acc: number, p: any) => acc + (p.stockUnits * p.pricePerUnit), 0);

  const activeManagersCount = managers.filter(m => m.lastLogin && (new Date().getTime() - new Date(m.lastLogin).getTime()) < 12 * 60 * 60 * 1000).length;

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 p-6 border-t border-zinc-200 dark:border-zinc-800">
      <AutoRefresh intervalMs={30000} />
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Super Admin Dashboard</h1>
          <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-2 rounded-full shadow-sm">
            <div className="w-10 h-10 rounded-full bg-zinc-800 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900 font-bold text-lg">
              {((session?.fullName as string) || 'A').charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-zinc-900 dark:text-white leading-tight">
                {session?.fullName as string || 'Admin User'}
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 capitalize leading-tight">
                {session?.role as string || 'Superadmin'} Role
              </span>
            </div>
          </div>
        </div>
        <LogoutButton />
      </header>
      
      {/* 7.1 Real-Time Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {[
          { label: "Today's Revenue", value: `${todayRevenue.toLocaleString()} RWF`, color: "text-green-500" },
          { label: "Active Products", value: `${allProducts.length}`, color: "text-green-600" },
          { label: "Units Sold Today", value: `${unitsSoldToday}`, color: "text-blue-500" },
          { label: "Est. Stock Value", value: `${totalStockValue.toLocaleString()} RWF`, color: "text-purple-500" },
          { label: "Active Managers", value: `${activeManagersCount} Right Now`, color: "text-yellow-500" },
          { label: "Unread Alerts", value: `${unresolvedAlerts.length}`, color: "text-red-500", alert: unresolvedAlerts.length > 0 }
        ].map((stat, i) => (
          <div key={i} className={`bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border ${stat.alert ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-zinc-200 dark:border-zinc-800'}`}>
            <h3 className="text-zinc-500 dark:text-zinc-400 text-xs font-medium mb-1 uppercase tracking-wider">{stat.label}</h3>
            <p className={`text-2xl font-bold ${stat.color} ${stat.alert ? 'animate-pulse' : ''}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* 7.3 Alerts & Notifications Panel */}
        <div className="lg:col-span-1 bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-red-200 dark:border-red-900/50 flex flex-col h-96">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-red-600 dark:text-red-500 flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              Active Alerts
            </h2>
            <span className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 text-xs font-bold px-2 py-1 rounded-full">{unresolvedAlerts.length} Unresolved</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            
            {unresolvedAlerts.length === 0 ? (
              <p className="text-sm text-zinc-500 text-center mt-10">No active alerts. Everything is running smoothly.</p>
            ) : (
              unresolvedAlerts.map((alert: any) => (
                <AlertCard key={alert.id} alert={alert} />
              ))
            )}
            
          </div>
        </div>

        {/* 7.4 Active Managers Panel */}
        <div className="lg:col-span-1">
          <ManagerList managers={managers} />
        </div>

        {/* 7.2 Live Sales Feed */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 h-96 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              Live Sales Feed (Today)
            </h2>
            <button className="text-sm text-yellow-600 hover:text-yellow-700 font-medium">Refresh</button>
          </div>
          
          <div className="flex-1 overflow-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-xs uppercase font-semibold sticky top-0">
                <tr>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Manager</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Qty</th>
                  <th className="px-4 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {todaysSales.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">No sales recorded today yet.</td>
                  </tr>
                ) : (
                  todaysSales.map((sale: any) => (
                    <tr key={sale.id} className={`hover:bg-zinc-50 dark:hover:bg-zinc-800/20 ${sale.flagged ? 'bg-orange-50 dark:bg-orange-900/10' : ''}`}>
                      <td className="px-4 py-3 text-zinc-500">{new Date(sale.createdAt).toLocaleTimeString()}</td>
                      <td className="px-4 py-3 font-medium">{sale.manager.fullName}</td>
                      <td className={`px-4 py-3 ${sale.flagged ? 'font-semibold text-orange-600' : ''}`}>{sale.product.name} ({sale.saleType})</td>
                      <td className={`px-4 py-3 ${sale.flagged ? 'font-bold text-orange-600' : ''}`}>{sale.quantity}</td>
                      <td className="px-4 py-3 text-right font-medium">{sale.totalAmount.toLocaleString()} RWF</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Admin Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <Link href="/admin/products" className="flex flex-col items-center justify-center p-6 bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-bold rounded-xl transition-colors shadow-md">
          <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          Add New Product
        </Link>
        <Link href="/admin/managers" className="flex flex-col items-center justify-center p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 font-bold rounded-xl transition-colors shadow-sm">
          <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
          Create Manager Account
        </Link>
        <Link href="/admin/reports" className="flex flex-col items-center justify-center p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 font-bold rounded-xl transition-colors shadow-sm">
          <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          Financial Reports
        </Link>
        <Link href="/admin/audit" className="flex flex-col items-center justify-center p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 font-bold rounded-xl transition-colors shadow-sm">
          <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          Manual Stock Audit
        </Link>
      </div>

    </div>
  );
}
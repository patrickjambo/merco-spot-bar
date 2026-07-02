import Link from "next/link";
import LogoutButton from "@/app/components/LogoutButton";
import { getPrisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import AutoRefresh from "@/app/components/AutoRefresh";
import CloseShiftCard from "./components/CloseShiftCard";
import OpenTablesSummary from "./components/OpenTablesSummary";
import BarChart from "@/app/admin/dashboard/components/BarChart";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const prisma = getPrisma();
  const session = await verifySession();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Run perfectly in parallel for maximum speed
  const [todaysSales, lowStockProducts, yesterdaySales] = await Promise.all([
    prisma.sale.findMany({
      where: {
        createdAt: { gte: today },
        status: "confirmed",
        managerId: session?.userId as string
      },
      // Only the rendered fields — avoids pulling base64 product images.
      include: {
        product: { select: { name: true, pricePerUnit: true } }
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.product.findMany({
      where: { isActive: true },
      select: { name: true, stockUnits: true, minStockThreshold: true },
    }),
    prisma.sale.findMany({
      where: {
        status: "confirmed",
        managerId: session?.userId as string,
        createdAt: { gte: yesterday, lt: today }
      },
      select: { totalAmount: true }
    })
  ]);

  const todayRevenue = todaysSales.reduce((acc: number, sale: any) => acc + sale.totalAmount, 0);
  const unitsSoldToday = todaysSales.reduce((acc: number, sale: any) => acc + sale.quantity, 0);

  // Compute low stock items
  const lowStockItems = lowStockProducts.filter((p: any) => p.stockUnits <= p.minStockThreshold);
  const lowStockCount = lowStockItems.length;

  // My performance today: revenue vs yesterday, best seller, hourly breakdown
  const yesterdayRevenue = yesterdaySales.reduce((acc: number, s: any) => acc + s.totalAmount, 0);
  const deltaPct = yesterdayRevenue > 0
    ? Math.round(((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100)
    : todayRevenue > 0 ? 100 : 0;

  const byProduct: Record<string, { name: string; revenue: number; units: number }> = {};
  todaysSales.forEach((s: any) => {
    const name = s.product?.name || "Unknown";
    if (!byProduct[name]) byProduct[name] = { name, revenue: 0, units: 0 };
    byProduct[name].revenue += s.totalAmount;
    byProduct[name].units += s.quantity;
  });
  const bestSeller = Object.values(byProduct).sort((a, b) => b.revenue - a.revenue)[0] || null;

  const perfHours = Array.from({ length: 16 }, (_, i) => i + 8); // 8:00–23:00
  const hourly = perfHours.map((h) => ({
    label: `${h}`,
    value: todaysSales
      .filter((s: any) => new Date(s.createdAt).getHours() === h)
      .reduce((acc: number, s: any) => acc + s.totalAmount, 0),
  }));

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 p-6 border-t border-zinc-200 dark:border-zinc-800">
      <AutoRefresh intervalMs={30000} />
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Staff Dashboard</h1>
          <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-2 rounded-full shadow-sm">
            <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-zinc-900 font-bold text-lg">
              {((session?.fullName as string) || 'M').charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-zinc-900 dark:text-white leading-tight">
                {session?.fullName as string || 'Staff Member'}
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 capitalize leading-tight">
                {session?.role as string || 'Manager'} Role
              </span>
            </div>
          </div>
        </div>
        <LogoutButton />
      </header>
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Your Sales Today", value: `${todaysSales.length}`, color: "text-blue-500" },
          { label: "Your Revenue", value: `${todayRevenue.toLocaleString()} RWF`, color: "text-green-500" },
          { label: "Units Sold", value: `${unitsSoldToday}`, color: "text-amber-500" },
          { label: "Low Stock Alerts", value: `${lowStockCount}`, color: "text-red-500" }
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-zinc-500 dark:text-zinc-400 text-sm font-medium mb-1">{stat.label}</h3>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* My performance today */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 flex flex-col gap-4">
          <h2 className="text-xl font-bold">My Performance Today</h2>
          <div>
            <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Revenue vs Yesterday</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-green-500">{todayRevenue.toLocaleString()} RWF</span>
              <span className={`text-sm font-bold ${deltaPct >= 0 ? "text-green-600" : "text-red-600"}`}>
                {deltaPct >= 0 ? "▲" : "▼"} {Math.abs(deltaPct)}%
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">Yesterday: {yesterdayRevenue.toLocaleString()} RWF</p>
          </div>
          <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4">
            <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Your Best Seller</p>
            {bestSeller ? (
              <>
                <p className="text-lg font-bold mt-1 truncate">{bestSeller.name}</p>
                <p className="text-xs text-zinc-400">{bestSeller.units} sold · {bestSeller.revenue.toLocaleString()} RWF</p>
              </>
            ) : (
              <p className="text-sm text-zinc-400 mt-1">No sales yet today.</p>
            )}
          </div>
        </div>
        <div className="lg:col-span-2">
          <BarChart title="Your Revenue by Hour" data={hourly} accent="bg-green-500" />
        </div>
      </div>

      {/* Shift, tables & stock at a glance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <CloseShiftCard />
        <OpenTablesSummary />
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 flex flex-col">
          <h2 className="text-xl font-bold mb-4">Low Stock</h2>
          <div className="flex-1 space-y-2 max-h-40 overflow-y-auto pr-1">
            {lowStockItems.length === 0 ? (
              <p className="text-sm text-zinc-500 text-center py-4">All items are above their thresholds.</p>
            ) : (
              lowStockItems.map((p: any, i: number) => (
                <div key={i} className="flex justify-between items-center p-2 rounded-lg bg-red-50 dark:bg-red-900/10">
                  <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate pr-2">{p.name}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${p.stockUnits === 0 ? 'bg-red-200 text-red-800' : 'bg-red-100 text-red-700'}`}>{p.stockUnits} left</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions / POS */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/manager/pos" className="flex flex-col items-center justify-center p-6 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl transition-colors h-32 shadow-md">
              <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
              Standard POS Checkout
            </Link>
            <Link href="/manager/tables" className="flex flex-col items-center justify-center p-6 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 font-semibold rounded-xl transition-colors h-32 shadow-sm text-zinc-900 dark:text-white">
              <svg className="w-8 h-8 mb-2 text-zinc-600 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
              Manage Tables
            </Link>
            <Link href="/manager/inventory" className="flex flex-col items-center justify-center p-6 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 font-semibold rounded-xl transition-colors h-32 shadow-sm text-zinc-900 dark:text-white">
              <svg className="w-8 h-8 mb-2 text-zinc-600 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              Inventory Access
            </Link>
            <Link href="/manager/shifts" className="flex flex-col items-center justify-center p-6 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 font-semibold rounded-xl transition-colors h-32 shadow-sm text-zinc-900 dark:text-white">
              <svg className="w-8 h-8 mb-2 text-zinc-600 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              Staff Shifts
            </Link>
          </div>
        </div>

        {/* Recent Orders made by this manager */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Your Recent Transactions</h2>
          </div>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {todaysSales.length === 0 ? (
              <p className="text-zinc-500 text-sm text-center py-6">No sales recorded yet today.</p>
            ) : (
              todaysSales.slice(0, 10).map((sale: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-transparent">
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="font-bold text-zinc-900 dark:text-white">
                        {sale.product?.name || "Unknown Item"}
                      </p>
                    </div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                      {sale.quantity} {sale.saleType}(s) • {(sale.product?.pricePerUnit * sale.quantity).toLocaleString()} RWF
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500">
                      Confirmed
                    </span>
                    <p className="text-xs text-zinc-500 dark:text-zinc-500 block">
                      {new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
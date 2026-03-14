import Link from "next/link";
import LogoutButton from "@/app/components/LogoutButton";
import { getPrisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ManagerInventoryPage() {
  const prisma = getPrisma();
  const session = await verifySession();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Fetch all products
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' }
  });

  // Fetch today's sales for THIS manager
  const todaysSales = await prisma.sale.findMany({
    where: {
      createdAt: { gte: today },
      status: "confirmed",
      managerId: session?.userId as string 
    }
  });

  // Calculate statistics for each product
  const inventoryStats = products.map((product: any) => {
    // Filter sales belonging to this product
    const productSales = todaysSales.filter((sale: any) => sale.productId === product.id);

    // Calculate total units sold (handle unit vs packet)
    const unitsSold = productSales.reduce((acc: number, sale: any) => {
      return acc + (sale.saleType === 'packet' ? sale.quantity * product.packetSize : sale.quantity);
    }, 0);

    // Calculate total revenue generated from this product today
    const revenue = productSales.reduce((acc: number, sale: any) => acc + sale.totalAmount, 0);

    return {
      ...product,
      unitsSold,
      revenue
    };
  });

  const totalStockRemain = inventoryStats.reduce((acc, item) => acc + item.stockUnits, 0);
  const totalUnitsSold = inventoryStats.reduce((acc, item) => acc + item.unitsSold, 0);
  const totalRevenue = inventoryStats.reduce((acc, item) => acc + item.revenue, 0);
  const totalStockValue = inventoryStats.reduce((acc, item) => acc + (item.stockUnits * item.pricePerUnit), 0);

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 p-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Inventory Access</h1>
          <p className="text-zinc-500 dark:text-zinc-400">View real-time stock levels, pricing, and your daily sales</p>
        </div>
        <div className="flex gap-4">
          <Link href="/manager/pos" className="px-4 py-2 bg-amber-500 text-black font-bold rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Make a Sale
          </Link>
          <Link href="/manager/dashboard" className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors">
            Back to Dashboard
          </Link>
          <LogoutButton />
        </div>
      </header>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Total Stock Remaining</p>
          <p className="text-3xl font-black text-zinc-900 dark:text-white">{totalStockRemain} <span className="text-sm font-medium text-zinc-500">items</span></p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Total Sold Today</p>
          <p className="text-3xl font-black text-amber-600 dark:text-amber-500">{totalUnitsSold} <span className="text-sm font-medium text-zinc-500">units</span></p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Total Revenue Today</p>
          <p className="text-3xl font-black text-blue-600 dark:text-blue-500 whitespace-nowrap">{totalRevenue.toLocaleString()} <span className="text-sm font-medium text-zinc-500">RWF</span></p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Est. Stock Value</p>
          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-500 whitespace-nowrap">{totalStockValue.toLocaleString()} <span className="text-sm font-medium text-zinc-500">RWF</span></p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
              <tr>
                <th className="p-4 font-semibold text-sm text-zinc-600 dark:text-zinc-400">Product Name</th>
                <th className="p-4 font-semibold text-sm text-zinc-600 dark:text-zinc-400">Category</th>
                <th className="p-4 font-semibold text-sm text-zinc-600 dark:text-zinc-400 whitespace-nowrap">Price (Item)</th>
                <th className="p-4 font-semibold text-sm text-zinc-600 dark:text-zinc-400 whitespace-nowrap">Price (Packet)</th>
                <th className="p-4 font-semibold text-sm text-zinc-600 dark:text-zinc-400">Current Stock</th>
                <th className="p-4 font-semibold text-sm text-zinc-600 dark:text-zinc-400">Sold Today</th>
                <th className="p-4 font-semibold text-sm text-zinc-600 dark:text-zinc-400">Revenue Today</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {inventoryStats.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="p-4 font-medium text-zinc-900 dark:text-white">
                    {item.name}
                  </td>
                  <td className="p-4 text-zinc-600 dark:text-zinc-400">
                    <span className="inline-block px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-md text-xs font-medium border border-zinc-200 dark:border-zinc-700">
                      {item.category}
                    </span>
                  </td>
                  <td className="p-4 text-zinc-900 dark:text-zinc-300 font-medium whitespace-nowrap">
                    {item.pricePerUnit.toLocaleString()} RWF
                  </td>
                  <td className="p-4 text-zinc-900 dark:text-zinc-300 font-medium whitespace-nowrap">
                    {item.pricePerPacket ? `${item.pricePerPacket.toLocaleString()} RWF` : "-"}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                       <span className={`font-bold ${item.stockUnits <= item.minStockThreshold ? 'text-red-500' : 'text-green-500'}`}>
                        {item.stockUnits}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-amber-600 dark:text-amber-500 font-bold">
                    {item.unitsSold > 0 ? `+${item.unitsSold}` : "0"}
                  </td>
                  <td className="p-4 text-blue-600 dark:text-blue-400 font-bold whitespace-nowrap">
                    {item.revenue.toLocaleString()} RWF
                  </td>
                </tr>
              ))}
              
              {inventoryStats.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-zinc-500">
                    No products found in inventory.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
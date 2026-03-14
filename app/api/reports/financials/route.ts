import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await verifySession();
    if (!session || session.role !== 'superadmin') {
      // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || 'today';
    
    const prisma = getPrisma();
    let startDate: Date | undefined;

    if (range === 'today') {
      startDate = new Date();
      startDate.setHours(0,0,0,0);
    } else if (range === 'week') {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      startDate.setHours(0,0,0,0);
    } else if (range === 'month') {
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      startDate.setHours(0,0,0,0);
    } else if (range === 'year') {
      startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);
      startDate.setHours(0,0,0,0);
    }

    const whereClause: any = { status: 'confirmed' };
    if (startDate) {
      whereClause.createdAt = { gte: startDate };
    }

    const sales = await prisma.sale.findMany({
      where: whereClause,
      include: {
        product: { select: { name: true, category: true, pricePerUnit: true } },
        manager: { select: { fullName: true } }
      },
      orderBy: { createdAt: 'asc' }
    });

    const totalRevenue = sales.reduce((acc: number, sale: any) => acc + sale.totalAmount, 0);
    const countSales = sales.length;

    const byCategory: Record<string, number> = {};
    const byManager: Record<string, number> = {};
    const byDate: Record<string, number> = {};

    const topDrinkProducts: Record<string, {name: string, revenue: number, units: number, category: string}> = {};
    const topFoodProducts: Record<string, {name: string, revenue: number, units: number, category: string}> = {};

    // Since most current products are drinks, default to drink unless it's explicitly food, snacks, or cigarettes
    const isDrink = (cat: string) => !/food|snack|meal|cigarette|cigar/i.test(cat);

    sales.forEach((s: any) => {
      // By category
      const cat = s.product.category || 'Uncategorized';
      byCategory[cat] = (byCategory[cat] || 0) + s.totalAmount;

      // By manager
      const mgr = s.manager?.fullName || 'Unknown';
      byManager[mgr] = (byManager[mgr] || 0) + s.totalAmount;

      // By date
      const d = new Date(s.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: range === 'year' || range === 'all' ? 'numeric' : undefined });
      byDate[d] = (byDate[d] || 0) + s.totalAmount;

      // Top Products (Drinks vs Food)
      const pId = s.productId;
      if (isDrink(cat)) {
        if (!topDrinkProducts[pId]) topDrinkProducts[pId] = { name: s.product.name, revenue: 0, units: 0, category: cat };
        topDrinkProducts[pId].revenue += s.totalAmount;
        topDrinkProducts[pId].units += s.quantity;
      } else {
        if (!topFoodProducts[pId]) topFoodProducts[pId] = { name: s.product.name, revenue: 0, units: 0, category: cat };
        topFoodProducts[pId].revenue += s.totalAmount;
        topFoodProducts[pId].units += s.quantity;
      }
    });

    const topSellingDrinks = Object.values(topDrinkProducts).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
    const topSellingFood = Object.values(topFoodProducts).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

    return NextResponse.json({
      totalRevenue,
      countSales,
      byCategory: Object.entries(byCategory).map(([name, value]) => ({name, value})),
      byManager: Object.entries(byManager).map(([name, value]) => ({name, value})),
      byDate: Object.entries(byDate).map(([date, value]) => ({date, value})),
      topSellingDrinks,
      topSellingFood
    });

  } catch (error) {
    console.error('Reports error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

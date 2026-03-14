import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await verifySession();
    if (!session || session.role !== 'superadmin') {
      // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || 'today';
    const type = searchParams.get('type') || 'csv';
    
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
      orderBy: { createdAt: 'desc' }
    });

    if (type === 'csv') {
      const headers = ['Date', 'Time', 'Product Name', 'Category', 'Quantity', 'Unit Price (RWF)', 'Total Revenue (RWF)', 'Manager'];
      const rows = sales.map(s => {
        const d = new Date(s.createdAt);
        return [
          d.toLocaleDateString(),
          d.toLocaleTimeString(),
          `"${s.product.name.replace(/"/g, '""')}"`,
          `"${s.product.category.replace(/"/g, '""')}"`,
          s.quantity,
          s.product.pricePerUnit,
          s.totalAmount,
          `"${s.manager?.fullName?.replace(/"/g, '""') || 'Unknown'}"`
        ].join(',');
      });

      const csvContent = [headers.join(','), ...rows].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="financial_report_${range}.csv"`
        }
      });
    }

    return NextResponse.json({ error: 'Unsupported format' }, { status: 400 });

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

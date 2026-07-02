import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { resolveProductImage } from '@/lib/productImages';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const prisma = getPrisma();
  try {
    const { searchParams } = new URL(request.url);
    const includeSales = searchParams.get('includeSales') === 'true';

    const records = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      ...(includeSales && {
        include: {
          sales: {
            where: { status: 'confirmed' }
          }
        }
      })
    });

    // Transform outgoing responses directly, resolving a real/distinct image per product.
    const products = records.map((record: any) => {
      const finalUrl = resolveProductImage(record.imageUrl, record.category, record.name);

      let unitsSold = 0;
      let revenue = 0;
      if (record.sales) {
        for (const s of record.sales) {
          unitsSold += (s.saleType === 'packet' ? s.quantity * record.packetSize : s.quantity);
          revenue += s.totalAmount;
        }
      }

      const { sales, ...productData } = record;
      return { ...productData, imageUrl: finalUrl, unitsSold, revenue };
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const prisma = getPrisma();
  try {
    const body = await request.json();
    const newProduct = await prisma.product.create({
      data: {
        name: body.name,
        category: body.category,
        brand: body.brand,
        pricePerUnit: body.pricePerUnit,
        pricePerPacket: body.pricePerPacket,
        packetSize: body.packetSize || 1,
        stockUnits: body.stockUnits || 0,
        minStockThreshold: body.minStockThreshold || 10,
        isActive: body.isActive !== undefined ? body.isActive : true,
        imageUrl: body.imageUrl,
      },
    });
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

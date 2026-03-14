import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await verifySession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { items } = await req.json();
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const prisma = getPrisma();

    // Use Prisma Transaction to ensure atomic operations (if one fails, all fail)
    const result = await prisma.$transaction(async (tx: any) => {
      const salesCreated = [];

      for (const item of items) {
        // Fetch current product to check stock and actual current price
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new Error(`Product ${item.productId} not found`);

        const isPacket = item.saleType === 'packet';
        const quantityToDeduct = isPacket ? (item.quantity * product.packetSize) : item.quantity;
        
        if (product.stockUnits < quantityToDeduct) {
          throw new Error(`Insufficient stock for ${product.name}. Requested: ${quantityToDeduct}, Available: ${product.stockUnits}`);
        }

        const unitPrice = isPacket ? product.pricePerPacket : product.pricePerUnit;
        const totalAmount = unitPrice * item.quantity;

        // Anomaly Engine 3.3.8: Mass Quantity Sale Check
        const MASS_QUANTITY_THRESHOLD = 50;
        const isMassSale = quantityToDeduct > MASS_QUANTITY_THRESHOLD;

        if (isMassSale) {
          // Create pending sale, do NOT deduct stock yet
          const sale = await tx.sale.create({
            data: {
              managerId: session.userId as string,
              productId: product.id,
              saleType: item.saleType,
              quantity: item.quantity,
              unitPriceAtSale: unitPrice,
              totalAmount: totalAmount,
              status: 'pending_approval',
              flagged: true,
              flagReason: 'Mass Quantity Threshold Exceeded in POS Checkout'
            }
          });
          salesCreated.push(sale);
          
          await tx.alert.create({
            data: {
              alertType: 'Mass Quantity',
              severity: 'critical',
              title: 'Mass Sale Requires Approval (POS)',
              description: `Manager attempted to sell ${quantityToDeduct} units of ${product.name}. Sale is pending.`,
              relatedManagerId: session.userId as string,
              relatedProductId: product.id,
              relatedSaleId: sale.id
            }
          });
          continue; // Skip stock deduction for this item and move to next
        }

        // 1. Create Confirmed Sale
        const sale = await tx.sale.create({
          data: {
            managerId: session.userId as string,
            productId: product.id,
            saleType: item.saleType,
            quantity: item.quantity,
            unitPriceAtSale: unitPrice,
            totalAmount: totalAmount,
            status: 'confirmed',
          }
        });
        salesCreated.push(sale);

        // 2. Deduct Stock
        const newStock = product.stockUnits - quantityToDeduct;
        await tx.product.update({
          where: { id: product.id },
          data: { stockUnits: newStock }
        });

        // 3. Create Stock Movement Record
        await tx.stockMovement.create({
          data: {
            productId: product.id,
            movementType: 'sale',
            quantityChange: -quantityToDeduct,
            balanceAfter: newStock,
            performedBy: session.userId as string,
            notes: `Sold ${item.quantity} ${item.saleType}(s)`
          }
        });

        // 4. Low Stock Alert Generation if breached threshold
        if (newStock <= product.minStockThreshold) {
          // Check if unresolved alert already exists to prevent spam
          const existingAlert = await tx.alert.findFirst({
            where: { relatedProductId: product.id, isResolved: false, alertType: 'low_stock' }
          });
          if (!existingAlert) {
            await tx.alert.create({
              data: {
                alertType: 'low_stock',
                severity: newStock === 0 ? 'critical' : 'warning',
                title: `${product.name} is running low!`,
                description: `Stock has dropped to ${newStock} units. Minimum threshold is ${product.minStockThreshold}.`,
                relatedProductId: product.id,
              }
            });
          }
        }
      }
      return salesCreated;
    });

    return NextResponse.json({ success: true, message: 'Transaction completed successfully', sales: result }, { status: 201 });

  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error processing checkout' }, { status: 500 });
  }
}
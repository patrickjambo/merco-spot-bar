import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

const prisma = getPrisma();

export async function GET(request: Request) {
  try {
    const session = await verifySession();
    if (!session || session.role !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const products = await prisma.product.findMany({
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("Audit GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await verifySession();
    if (!session || session.role !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const adminId = session.userId as string;
    
    const body = await request.json();
    const { productId, actualCount, reason } = body;
    if (!productId || typeof actualCount !== 'number' || actualCount < 0) {
      return NextResponse.json({ error: "Invalid audit input" }, { status: 400 });
    }

    const updated = await prisma.$transaction(async (tx: any) => {
      const product = await tx.product.findUnique({
        where: { id: productId }
      });
      if (!product) throw new Error("Product not found");

      const diff = actualCount - product.stockUnits;

      if (diff !== 0) {
        // Update product stock
        await tx.product.update({
          where: { id: productId },
          data: { stockUnits: actualCount }
        });

        // Record stock movement (audit correction)
        await tx.stockMovement.create({
          data: {
            productId,
            movementType: "audit_correction",
            quantityChange: diff,
            balanceAfter: actualCount,
            notes: reason || "Manual Audit Adjustment",
            performedBy: adminId
          }
        });
        
        // Audit log
        await tx.auditLog.create({
          data: {
            userId: adminId,
            actionType: "STOCK_AUDIT",
            description: `Stock for ${product.name} changed from ${product.stockUnits} to ${actualCount} by audit. Diff: ${diff}`
          }
        });

        // Auto-resolve any low_stock alerts if stock is now sufficient
        if (actualCount > product.minStockThreshold) {
          await tx.alert.updateMany({
            where: {
              relatedProductId: productId,
              alertType: 'low_stock',
              isResolved: false
            },
            data: {
              isResolved: true,
              resolvedAt: new Date(),
              resolvedBy: adminId
            }
          });
        }
      }

      return await tx.product.findUnique({ where: { id: productId } });
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Audit POST Error:", error);
    return NextResponse.json({ error: "Update failed", details: error.message }, { status: 500 });
  }
}

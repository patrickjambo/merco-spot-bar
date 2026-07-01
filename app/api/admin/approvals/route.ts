import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Approve or reject a sale that the anomaly engine parked as `pending_approval`.
// Approve  -> atomically deduct stock, confirm the sale, log the movement, resolve alerts.
// Reject   -> void the sale (no stock was ever deducted), resolve alerts.
export async function POST(req: Request) {
  try {
    const session = await verifySession();
    if (!session || session.role !== "superadmin") {
      return NextResponse.json(
        { error: "Unauthorized. Only the owner can review approvals." },
        { status: 403 }
      );
    }

    const { saleId, action } = await req.json().catch(() => ({}));
    if (!saleId || (action !== "approve" && action !== "reject")) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const prisma = getPrisma();
    const adminId = session.userId as string;

    const result = await prisma.$transaction(async (tx: any) => {
      const sale = await tx.sale.findUnique({
        where: { id: saleId },
        include: { product: true },
      });
      if (!sale) throw new Error("Sale not found");
      if (sale.status !== "pending_approval") {
        throw new Error("This sale has already been reviewed.");
      }

      // Always clear the alert(s) that flagged this sale.
      const resolveAlerts = () =>
        tx.alert.updateMany({
          where: { relatedSaleId: sale.id, isResolved: false },
          data: { isResolved: true, resolvedAt: new Date(), resolvedBy: adminId },
        });

      if (action === "reject") {
        await tx.sale.update({
          where: { id: sale.id },
          data: { status: "voided", flagged: false },
        });
        await resolveAlerts();
        await tx.auditLog.create({
          data: {
            userId: adminId,
            actionType: "approval_reject",
            description: `Rejected pending sale ${sale.id} (${sale.quantity} ${sale.saleType} of ${sale.product.name}).`,
          },
        });
        return { action, saleId: sale.id };
      }

      // Approve: verify stock is still available now, then deduct.
      const unitsToDeduct =
        sale.saleType === "packet" ? sale.quantity * sale.product.packetSize : sale.quantity;
      if (sale.product.stockUnits < unitsToDeduct) {
        throw new Error(
          `Not enough stock to approve. Need ${unitsToDeduct}, have ${sale.product.stockUnits}.`
        );
      }
      const newStock = sale.product.stockUnits - unitsToDeduct;

      await tx.sale.update({
        where: { id: sale.id },
        data: { status: "confirmed", flagged: false },
      });
      await tx.product.update({
        where: { id: sale.product.id },
        data: { stockUnits: newStock },
      });
      await tx.stockMovement.create({
        data: {
          productId: sale.product.id,
          movementType: "sale",
          quantityChange: -unitsToDeduct,
          balanceAfter: newStock,
          performedBy: adminId,
          notes: `Approved pending sale ${sale.id}`,
        },
      });
      await resolveAlerts();

      // Keep low-stock alerting consistent with the normal checkout path.
      if (newStock <= sale.product.minStockThreshold) {
        const existing = await tx.alert.findFirst({
          where: { relatedProductId: sale.product.id, isResolved: false, alertType: "low_stock" },
        });
        if (!existing) {
          await tx.alert.create({
            data: {
              alertType: "low_stock",
              severity: newStock === 0 ? "critical" : "warning",
              title: `${sale.product.name} is running low!`,
              description: `Stock has dropped to ${newStock} units. Minimum threshold is ${sale.product.minStockThreshold}.`,
              relatedProductId: sale.product.id,
            },
          });
        }
      }

      await tx.auditLog.create({
        data: {
          userId: adminId,
          actionType: "approval_approve",
          description: `Approved pending sale ${sale.id} (${sale.quantity} ${sale.saleType} of ${sale.product.name}), deducted ${unitsToDeduct} units.`,
        },
      });

      return { action, saleId: sale.id };
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error("Approval error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process approval" },
      { status: 500 }
    );
  }
}

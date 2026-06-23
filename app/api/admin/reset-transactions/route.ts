import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Wipes the sales ledger so the owner can start a brand-new reporting period.
// Intentionally DOES NOT touch products, current stock levels, staff accounts,
// price history, or existing audit logs — only the transaction history is cleared.
export async function POST(req: Request) {
  try {
    const session = await verifySession();
    if (!session || session.role !== "superadmin") {
      return NextResponse.json(
        { error: "Unauthorized. Only the owner can reset transactions." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    if (body?.confirm !== "RESET") {
      return NextResponse.json(
        { error: "Confirmation phrase is required to reset transactions." },
        { status: 400 }
      );
    }

    const prisma = getPrisma();

    const cleared = await prisma.$transaction(async (tx: any) => {
      // Delete dependents before parents to satisfy foreign keys:
      // alerts can reference sales, so alerts must go first.
      const alerts = await tx.alert.deleteMany({});
      const sales = await tx.sale.deleteMany({});
      const movements = await tx.stockMovement.deleteMany({});
      const reconciliations = await tx.dailyReconciliation.deleteMany({});

      // Accountability trail: record who reset the books and what was removed.
      await tx.auditLog.create({
        data: {
          userId: (session.userId as string) || null,
          actionType: "reset_transactions",
          description: `Reset all transactions — cleared ${sales.count} sales, ${movements.count} stock movements, ${alerts.count} alerts, ${reconciliations.count} reconciliations.`,
        },
      });

      return {
        sales: sales.count,
        movements: movements.count,
        alerts: alerts.count,
        reconciliations: reconciliations.count,
      };
    });

    return NextResponse.json({ success: true, cleared });
  } catch (error: any) {
    console.error("Reset transactions error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to reset transactions" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Expected cash = confirmed sales by this manager since their last shift close
// (or since the start of today if they haven't closed a shift yet today).
async function computeExpected(tx: any, userId: string) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const lastClose = await tx.auditLog.findFirst({
    where: { userId, actionType: "shift_close" },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });

  const since =
    lastClose && lastClose.createdAt > startOfToday ? lastClose.createdAt : startOfToday;

  const sales = await tx.sale.findMany({
    where: { managerId: userId, status: "confirmed", createdAt: { gte: since } },
    select: { totalAmount: true },
  });

  const expectedCash = sales.reduce((sum: number, s: any) => sum + s.totalAmount, 0);
  return { expectedCash, salesCount: sales.length, since };
}

export async function GET() {
  try {
    const session = await verifySession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const prisma = getPrisma();
    const summary = await computeExpected(prisma, session.userId as string);
    return NextResponse.json(summary);
  } catch (error: any) {
    console.error("Close-shift summary error:", error);
    return NextResponse.json({ error: "Failed to load shift summary" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await verifySession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { countedCash } = await req.json().catch(() => ({}));
    const counted = Number(countedCash);
    if (!Number.isFinite(counted) || counted < 0) {
      return NextResponse.json({ error: "Enter a valid counted cash amount." }, { status: 400 });
    }

    const prisma = getPrisma();
    const userId = session.userId as string;
    const fullName = (session.fullName as string) || "Manager";

    // Recompute expected on the server (authoritative) and record the report.
    const { expectedCash, salesCount } = await computeExpected(prisma, userId);
    const difference = counted - expectedCash;
    const status = difference === 0 ? "balanced" : difference > 0 ? "over" : "short";

    await prisma.auditLog.create({
      data: {
        userId,
        actionType: "shift_close",
        description: `Shift closed by ${fullName}: expected ${expectedCash.toLocaleString()} RWF, counted ${counted.toLocaleString()} RWF, difference ${difference.toLocaleString()} RWF (${status}) across ${salesCount} sale(s).`,
      },
    });

    return NextResponse.json({
      success: true,
      expectedCash,
      countedCash: counted,
      difference,
      status,
      salesCount,
    });
  } catch (error: any) {
    console.error("Close-shift error:", error);
    return NextResponse.json({ error: "Failed to close shift" }, { status: 500 });
  }
}

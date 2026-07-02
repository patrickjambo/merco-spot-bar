import { getPrisma } from "@/lib/prisma";
import ActivityClient from "./ActivityClient";

export const dynamic = "force-dynamic";

export default async function ActivityPage() {
  const prisma = getPrisma();

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { user: { select: { fullName: true } } },
  });

  const data = logs.map((l: any) => ({
    id: l.id,
    actionType: l.actionType,
    description: l.description,
    createdAt: l.createdAt,
    user: l.user?.fullName || "System",
  }));

  return <ActivityClient logs={data} />;
}

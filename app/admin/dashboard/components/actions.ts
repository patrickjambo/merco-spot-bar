"use server";

import { getPrisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function dismissAlert(id: string) {
  const prisma = getPrisma();
  await prisma.alert.update({
    where: { id },
    data: { isResolved: true, resolvedAt: new Date() }
  });
  revalidatePath("/admin/dashboard");
}

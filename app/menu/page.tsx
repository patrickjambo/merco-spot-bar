import { getPrisma } from "@/lib/prisma";
import MenuClient from "./MenuClient";

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const prisma = getPrisma();
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { category: "asc" }
  });

  return <MenuClient products={products} />;
}

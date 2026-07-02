import { getPrisma } from "@/lib/prisma";
import MenuClient from "./MenuClient";
import { resolveProductImage, fallbackForCategory } from "@/lib/productImages";

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const prisma = getPrisma();
  const records = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { category: "asc" }
  });

  // Resolve a real, distinct image per product before rendering.
  const products = records.map((p: any) => ({
    ...p,
    imageUrl: resolveProductImage(p.imageUrl, p.category, p.name),
    fallbackUrl: fallbackForCategory(p.category),
  }));

  return <MenuClient products={products} />;
}

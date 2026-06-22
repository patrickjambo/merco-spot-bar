import { getPrisma } from "@/lib/prisma";
import POSClient from "./POSClient";

// Always render with fresh stock so the POS reflects the live database on every visit.
export const dynamic = "force-dynamic";

export default async function POSPage() {
  const prisma = getPrisma();

  // Fetch products on the server so the menu grid is already populated on first paint.
  // This removes the "No products found" flash caused by the old client-side fetch-on-mount.
  let initialProducts: any[] = [];
  try {
    initialProducts = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        category: true,
        pricePerUnit: true,
        pricePerPacket: true,
        packetSize: true,
        stockUnits: true,
        minStockThreshold: true,
      },
    });
  } catch (error) {
    console.error("Failed to load products for POS:", error);
  }

  return <POSClient initialProducts={initialProducts} />;
}

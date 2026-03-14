import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  const prisma = getPrisma();
  try {
    const params = await props.params;
    const body = await request.json();
    const updatedProduct = await prisma.product.update({
      where: { id: params.id },
      data: {
        name: body.name,
        category: body.category,
        brand: body.brand,
        pricePerUnit: body.pricePerUnit,
        pricePerPacket: body.pricePerPacket,
        packetSize: body.packetSize,
        stockUnits: body.stockUnits,
        minStockThreshold: body.minStockThreshold,
        isActive: body.isActive,
        imageUrl: body.imageUrl,
      },
    });
    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  const prisma = getPrisma();
  try {
    const params = await props.params;
    await prisma.product.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}

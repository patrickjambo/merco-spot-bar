import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { getPrisma } from '@/lib/prisma';

// This is the core "Anomaly Detection Engine" outlined in SRS Section 3.3
export async function POST(request: Request) {
  try {
    const prisma = getPrisma();
    const session = await verifySession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json();
    const { productId, saleType, quantity, unitPriceAtSale, totalAmount } = json;
    const managerId = session.userId as string;
    
    // 1. Initial Data Fetch & Validation
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Convert packet/unit semantics into actual single units to track stock linearly
    const unitsToDeduct = saleType === 'packet' ? quantity * product.packetSize : quantity;

    // 2. Alert Engine 3.3.6: Rapid Price-Change Exploit Alert
    const expectedTotal = quantity * unitPriceAtSale;
    if (Math.abs(expectedTotal - totalAmount) > 0.01) { // Floating point safety
      await createAlert({
        alertType: 'Price Manipulation',
        severity: 'critical',
        title: 'Price Mismatch Detected',
        description: `Manager attempted to record sale total ${totalAmount} which does not match qty * price (${expectedTotal}).`,
        managerId,
        productId
      });
      return NextResponse.json({ error: "Data integrity validation failed. Admin notified." }, { status: 400 });
    }

    // 3. Alert Engine 3.2: Prevent selling more than available & Low Stock
    if (product.stockUnits < unitsToDeduct) {
      return NextResponse.json({ error: "Insufficient stock." }, { status: 400 });
    }

    const newStockLevel = product.stockUnits - unitsToDeduct;
    if (newStockLevel <= product.minStockThreshold && newStockLevel > 0) {
      // Fire and forget low stock alert (soft warning)
      createAlert({
        alertType: 'Low Stock',
        severity: 'warning',
        title: `Low Stock: ${product.name}`,
        description: `Stock has dropped to ${newStockLevel} units, below threshold of ${product.minStockThreshold}.`,
        productId
      });
    }

    // 4. Alert Engine 3.3.8: Mass Quantity Sale Alert
    const MASS_QUANTITY_THRESHOLD = 50; // Business rule config
    if (unitsToDeduct > MASS_QUANTITY_THRESHOLD) {
      // Create pending sale for Super Admin approval
      const pendingSale = await prisma.sale.create({
        data: {
          managerId, productId, saleType, quantity, unitPriceAtSale, totalAmount,
          status: 'pending_approval', flagged: true, flagReason: 'Mass Quantity Threshold Exceeded'
        }
      });
      
      await createAlert({
        alertType: 'Mass Quantity',
        severity: 'critical',
        title: 'Mass Sale Requires Approval',
        description: `Manager attempted to sell ${unitsToDeduct} units of ${product.name} in a single order. Sale is pending.`,
        managerId, productId, saleId: pendingSale.id
      });
      
      return NextResponse.json({ message: "Sale submitted for approval. Waiting for authorization.", pending: true }, { status: 202 });
    }

    // 5. Alert Engine 3.3.3: Round-Number Sales Alert (Optional async check to keep request fast)
    checkRoundNumberPattern(managerId, productId, quantity);

    // Everything looks good: Transactional Execution
    const result = await prisma.$transaction(async (tx: any) => {
      // Create confirmed sale
      const sale = await tx.sale.create({
        data: {
          managerId, productId, saleType, quantity, unitPriceAtSale, totalAmount, status: 'confirmed'
        }
      });

      // Update product stock
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: { stockUnits: newStockLevel }
      });

      // Log movement as immutable trail
      await tx.stockMovement.create({
        data: {
          productId,
          movementType: 'sale',
          quantityChange: -unitsToDeduct,
          balanceAfter: newStockLevel,
          performedBy: managerId,
          notes: `Sale ID: ${sale.id}`
        }
      });

      return { sale, updatedProduct };
    });

    return NextResponse.json({ success: true, sale: result.sale }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Helpers for the engine
async function createAlert({ alertType, severity, title, description, managerId, productId, saleId }: any) {
  try {
    const prisma = getPrisma();
    await prisma.alert.create({
      data: {
        alertType, severity, title, description,
        relatedManagerId: managerId || null,
        relatedProductId: productId || null,
        relatedSaleId: saleId || null,
      }
    });
  } catch (e) {
    console.error("Failed to generate alert", e);
  }
}

// 3.3.3 Rule
async function checkRoundNumberPattern(managerId: string, productId: string, currentQuantity: number) {
  const prisma = getPrisma();
  // Logic: Check if last N sales have same exact round number
  const roundNumbers = [5, 10, 15, 20];
  if (!roundNumbers.includes(currentQuantity)) return;
  
  const recentSales = await prisma.sale.findMany({
    where: { managerId, productId, quantity: currentQuantity, status: 'confirmed' },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  if (recentSales.length === 5) {
     createAlert({
      alertType: 'Pattern Warning',
      severity: 'warning',
      title: 'Suspicious Round-Number Pattern',
      description: `Manager has recorded 5 consecutive sales of exactly ${currentQuantity} units.`,
      managerId, productId
    });
  }
}

// 3.3.9 Rule: Check for pattern anomalies in sales
async function checkPatternAnomalies(managerId: string, productId: string) {
  const prisma = getPrisma();
  // We check the last 5 sales by this manager for this product
  const recentSales = await prisma.sale.findMany({
    where: { managerId, productId, status: 'confirmed' },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  // If there are less than 5 sales, we cannot determine a pattern, so we exit
  if (recentSales.length < 5) return;

  // Extract the quantities from the recent sales
  const quantities = recentSales.map((sale: any) => sale.quantity);

  // Check for arithmetic progression (indicating possible intentional pattern)
  const diff = quantities[1] - quantities[0];
  const isArithmetic = quantities.every((qty: number, idx: number) => idx === 0 || qty - quantities[idx - 1] === diff);

  if (isArithmetic) {
     createAlert({
      alertType: 'Pattern Alert',
      severity: 'warning',
      title: 'Suspicious Sales Pattern Detected',
      description: `Manager has recorded sales with quantities following an arithmetic progression: ${quantities.join(', ')}.`,
      managerId, productId
    });
  }
}

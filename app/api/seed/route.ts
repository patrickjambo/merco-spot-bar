import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

const newProducts = [
  // CAT-001 Beers (Local)
  { name: 'Primus Beer 650ml', category: 'Beers (Local)', brand: 'Bralirwa', imageUrl: '/products/primus-650ml.jpg', packetSize: 24, pricePerPacket: 24000, pricePerUnit: 1000, stockUnits: 120, minStockThreshold: 24 },
  { name: 'Heineken 330ml', category: 'Beers (Local)', brand: 'Heineken', imageUrl: '/products/heineken-330ml.jpg', packetSize: 24, pricePerPacket: 24000, pricePerUnit: 1000, stockUnits: 120, minStockThreshold: 24 },
  { name: 'Amstel 330ml', category: 'Beers (Local)', brand: 'Bralirwa', imageUrl: '/products/amstel-330ml.jpg', packetSize: 24, pricePerPacket: 24000, pricePerUnit: 1000, stockUnits: 120, minStockThreshold: 24 },
  { name: 'Skol Beer 650ml', category: 'Beers (Local)', brand: 'Skol', imageUrl: '/products/skol-650ml.jpg', packetSize: 24, pricePerPacket: 24000, pricePerUnit: 1000, stockUnits: 120, minStockThreshold: 24 },
  { name: 'Skol Lager 330ml can', category: 'Beers (Local)', brand: 'Skol', imageUrl: '/products/skol-can-330ml.jpg', packetSize: 24, pricePerPacket: 24000, pricePerUnit: 1000, stockUnits: 120, minStockThreshold: 24 },
  { name: 'Virunga 650ml', category: 'Beers (Local)', brand: 'Skol', imageUrl: '/products/virunga-650ml.jpg', packetSize: 12, pricePerPacket: 12000, pricePerUnit: 1000, stockUnits: 48, minStockThreshold: 12 },
  
  // CAT-002 Soft Drinks & Water
  { name: 'Fanta Orange 300ml', category: 'Soft Drinks & Water', brand: 'Bralirwa', imageUrl: '/products/fanta-orange-300ml.jpg', packetSize: 24, pricePerPacket: 12000, pricePerUnit: 500, stockUnits: 120, minStockThreshold: 24 },
  { name: 'Inyange Water 500ml', category: 'Soft Drinks & Water', brand: 'Inyange', imageUrl: '/products/inyange-water-500ml.jpg', packetSize: 24, pricePerPacket: 7200, pricePerUnit: 300, stockUnits: 120, minStockThreshold: 24 },
  { name: 'Petit Mitzing 250ml', category: 'Soft Drinks & Water', brand: 'Bralirwa', imageUrl: '/products/petit-mitzing-250ml.jpg', packetSize: 24, pricePerPacket: 4800, pricePerUnit: 200, stockUnits: 48, minStockThreshold: 24 },
  { name: 'Big Mitzing 1L', category: 'Soft Drinks & Water', brand: 'Bralirwa', imageUrl: '/products/big-mitzing-1l.jpg', packetSize: 12, pricePerPacket: 12000, pricePerUnit: 1000, stockUnits: 24, minStockThreshold: 12 },

  // CAT-003 Spirits — Vodka
  { name: 'Smirnoff Ice 300ml', category: 'Spirits - Vodka', brand: 'Smirnoff', imageUrl: '/products/smirnoff-ice-300ml.jpg', packetSize: 12, pricePerPacket: 12000, pricePerUnit: 1000, stockUnits: 48, minStockThreshold: 12 },
  { name: 'Smirnoff Quarter 200ml', category: 'Spirits - Vodka', brand: 'Smirnoff', imageUrl: '/products/smirnoff-quarter-200ml.jpg', packetSize: 12, pricePerPacket: 9600, pricePerUnit: 800, stockUnits: 24, minStockThreshold: 12 },
  { name: 'Smirnoff 1L', category: 'Spirits - Vodka', brand: 'Smirnoff', imageUrl: '/products/smirnoff-1l.jpg', packetSize: 1, pricePerPacket: 15000, pricePerUnit: 15000, stockUnits: 5, minStockThreshold: 2 },
  { name: 'Absolute Vodka 700ml', category: 'Spirits - Vodka', brand: 'Absolut', imageUrl: '/products/absolut-vodka-700ml.jpg', packetSize: 1, pricePerPacket: 25000, pricePerUnit: 25000, stockUnits: 5, minStockThreshold: 2 },

  // CAT-004 Spirits — Gin
  { name: 'Beefeater Small 200ml', category: 'Spirits - Gin', brand: 'Beefeater', imageUrl: '/products/beefeater-small-200ml.jpg', packetSize: 12, pricePerPacket: 36000, pricePerUnit: 3000, stockUnits: 24, minStockThreshold: 6 },
  { name: 'Beefeater Big 750ml', category: 'Spirits - Gin', brand: 'Beefeater', imageUrl: '/products/beefeater-big-750ml.jpg', packetSize: 1, pricePerPacket: 45000, pricePerUnit: 45000, stockUnits: 5, minStockThreshold: 2 },
  { name: 'Dry Gin 750ml', category: 'Spirits - Gin', brand: 'Local', imageUrl: '/products/dry-gin-750ml.jpg', packetSize: 1, pricePerPacket: 6000, pricePerUnit: 6000, stockUnits: 10, minStockThreshold: 2 },
  { name: 'Gilbey\'s Small 200ml', category: 'Spirits - Gin', brand: 'Gilbey\'s', imageUrl: '/products/gilbeys-small-200ml.jpg', packetSize: 12, pricePerPacket: 24000, pricePerUnit: 2000, stockUnits: 24, minStockThreshold: 6 },
  { name: 'Gilbey\'s Big 750ml', category: 'Spirits - Gin', brand: 'Gilbey\'s', imageUrl: '/products/gilbeys-big-750ml.jpg', packetSize: 1, pricePerPacket: 15000, pricePerUnit: 15000, stockUnits: 5, minStockThreshold: 2 },
  { name: 'Golden Gin 750ml', category: 'Spirits - Gin', brand: 'Local', imageUrl: '/products/golden-gin-750ml.jpg', packetSize: 1, pricePerPacket: 8000, pricePerUnit: 8000, stockUnits: 5, minStockThreshold: 2 },

  // CAT-005 Spirits — Whiskey & Bourbon
  { name: 'Jack Daniel\'s 750ml', category: 'Spirits - Whiskey', brand: 'Jack Daniel\'s', imageUrl: '/products/jack-daniels-750ml.jpg', packetSize: 1, pricePerPacket: 55000, pricePerUnit: 55000, stockUnits: 5, minStockThreshold: 2 },
  { name: 'Black Label (J&B) 750ml', category: 'Spirits - Whiskey', brand: 'J&B', imageUrl: '/products/black-label-750ml.jpg', packetSize: 1, pricePerPacket: 60000, pricePerUnit: 60000, stockUnits: 5, minStockThreshold: 2 },
  { name: 'Jameson Big 750ml', category: 'Spirits - Whiskey', brand: 'Jameson', imageUrl: '/products/jameson-750ml.jpg', packetSize: 1, pricePerPacket: 50000, pricePerUnit: 50000, stockUnits: 5, minStockThreshold: 2 },
  { name: 'Double Black 750ml', category: 'Spirits - Whiskey', brand: 'Johnnie Walker', imageUrl: '/products/double-black-750ml.jpg', packetSize: 1, pricePerPacket: 70000, pricePerUnit: 70000, stockUnits: 2, minStockThreshold: 1 },
  { name: 'Local Wiskey 750ml', category: 'Spirits - Whiskey', brand: 'Local', imageUrl: '/products/local-whiskey-750ml.jpg', packetSize: 1, pricePerPacket: 5000, pricePerUnit: 5000, stockUnits: 10, minStockThreshold: 3 },

  // CAT-006 Spirits — Rum & Other
  { name: 'Bacardi 50cl', category: 'Spirits - Rum', brand: 'Bacardi', imageUrl: '/products/bacardi-50cl.jpg', packetSize: 1, pricePerPacket: 60000, pricePerUnit: 60000, stockUnits: 4, minStockThreshold: 1 },
  { name: 'Camino 750ml', category: 'Spirits - Rum', brand: 'Camino', imageUrl: '/products/camino-750ml.jpg', packetSize: 1, pricePerPacket: 42000, pricePerUnit: 42000, stockUnits: 5, minStockThreshold: 1 },
  { name: 'Leff 750ml', category: 'Spirits - Rum', brand: 'Local', imageUrl: '/products/leff-750ml.jpg', packetSize: 1, pricePerPacket: 4000, pricePerUnit: 4000, stockUnits: 5, minStockThreshold: 2 },
  { name: 'Amarula 750ml', category: 'Spirits - Rum', brand: 'Amarula', imageUrl: '/products/amarula-750ml.jpg', packetSize: 1, pricePerPacket: 35000, pricePerUnit: 35000, stockUnits: 5, minStockThreshold: 2 },

  // CAT-007 Beers (Premium Imported)
  { name: 'Red Bull 250ml', category: 'Premium Imported', brand: 'Red Bull', imageUrl: '/products/red-bull-250ml.jpg', packetSize: 24, pricePerPacket: 36000, pricePerUnit: 1500, stockUnits: 48, minStockThreshold: 12 },
  { name: 'Savana Dry 330ml', category: 'Premium Imported', brand: 'Savana', imageUrl: '/products/savana-dry-330ml.jpg', packetSize: 6, pricePerPacket: 9000, pricePerUnit: 1500, stockUnits: 24, minStockThreshold: 6 },
  { name: 'Bavaria 500ml', category: 'Premium Imported', brand: 'Bavaria', imageUrl: '/products/bavaria-500ml.jpg', packetSize: 24, pricePerPacket: 24000, pricePerUnit: 1000, stockUnits: 48, minStockThreshold: 12 },
  { name: 'Desperados 330ml', category: 'Premium Imported', brand: 'Desperados', imageUrl: '/products/desperados-330ml.jpg', packetSize: 6, pricePerPacket: 9000, pricePerUnit: 1500, stockUnits: 24, minStockThreshold: 6 },

  // CAT-008 Ciders & Alcopops
  { name: 'K Vant 300ml', category: 'Ciders & Alcopops', brand: 'K Vant', imageUrl: '/products/kvant-300ml.jpg', packetSize: 12, pricePerPacket: 12000, pricePerUnit: 1000, stockUnits: 24, minStockThreshold: 6 },
  { name: 'Small Kony 200ml', category: 'Ciders & Alcopops', brand: 'Kony', imageUrl: '/products/small-kony-200ml.jpg', packetSize: 24, pricePerPacket: 24000, pricePerUnit: 1000, stockUnits: 48, minStockThreshold: 12 },
  { name: 'Big Kony 500ml', category: 'Ciders & Alcopops', brand: 'Kony', imageUrl: '/products/big-kony-500ml.jpg', packetSize: 12, pricePerPacket: 24000, pricePerUnit: 2000, stockUnits: 24, minStockThreshold: 6 },
  { name: 'Jagamaster 700ml', category: 'Ciders & Alcopops', brand: 'Jagermeister', imageUrl: '/products/jagamaster-700ml.jpg', packetSize: 1, pricePerPacket: 35000, pricePerUnit: 35000, stockUnits: 5, minStockThreshold: 1 },

  // CAT-009 Wine & Champagne
  { name: 'Red Wine Bottle 750ml', category: 'Wine & Champagne', brand: 'House', imageUrl: '/products/red-wine-750ml.jpg', packetSize: 1, pricePerPacket: 55000, pricePerUnit: 55000, stockUnits: 10, minStockThreshold: 2 },
  { name: 'White Wine Bottle 750ml', category: 'Wine & Champagne', brand: 'House', imageUrl: '/products/white-wine-750ml.jpg', packetSize: 1, pricePerPacket: 55000, pricePerUnit: 55000, stockUnits: 10, minStockThreshold: 2 },
  { name: 'Champagne 750ml', category: 'Wine & Champagne', brand: 'House', imageUrl: '/products/champagne-750ml.jpg', packetSize: 1, pricePerPacket: 85000, pricePerUnit: 85000, stockUnits: 5, minStockThreshold: 1 },

  // CAT-010 Cigarettes
  { name: 'Dunhill', category: 'Cigarettes', brand: 'Dunhill', imageUrl: '/products/dunhill.jpg', packetSize: 10, pricePerPacket: 50000, pricePerUnit: 5000, stockUnits: 20, minStockThreshold: 5 },
  { name: 'Bond 7 Small', category: 'Cigarettes', brand: 'Bond 7', imageUrl: '/products/bond7-small.jpg', packetSize: 20, pricePerPacket: 40000, pricePerUnit: 2000, stockUnits: 40, minStockThreshold: 10 },
  { name: 'Bond 7 Big', category: 'Cigarettes', brand: 'Bond 7', imageUrl: '/products/bond7-big.jpg', packetSize: 10, pricePerPacket: 40000, pricePerUnit: 4000, stockUnits: 20, minStockThreshold: 5 },

  // CAT-011 Juice
  { name: 'Inyange Juice 500ml', category: 'Juice', brand: 'Inyange', imageUrl: '/products/inyange-juice-500ml.jpg', packetSize: 12, pricePerPacket: 6000, pricePerUnit: 500, stockUnits: 24, minStockThreshold: 6 },
];

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const prisma = getPrisma();
    
    // Check users
    const userCount = await prisma.user.count();
    let admin, manager;
    
    if (userCount === 0) {
      const passwordHash = await bcrypt.hash("eric@123?", 10);
      admin = await prisma.user.create({
        data: { fullName: "Eric Mwiseneza", username: "superadmin", email: "ericmwiseneza@gmail.com", passwordHash, role: "superadmin" }
      });
      manager = await prisma.user.create({
        data: { fullName: "Test Manager", username: "manager1", email: "manager1@mericospot.com", passwordHash, role: "manager" }
      });
    }

    const productCount = await prisma.product.count();
    
    if (productCount < newProducts.length) {
      for (const prod of newProducts) {
        await prisma.product.upsert({
          where: { id: prod.name.replace(/\s+/g, '-').toLowerCase() }, // Fake ID for upsert check, better to use first/create check
          update: {},
          create: prod,
        }).catch(async (e: any) => {
             // If schema didn't have special ID, we just do create if it doesn't exist
             const exists = await prisma.product.findFirst({ where: { name: prod.name }});
             if (!exists) {
                 await prisma.product.create({ data: prod });
             }
        });
      }
    }

    return NextResponse.json({ message: "Successfully seeded directly via API." });
  } catch (error: any) {
    console.error("Seeding error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

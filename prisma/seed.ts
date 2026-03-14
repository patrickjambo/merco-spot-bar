import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

// Ensure you instantiate PrismaClient properly.  In some setups you need {} or explicit configuration.
const prisma = new PrismaClient({});

async function main() {
  console.log("Seeding Database...")

  // 1. Create Default Users (Super Admin and a Manager)
  const superAdmin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      fullName: 'System Administrator',
      username: 'admin',
      passwordHash: 'hashed_password_placeholder', // Normally bcrypt
      role: 'superadmin',
    },
  })

  const manager = await prisma.user.upsert({
    where: { username: 'manager1' },
    update: {},
    create: {
      fullName: 'John Doe',
      username: 'manager1',
      passwordHash: 'hashed_password_placeholder', 
      role: 'manager',
      shiftStart: '08:00',
      shiftEnd: '17:00',
      createdBy: superAdmin.id
    },
  })

  // 2. Create Products (Bralirwa beverages + Food explicitly requested in SRS)
  const products = [
    {
      name: "Primus",
      brand: "Bralirwa",
      category: "Alcoholic",
      packetSize: 24,
      pricePerUnit: 800,
      pricePerPacket: 19200,
      stockUnits: 150,
      minStockThreshold: 48 // 2 crates
    },
    {
      name: "Heineken",
      brand: "Bralirwa",
      category: "Alcoholic",
      packetSize: 24,
      pricePerUnit: 1500,
      pricePerPacket: 36000,
      stockUnits: 120,
      minStockThreshold: 24
    },
    {
      name: "Skol Lager",
      brand: "Skol",
      category: "Alcoholic",
      packetSize: 24,
      pricePerUnit: 800,
      pricePerPacket: 19200,
      stockUnits: 100,
      minStockThreshold: 24
    },
    {
      name: "Fanta Orange",
      brand: "Bralirwa",
      category: "Non-Alcoholic",
      packetSize: 24,
      pricePerUnit: 500,
      pricePerPacket: 12000,
      stockUnits: 200,
      minStockThreshold: 48
    },
    {
      name: "Gourmet Burger",
      brand: "House Menu",
      category: "Food",
      packetSize: 1, // Food doesn't use packets usually
      pricePerUnit: 4500,
      pricePerPacket: 4500,
      stockUnits: 50,
      minStockThreshold: 10
    }
  ];

  for (const p of products) {
    await prisma.product.create({
      data: p
    });
  }

  console.log(`Seeded 1 Super Admin, 1 Manager, and ${products.length} Products!`)
  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

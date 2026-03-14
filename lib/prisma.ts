import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export function getPrisma() {
  if (!globalForPrisma.prisma) {
    const connectionString = `${process.env.DATABASE_URL}`;
    // Optimize connection pool for production deployment
    const pool = new Pool({ 
      connectionString,
      max: process.env.NODE_ENV === 'production' ? 20 : 1
    });
    const adapter = new PrismaPg(pool as any);
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }
  return globalForPrisma.prisma;
}

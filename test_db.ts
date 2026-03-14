import { PrismaClient } from '@prisma/client'; const prisma = new PrismaClient(); async function main() { const users = await prisma.user.count(); console.log('Users:', users); } main();

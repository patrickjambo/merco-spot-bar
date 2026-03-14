import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const defaultPassword = 'eric@123?';
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);
  
  const admin = await prisma.user.upsert({
    where: { username: 'ericmwiseneza@gmail.com' },
    update: {},
    create: {
      fullName: 'Eric Mwiseneza',
      username: 'ericmwiseneza@gmail.com',
      passwordHash: hashedPassword,
      role: 'superadmin',
    },
  });
  console.log(`✅ Success! Admin created with username: ${admin.username}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());

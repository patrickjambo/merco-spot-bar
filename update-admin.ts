import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Instantiate correctly for Next.js or newer Prisma
const prisma = new PrismaClient({ log: ['info'] });

async function main() {
  const passwordHash = await bcrypt.hash("eric@123?", 10);
  
  // Find superadmin
  const admin = await prisma.user.findFirst({
    where: { role: 'superadmin' }
  });

  if (admin) {
    await prisma.user.update({
      where: { id: admin.id },
      data: {
        email: "ericmwiseneza@gmail.com",
        passwordHash
      }
    });
    console.log("Super admin updated successfully.");
  } else {
    await prisma.user.create({
      data: {
        fullName: "Eric Mwiseneza",
        username: "ericmwiseneza",
        email: "ericmwiseneza@gmail.com",
        passwordHash,
        role: "superadmin"
      }
    });
    console.log("Super admin created successfully.");
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

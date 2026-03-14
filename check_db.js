const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient({}); async function m() { console.log('Users: ' + await prisma.user.count()); } m();

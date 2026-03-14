const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.product.findMany({ take: 5 }).then(d => {
  d.forEach(x => console.log(x.name, x.imageUrl));
}).finally(() => p.$disconnect());

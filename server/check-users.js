const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany();
  console.log("USERS IN DB:", users.length);
  users.forEach(u => console.log(u.name, u.email, u.registerNumber));
}

check().catch(console.error).finally(() => prisma.$disconnect());

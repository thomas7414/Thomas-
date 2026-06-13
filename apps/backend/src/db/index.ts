import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

// Handle Prisma connection errors
prisma.$connect().catch((err) => {
  console.error('Failed to connect to database:', err);
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const books = await prisma.book.findMany({
    select: { language: true },
    distinct: ['language']
  });
  console.log('Languages in DB:', books.map(b => b.language));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

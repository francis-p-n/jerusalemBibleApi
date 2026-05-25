import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const verses = await prisma.verse.findMany({
    where: {
      bookSlug: {
        contains: "corin"
      },
      chapterNum: 13
    },
    orderBy: {
      number: 'asc'
    }
  });

  if (verses.length === 0) {
    console.log("No verses found for 1 Corinthians 13.");
    return;
  }

  // Group by bookSlug just in case
  console.log(`\n--- 1 Corinthians 13 ---`);
  const v1Cor = verses.filter(v => v.bookSlug.includes('1'));
  
  v1Cor.forEach((v: any) => {
    console.log(`[${v.number}] ${v.text}`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });

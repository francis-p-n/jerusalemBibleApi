import { exec } from 'child_process';
import { promisify } from 'util';
import * as cheerio from 'cheerio';
import { PrismaClient } from '@prisma/client';

const execAsync = promisify(exec);
const prisma = new PrismaClient();

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchHtml(url: string) {
  try {
    const { stdout } = await execAsync(`curl.exe -s ${url} -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"`, { maxBuffer: 1024 * 1024 * 10 });
    return stdout;
  } catch (error) {
    console.error(`Failed to fetch ${url}:`, error);
    return null;
  }
}

async function scrapeMainPage() {
  const html = await fetchHtml('http://morningstarinfosys.com/jerusalem-bible/');
  if (!html) return [];

  const $ = cheerio.load(html);
  const links: { title: string, url: string, groupTitle: string }[] = [];
  
  let currentGroup = '';

  $('.entry-content').children().each((_, el) => {
    const $el = $(el);
    if ($el.is('h2') || $el.is('h3')) {
      currentGroup = $el.text().trim();
    } else if ($el.is('p')) {
      const anchor = $el.find('a');
      if (anchor.length > 0) {
        const href = anchor.attr('href');
        const text = anchor.text().trim();
        if (href && href.includes('morningstarinfosys.com/jerusalem-bible/')) {
          links.push({ title: text, url: href, groupTitle: currentGroup });
        }
      }
    }
  });

  return links;
}

function mapGenre(groupTitle: string): string {
  const gt = groupTitle.toUpperCase();
  if (gt.includes('PENTATEUCH')) return 'Pentateuch';
  if (gt.includes('HISTORICAL')) return 'Historical';
  if (gt.includes('WISDOM')) return 'Wisdom';
  if (gt.includes('PROPHETS')) return 'Prophets';
  if (gt.includes('SAINTS') || gt.includes('GOSPELS')) return 'Gospels';
  if (gt.includes('LETTERS')) return 'Epistles';
  return 'Historical'; // Fallback
}

function mapTestament(groupTitle: string): string {
  const gt = groupTitle.toUpperCase();
  if (gt.includes('SAINTS') || gt.includes('LETTERS') || gt.includes('GOSPELS') || gt.includes('PAUL')) {
    return 'New';
  }
  return 'Old';
}

function getShortName(title: string): string {
  return title.replace('THE BOOK OF ', '').replace('THE FIRST BOOK OF ', '1 ').replace('THE SECOND BOOK OF ', '2 ').trim();
}

async function scrapeBook(url: string) {
  const html = await fetchHtml(url);
  if (!html) return null;
  const $ = cheerio.load(html);
  
  const content = $('.entry-content');
  const paragraphs = content.find('p').map((_, el) => $(el).text().trim()).get().filter(t => t.length > 0);
  
  const parsedChapters = new Map<number, { number: number, text: string }[]>();

  let currentChapter = -1;

  for (const p of paragraphs) {
    // Match "JB GENESIS Chapter 1" or similar
    const chapterMatch = p.match(/Chapter\s+(\d+)/i);
    if (chapterMatch && p.toUpperCase().includes('JB ')) {
      currentChapter = parseInt(chapterMatch[1], 10);
      if (!parsedChapters.has(currentChapter)) {
        parsedChapters.set(currentChapter, []);
      }
      continue;
    }

    // Match verse e.g. "1:1 In the beginning..."
    const verseMatch = p.match(/^(\d+):(\d+)\s+(.+)$/);
    if (verseMatch) {
      const chap = parseInt(verseMatch[1], 10);
      const verseNum = parseInt(verseMatch[2], 10);
      const verseText = verseMatch[3].trim();
      
      if (currentChapter === -1) {
          currentChapter = chap;
      }
      
      if (!parsedChapters.has(chap)) {
        parsedChapters.set(chap, []);
      }
      parsedChapters.get(chap)!.push({ number: verseNum, text: verseText });
    }
  }

  return Array.from(parsedChapters.entries()).map(([chapterNum, verses]) => ({
    number: chapterNum,
    verses
  })).sort((a, b) => a.number - b.number);
}

async function run() {
  console.log('Scraping main page...');
  const bookLinks = await scrapeMainPage();
  console.log(`Found ${bookLinks.length} books.`);

  // Clean the database first (optional, but good for idempotency)
  await prisma.verse.deleteMany({});
  await prisma.chapter.deleteMany({});
  await prisma.book.deleteMany({});

  for (let i = 0; i < bookLinks.length; i++) {
    const link = bookLinks[i];
    const slug = link.url.split('/').filter(Boolean).pop() || `book-${i}`;
    
    // Check if ACTS or REVELATION for genre override
    let genre = mapGenre(link.groupTitle);
    if (link.title.toUpperCase().includes('ACTS')) genre = 'Acts';
    if (link.title.toUpperCase().includes('REVELATION')) genre = 'Revelation';
    
    const testament = mapTestament(link.groupTitle);
    
    console.log(`[${i+1}/${bookLinks.length}] Scraping ${link.title} (${link.url})...`);
    
    const chaptersData = await scrapeBook(link.url);
    if (!chaptersData) continue;
    
    const book = await prisma.book.create({
      data: {
        name: link.title,
        slug: slug,
        shortName: getShortName(link.title),
        genre,
        testament,
        order: i + 1,
        chaptersCount: chaptersData.length
      }
    });

    for (const chapterData of chaptersData) {
      const chapter = await prisma.chapter.create({
        data: {
          bookId: book.id,
          number: chapterData.number,
          versesCount: chapterData.verses.length
        }
      });

      if (chapterData.verses.length > 0) {
        await prisma.verse.createMany({
          data: chapterData.verses.map(v => ({
            chapterId: chapter.id,
            number: v.number,
            text: v.text,
            bookSlug: slug,
            chapterNum: chapter.number
          }))
        });
      }
    }
    
    console.log(`Saved ${link.title}: ${chaptersData.length} chapters.`);
    await sleep(500); // delay to avoid rate-limiting
  }
  
  console.log('Done!');
}

run().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(() => {
  prisma.$disconnect();
});

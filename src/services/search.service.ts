import prisma from '../config/database';

export interface SearchOptions {
  query: string;
  bookSlug?: string;
  testament?: string;
  limit?: number;
  offset?: number;
  language?: string;
}

export class SearchService {
  /**
   * Searches for keywords in the Bible verses.
   */
  async search(options: SearchOptions) {
    const { query, bookSlug, testament, language = 'en', limit = 20, offset = 0 } = options;
    if (!query || !query.trim()) {
      return { total: 0, results: [] };
    }

    const cleanQuery = query.trim();

    // Build the query where clause
    const where: any = {
      text: {
        contains: cleanQuery,
      },
      language,
    };

    // Filter by book if specified
    if (bookSlug) {
      where.bookSlug = {
        equals: bookSlug.toLowerCase(),
      };
    }

    // Filter by testament if specified
    if (testament) {
      where.chapter = {
        book: {
          testament: {
            equals: testament,
            mode: 'insensitive',
          },
        },
      };
    }

    // Get matches count and records in parallel for speed
    const [total, verses] = await Promise.all([
      prisma.verse.count({ where }),
      prisma.verse.findMany({
        where,
        take: Math.min(limit, 100), // Cap limit to 100 max
        skip: offset,
        include: {
          chapter: {
            include: {
              book: true,
            },
          },
        },
        orderBy: [
          { chapter: { book: { order: 'asc' } } },
          { chapterNum: 'asc' },
          { number: 'asc' },
        ],
      }),
    ]);

    // Format the results beautifully
    const results = verses.map(v => ({
      reference: `${v.chapter.book.name} ${v.chapterNum}:${v.number}`,
      bookName: v.chapter.book.name,
      bookSlug: v.bookSlug,
      chapter: v.chapterNum,
      verse: v.number,
      text: v.text,
    }));

    return {
      total,
      results,
    };
  }
}

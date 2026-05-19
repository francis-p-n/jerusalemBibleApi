"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BibleService = void 0;
const database_1 = __importDefault(require("../config/database"));
const referenceParser_1 = require("../utils/referenceParser");
class BibleService {
    /**
     * Retrieves all books, optionally filtered by testament or genre.
     */
    async getBooks(testament, genre) {
        const where = {};
        if (testament) {
            where.testament = { equals: testament, mode: 'insensitive' };
        }
        if (genre) {
            where.genre = { equals: genre, mode: 'insensitive' };
        }
        return database_1.default.book.findMany({
            where,
            orderBy: { order: 'asc' },
        });
    }
    /**
     * Finds a book by matching its name, slug, or short name using a fuzzy normalized match.
     */
    async findBookByQuery(bookQuery) {
        const normalizedQuery = (0, referenceParser_1.normalizeString)(bookQuery);
        if (!normalizedQuery)
            return null;
        const allBooks = await database_1.default.book.findMany();
        // 1. Direct Slug/Name match
        let found = allBooks.find(b => (0, referenceParser_1.normalizeString)(b.slug) === normalizedQuery || (0, referenceParser_1.normalizeString)(b.name) === normalizedQuery);
        // 2. Short name match
        if (!found) {
            found = allBooks.find(b => (0, referenceParser_1.normalizeString)(b.shortName) === normalizedQuery);
        }
        // 3. Prefix/Partial match (e.g. "1macc" -> "1maccabees", "wisdom" -> "wisdom")
        if (!found) {
            found = allBooks.find(b => (0, referenceParser_1.normalizeString)(b.slug).startsWith(normalizedQuery) ||
                (0, referenceParser_1.normalizeString)(b.name).startsWith(normalizedQuery));
        }
        return found || null;
    }
    /**
     * Gets details of a book, including its chapters.
     */
    async getBookDetails(slug) {
        const book = await this.findBookByQuery(slug);
        if (!book)
            return null;
        const chapters = await database_1.default.chapter.findMany({
            where: { bookId: book.id },
            orderBy: { number: 'asc' },
        });
        return {
            ...book,
            chapters,
        };
    }
    /**
     * Retrieves verses for a given passage reference.
     */
    async getPassage(refStr) {
        const parsedRef = (0, referenceParser_1.parseReference)(refStr);
        if (!parsedRef) {
            throw new Error(`Could not parse bible reference format.`);
        }
        const book = await this.findBookByQuery(parsedRef.bookQuery);
        if (!book) {
            throw new Error(`Book not found matching: "${parsedRef.bookQuery}"`);
        }
        let verses = [];
        let referenceLabel = '';
        const { startChapter, startVerse, endChapter, endVerse, isRange, isMultiChapter } = parsedRef;
        if (isMultiChapter) {
            const lastChapter = endChapter || startChapter;
            if (startVerse && endVerse) {
                // Multi-chapter range spanning verses, e.g., Genesis 1:26 - 2:3
                verses = await database_1.default.verse.findMany({
                    where: {
                        bookSlug: book.slug,
                        OR: [
                            { chapterNum: startChapter, number: { gte: startVerse } },
                            { chapterNum: lastChapter, number: { lte: endVerse } },
                            { chapterNum: { gt: startChapter, lt: lastChapter } },
                        ],
                    },
                    orderBy: [{ chapterNum: 'asc' }, { number: 'asc' }],
                });
                referenceLabel = `${book.name} ${startChapter}:${startVerse} - ${lastChapter}:${endVerse}`;
            }
            else {
                // Multi-chapter range without verses, e.g. Genesis 1-3
                verses = await database_1.default.verse.findMany({
                    where: {
                        bookSlug: book.slug,
                        chapterNum: { gte: startChapter, lte: lastChapter },
                    },
                    orderBy: [{ chapterNum: 'asc' }, { number: 'asc' }],
                });
                referenceLabel = `${book.name} ${startChapter} - ${lastChapter}`;
            }
        }
        else {
            // Single chapter queries
            if (startVerse) {
                if (isRange && endVerse) {
                    // Verse range, e.g., John 3:16-18
                    verses = await database_1.default.verse.findMany({
                        where: {
                            bookSlug: book.slug,
                            chapterNum: startChapter,
                            number: { gte: startVerse, lte: endVerse },
                        },
                        orderBy: { number: 'asc' },
                    });
                    referenceLabel = `${book.name} ${startChapter}:${startVerse}-${endVerse}`;
                }
                else {
                    // Single verse, e.g., John 3:16
                    verses = await database_1.default.verse.findMany({
                        where: {
                            bookSlug: book.slug,
                            chapterNum: startChapter,
                            number: startVerse,
                        },
                    });
                    referenceLabel = `${book.name} ${startChapter}:${startVerse}`;
                }
            }
            else {
                // Whole chapter, e.g., John 3
                verses = await database_1.default.verse.findMany({
                    where: {
                        bookSlug: book.slug,
                        chapterNum: startChapter,
                    },
                    orderBy: { number: 'asc' },
                });
                referenceLabel = `${book.name} ${startChapter}`;
            }
        }
        return {
            reference: referenceLabel,
            book: {
                id: book.id,
                name: book.name,
                slug: book.slug,
                shortName: book.shortName,
                testament: book.testament,
                genre: book.genre,
            },
            verses: verses.map(v => ({
                number: v.number,
                chapter: v.chapterNum,
                text: v.text,
            })),
        };
    }
}
exports.BibleService = BibleService;

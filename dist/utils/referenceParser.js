"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseReference = exports.normalizeString = void 0;
/**
 * Normalizes strings by converting to lowercase and stripping non-alphanumeric characters.
 * Useful for matching abbreviations like "1Macc" to "1-maccabees".
 */
const normalizeString = (s) => {
    return s.toLowerCase().replace(/[^a-z0-9]/g, '');
};
exports.normalizeString = normalizeString;
/**
 * Robustly parses a scripture reference string.
 * Examples:
 * - "John 3:16" -> book: "John", startChapter: 3, startVerse: 16
 * - "John 3:16-18" -> book: "John", startChapter: 3, startVerse: 16, endVerse: 18, isRange: true
 * - "Genesis 1:1 - 2:3" -> book: "Genesis", startChapter: 1, startVerse: 1, endChapter: 2, endVerse: 3, isRange: true, isMultiChapter: true
 * - "Wisdom 3" -> book: "Wisdom", startChapter: 3 (gets full chapter)
 * - "Genesis 1-3" -> book: "Genesis", startChapter: 1, endChapter: 3 (gets chapter ranges)
 */
const parseReference = (refStr) => {
    const cleanRef = refStr.trim().replace(/\s+/g, ' ');
    if (!cleanRef)
        return null;
    // Pattern 1: Spanning multiple chapters, e.g., "Gen 1:26 - 2:3" or "Gen 1:26-2:3"
    const multiChapterRegex = /^(.+?)\s+(\d+)\s*:\s*(\d+)\s*-\s*(\d+)\s*:\s*(\d+)$/;
    const multiChapterMatch = cleanRef.match(multiChapterRegex);
    if (multiChapterMatch) {
        return {
            bookQuery: multiChapterMatch[1].trim(),
            startChapter: parseInt(multiChapterMatch[2], 10),
            startVerse: parseInt(multiChapterMatch[3], 10),
            endChapter: parseInt(multiChapterMatch[4], 10),
            endVerse: parseInt(multiChapterMatch[5], 10),
            isRange: true,
            isMultiChapter: true,
        };
    }
    // Pattern 2: Single chapter with a verse range, or single verse, or just a chapter
    // We capture the book name first (everything before the first number trailing a space)
    const generalRegex = /^(.+?)\s+(\d+)(.*)$/;
    const generalMatch = cleanRef.match(generalRegex);
    if (!generalMatch) {
        // If there are no numbers at all, it's just a book name (e.g. "Genesis")
        return {
            bookQuery: cleanRef,
            startChapter: 1,
            isRange: false,
            isMultiChapter: false,
        };
    }
    const bookQuery = generalMatch[1].trim();
    const startChapter = parseInt(generalMatch[2], 10);
    const remainder = generalMatch[3].trim();
    // If there's no remainder, it's just a chapter (e.g., "John 3")
    if (!remainder) {
        return {
            bookQuery,
            startChapter,
            isRange: false,
            isMultiChapter: false,
        };
    }
    // Remainder could be:
    // - ":16" (single verse)
    // - ":16-18" (verse range)
    // - "-5" (chapter range, e.g. "Genesis 1-3" -> remainder is "-3")
    // Check if it's a chapter range (starts with dash and has a number, no colons)
    const chapRangeMatch = remainder.match(/^-\s*(\d+)$/);
    if (chapRangeMatch) {
        return {
            bookQuery,
            startChapter,
            endChapter: parseInt(chapRangeMatch[1], 10),
            isRange: true,
            isMultiChapter: true,
        };
    }
    // Check if it's a verse structure (starts with colon)
    if (remainder.startsWith(':')) {
        const versePart = remainder.substring(1).trim();
        // Check for verse range, e.g., "16-18"
        const verseRangeMatch = versePart.match(/^(\d+)\s*-\s*(\d+)$/);
        if (verseRangeMatch) {
            return {
                bookQuery,
                startChapter,
                startVerse: parseInt(verseRangeMatch[1], 10),
                endVerse: parseInt(verseRangeMatch[2], 10),
                isRange: true,
                isMultiChapter: false,
            };
        }
        // Check for single verse, e.g., "16"
        const singleVerseMatch = versePart.match(/^(\d+)$/);
        if (singleVerseMatch) {
            return {
                bookQuery,
                startChapter,
                startVerse: parseInt(singleVerseMatch[1], 10),
                isRange: false,
                isMultiChapter: false,
            };
        }
    }
    // Fallback: if we can't parse the rest, just return the chapter
    return {
        bookQuery,
        startChapter,
        isRange: false,
        isMultiChapter: false,
    };
};
exports.parseReference = parseReference;

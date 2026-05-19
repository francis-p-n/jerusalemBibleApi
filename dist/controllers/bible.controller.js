"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPassage = exports.getBookDetails = exports.getBooks = void 0;
const bible_service_1 = require("../services/bible.service");
const response_1 = require("../utils/response");
const bibleService = new bible_service_1.BibleService();
const getBooks = async (req, res, next) => {
    const startTime = Date.now();
    try {
        const { testament, genre } = req.query;
        const books = await bibleService.getBooks(testament, genre);
        return (0, response_1.sendSuccess)(res, books, 200, undefined, startTime);
    }
    catch (error) {
        return next(error);
    }
};
exports.getBooks = getBooks;
const getBookDetails = async (req, res, next) => {
    const startTime = Date.now();
    try {
        const { slug } = req.params;
        const book = await bibleService.getBookDetails(slug);
        if (!book) {
            return (0, response_1.sendError)(res, `Book not found: "${slug}"`, 404, 'BOOK_NOT_FOUND');
        }
        return (0, response_1.sendSuccess)(res, book, 200, undefined, startTime);
    }
    catch (error) {
        return next(error);
    }
};
exports.getBookDetails = getBookDetails;
const getPassage = async (req, res) => {
    const startTime = Date.now();
    try {
        const { ref } = req.query;
        if (!ref || typeof ref !== 'string') {
            return (0, response_1.sendError)(res, 'Missing required query parameter "ref". Example: /api/v1/bible/passage?ref=John+3:16', 400, 'MISSING_REFERENCE');
        }
        const passage = await bibleService.getPassage(ref);
        return (0, response_1.sendSuccess)(res, passage, 200, undefined, startTime);
    }
    catch (error) {
        return (0, response_1.sendError)(res, error.message, 400, 'INVALID_REFERENCE');
    }
};
exports.getPassage = getPassage;

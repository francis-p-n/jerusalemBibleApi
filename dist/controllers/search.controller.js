"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchBible = void 0;
const search_service_1 = require("../services/search.service");
const response_1 = require("../utils/response");
const searchService = new search_service_1.SearchService();
const searchBible = async (req, res, next) => {
    const startTime = Date.now();
    try {
        const { q, book, testament, limit, offset } = req.query;
        if (!q || typeof q !== 'string' || !q.trim()) {
            return (0, response_1.sendError)(res, 'Missing required query parameter "q" for searching. Example: /api/v1/search?q=shepherd', 400, 'MISSING_QUERY');
        }
        const parsedLimit = limit ? parseInt(limit, 10) : 20;
        const parsedOffset = offset ? parseInt(offset, 10) : 0;
        const result = await searchService.search({
            query: q,
            bookSlug: book,
            testament: testament,
            limit: parsedLimit,
            offset: parsedOffset,
        });
        const pagination = {
            total: result.total,
            limit: parsedLimit,
            offset: parsedOffset,
        };
        return (0, response_1.sendSuccess)(res, result.results, 200, pagination, startTime);
    }
    catch (error) {
        return next(error);
    }
};
exports.searchBible = searchBible;

import { Request, Response, NextFunction } from 'express';
import { SearchService } from '../services/search.service';
import { sendSuccess, sendError } from '../utils/response';

const searchService = new SearchService();

export const searchBible = async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  try {
    const { q, book, testament, limit, offset } = req.query;

    if (!q || typeof q !== 'string' || !q.trim()) {
      return sendError(
        res,
        'Missing required query parameter "q" for searching. Example: /api/v1/search?q=shepherd',
        400,
        'MISSING_QUERY'
      );
    }

    const parsedLimit = limit ? parseInt(limit as string, 10) : 20;
    const parsedOffset = offset ? parseInt(offset as string, 10) : 0;

    const result = await searchService.search({
      query: q,
      bookSlug: book as string | undefined,
      testament: testament as string | undefined,
      limit: parsedLimit,
      offset: parsedOffset,
    });

    const pagination = {
      total: result.total,
      limit: parsedLimit,
      offset: parsedOffset,
    };

    return sendSuccess(res, result.results, 200, pagination, startTime);
  } catch (error) {
    return next(error);
  }
};

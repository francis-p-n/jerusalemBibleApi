import { Request, Response, NextFunction } from 'express';
import { BibleService } from '../services/bible.service';
import { sendSuccess, sendError } from '../utils/response';

const bibleService = new BibleService();

export const getBooks = async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  try {
    const { testament, genre } = req.query;
    const books = await bibleService.getBooks(
      testament as string | undefined,
      genre as string | undefined
    );
    return sendSuccess(res, books, 200, undefined, startTime);
  } catch (error) {
    return next(error);
  }
};

export const getBookDetails = async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  try {
    const { slug } = req.params;
    const book = await bibleService.getBookDetails(slug as string);
    if (!book) {
      return sendError(res, `Book not found: "${slug}"`, 404, 'BOOK_NOT_FOUND');
    }
    return sendSuccess(res, book, 200, undefined, startTime);
  } catch (error) {
    return next(error);
  }
};

export const getPassage = async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    const { ref } = req.query;
    if (!ref || typeof ref !== 'string') {
      return sendError(
        res,
        'Missing required query parameter "ref". Example: /api/v1/bible/passage?ref=John+3:16',
        400,
        'MISSING_REFERENCE'
      );
    }

    const passage = await bibleService.getPassage(ref);
    return sendSuccess(res, passage, 200, undefined, startTime);
  } catch (error) {
    return sendError(res, (error as Error).message, 400, 'INVALID_REFERENCE');
  }
};


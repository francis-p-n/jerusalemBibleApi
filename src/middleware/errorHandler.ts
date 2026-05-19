import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error(`[Error Handler] Caught exception:`, err);

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'An unexpected error occurred on the server.';
  const code = err.code || 'INTERNAL_SERVER_ERROR';
  const details = process.env.NODE_ENV === 'development' ? err.stack : undefined;

  return sendError(res, message, statusCode, code, details);
};

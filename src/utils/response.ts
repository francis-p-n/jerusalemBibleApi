import { Response } from 'express';

export interface PaginationInfo {
  total: number;
  limit: number;
  offset: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    durationMs?: number;
    pagination?: PaginationInfo;
  };
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode = 200,
  pagination?: PaginationInfo,
  startTime?: number
) => {
  const durationMs = startTime ? Date.now() - startTime : undefined;
  
  const meta: ApiResponse['meta'] = {
    timestamp: new Date().toISOString()
  };

  if (durationMs !== undefined) {
    meta.durationMs = durationMs;
  }

  if (pagination) {
    meta.pagination = pagination;
  }

  const responsePayload: ApiResponse<T> = {
    success: true,
    data,
    meta,
  };
  
  return res.status(statusCode).json(responsePayload);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 500,
  code?: string,
  details?: any
) => {
  const responsePayload: ApiResponse = {
    success: false,
    error: {
      message,
      ...(code && { code }),
      ...(details && { details }),
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  };
  
  return res.status(statusCode).json(responsePayload);
};


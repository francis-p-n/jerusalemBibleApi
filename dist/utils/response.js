"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendSuccess = void 0;
const sendSuccess = (res, data, statusCode = 200, pagination, startTime) => {
    const durationMs = startTime ? Date.now() - startTime : undefined;
    const meta = {
        timestamp: new Date().toISOString()
    };
    if (durationMs !== undefined) {
        meta.durationMs = durationMs;
    }
    if (pagination) {
        meta.pagination = pagination;
    }
    const responsePayload = {
        success: true,
        data,
        meta,
    };
    return res.status(statusCode).json(responsePayload);
};
exports.sendSuccess = sendSuccess;
const sendError = (res, message, statusCode = 500, code, details) => {
    const responsePayload = {
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
exports.sendError = sendError;

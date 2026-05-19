"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const response_1 = require("../utils/response");
const errorHandler = (err, _req, res, _next) => {
    console.error(`[Error Handler] Caught exception:`, err);
    const statusCode = err.status || err.statusCode || 500;
    const message = err.message || 'An unexpected error occurred on the server.';
    const code = err.code || 'INTERNAL_SERVER_ERROR';
    const details = process.env.NODE_ENV === 'development' ? err.stack : undefined;
    return (0, response_1.sendError)(res, message, statusCode, code, details);
};
exports.errorHandler = errorHandler;

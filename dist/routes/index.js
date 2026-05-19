"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bible_routes_1 = __importDefault(require("./bible.routes"));
const router = (0, express_1.Router)();
// Version 1 of the Bible API
router.use('/v1', bible_routes_1.default);
// Health check endpoint
router.get('/health', (_req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'Jerusalem Bible API'
    });
});
exports.default = router;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = __importDefault(require("./routes"));
const errorHandler_1 = require("./middleware/errorHandler");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
// Standard middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Serve static developer portal dashboard
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
// API Routes
app.use('/api', routes_1.default);
// Fallback to Developer Portal dashboard for non-API requests
app.get('*', (req, res) => {
    // If the path starts with /api, we shouldn't serve the HTML dashboard - send 404 instead
    if (req.path.startsWith('/api')) {
        res.status(404).json({
            success: false,
            error: {
                message: `Endpoint not found: GET ${req.path}`,
                code: 'ENDPOINT_NOT_FOUND',
            },
        });
        return;
    }
    // Serve the dashboard
    res.sendFile(path_1.default.join(__dirname, 'public', 'index.html'));
});
// Centralized error handler
app.use(errorHandler_1.errorHandler);
exports.default = app;

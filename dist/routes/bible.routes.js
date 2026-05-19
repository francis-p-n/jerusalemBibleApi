"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bible_controller_1 = require("../controllers/bible.controller");
const search_controller_1 = require("../controllers/search.controller");
const router = (0, express_1.Router)();
// Navigation endpoints
router.get('/books', bible_controller_1.getBooks);
router.get('/books/:slug', bible_controller_1.getBookDetails);
router.get('/passage', bible_controller_1.getPassage);
// Full-text search endpoint
router.get('/search', search_controller_1.searchBible);
exports.default = router;

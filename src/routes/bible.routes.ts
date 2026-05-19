import { Router } from 'express';
import { getBooks, getBookDetails, getPassage } from '../controllers/bible.controller';
import { searchBible } from '../controllers/search.controller';

const router = Router();

// Navigation endpoints
router.get('/books', getBooks);
router.get('/books/:slug', getBookDetails);
router.get('/passage', getPassage);

// Full-text search endpoint
router.get('/search', searchBible);

export default router;

import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import apiRouter from './routes';
import { errorHandler } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

const app = express();

// Standard middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static developer portal dashboard
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api', apiRouter);

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
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


// Centralized error handler
app.use(errorHandler);

export default app;

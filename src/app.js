import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';

const app = express();

// Enable CORS for all cross-origin requests
app.use(cors());

// Parses incoming JSON request payloads
app.use(express.json());

// Parses URL-encoded request payloads (form data)
app.use(express.urlencoded({ extended: true }));

// Mounts modular endpoints
app.use('/', routes);

// Catch-all handler for undefined API routes (generates 404 response)
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Centralized error handling middleware for fallback
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

export default app;

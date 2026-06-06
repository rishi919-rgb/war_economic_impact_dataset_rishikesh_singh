import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import errorHandler from './middlewares/error.middleware.js';
import ApiError from './utils/apiError.js';

const app = express();

// Enable CORS for all cross-origin requests
app.use(cors());

// Parses incoming JSON request payloads
app.use(express.json());

// Parses URL-encoded request payloads (form data)
app.use(express.urlencoded({ extended: true }));

// Mounts modular endpoints
app.use('/', routes);

// Catch-all handler for undefined API routes (generates 404 ApiError)
app.use((req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
});

// Centralized error handling middleware (must be registered last in pipeline)
app.use(errorHandler);

export default app;

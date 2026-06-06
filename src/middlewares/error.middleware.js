import ApiError from '../utils/apiError.js';

/**
 * Centralized error handling middleware for Express.
 * Catches all errors forwarded via next(err), standardizes them, and returns a structured JSON response.
 * Filters stack traces based on the environment (NODE_ENV) to prevent sensitive information leakage in production.
 */
const errorHandler = (err, req, res, next) => {
  let error = err;

  // Normalize unexpected errors to ApiError instances
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || (error.name === 'ValidationError' ? 400 : 500);
    const message = error.message || 'Internal Server Error';
    
    // Non-ApiError exceptions are marked as non-operational programming bugs (isOperational = false)
    error = new ApiError(statusCode, message, false, err.stack);
  }

  const response = {
    success: false,
    message: error.message,
    // Provide stack trace only in development mode
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  };

  // Log non-operational (programming/system errors) and all development errors for debugging
  if (process.env.NODE_ENV === 'development' || !error.isOperational) {
    console.error(`[Error Middleware] Status: ${error.statusCode} - Message: ${error.message}`);
    if (error.stack) {
      console.error(error.stack);
    }
  }

  res.status(error.statusCode).json(response);
};

export default errorHandler;

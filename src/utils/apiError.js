/**
 * Custom Error class for operational API errors.
 * This class standardizes error structure across the application, including HTTP status codes,
 * operational flags (to differentiate trusted runtime errors from programming bugs), and stack traces.
 */
class ApiError extends Error {
  /**
   * @param {number} statusCode - The HTTP status code associated with this error (e.g., 400, 404, 500)
   * @param {string} message - A description of the error
   * @param {boolean} [isOperational=true] - Flag indicating if the error is operational (trusted) or a programming bug
   * @param {string} [stack=''] - Optional custom stack trace
   */
  constructor(statusCode, message, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default ApiError;

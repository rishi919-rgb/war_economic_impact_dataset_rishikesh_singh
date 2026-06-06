/**
 * Reusable utility to wrap asynchronous Express route handlers.
 * Resolves the async handler as a Promise and forwards any rejected promise (error) 
 * to Express's next() function. This eliminates boilerplate try-catch blocks in controllers.
 *
 * @param {Function} requestHandler - Asynchronous Express route handler or middleware function
 * @returns {Function} Express middleware compliant function
 */
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export default asyncHandler;

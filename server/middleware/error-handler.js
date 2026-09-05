class AppError extends Error {
  constructor(status, code, message) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
  }
}

function notFoundHandler(req, res, next) {
  next(new AppError(404, 'NOT_FOUND', 'The requested resource was not found.'));
}

function errorHandler({ logger = console } = {}) {
  return (error, req, res, next) => { // next is required by Express error-middleware signature.
    const known = error instanceof AppError;
    const status = known ? error.status : 500;
    const code = known ? error.code : 'INTERNAL_ERROR';
    const message = known ? error.message : 'An unexpected server error occurred.';
    const requestId = req.get('X-Request-Id') || undefined;
    logger.error('API request failed', { status, code, requestId, path: req.path });
    res.status(status).json({ error: { code, message, requestId } });
  };
}

module.exports = { AppError, errorHandler, notFoundHandler };

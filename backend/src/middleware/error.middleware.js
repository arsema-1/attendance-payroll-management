const { logger } = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error:   err.code,
      message: err.message,
      ...err.extra,
    });
  }
  // Unhandled (non-operational) exception: log everything we know — the
  // stack plus route, method and body shape — so Render's log tail shows
  // the real root cause instead of a bare "INTERNAL_ERROR".
  logger.error(
    `Unhandled ${req.method} ${req.originalUrl}: ${err.stack || err.message}` +
    (Object.keys(req.body || {}).length
      ? ` | body keys: ${Object.keys(req.body).join(', ')}`
      : '')
  );
  // Surface the real reason in the response while debugging (also sent when
  // NODE_ENV is unset, which is common on fresh deployments).
  const isProd = process.env.NODE_ENV === 'production';
  return res.status(500).json({
    success: false,
    error:   'INTERNAL_ERROR',
    message: !isProd ? err.message : 'An unexpected error occurred.',
    ...(!isProd && { stack: err.stack }),
  });
};

module.exports = { errorHandler };

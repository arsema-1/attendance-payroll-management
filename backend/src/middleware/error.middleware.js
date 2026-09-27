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
  logger.error(`Unhandled: ${err.stack || err.message}`);
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

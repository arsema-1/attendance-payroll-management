const { createLogger, format, transports } = require('winston');
const fs = require('fs');

// On ephemeral hosts (Render, Heroku) the repo is cloned fresh and logs/ is
// gitignored, so the File transports would throw ENOENT on first write and
// crash the process inside the error handler. Create the dir up front.
if (process.env.NODE_ENV === 'production') {
  fs.mkdirSync('logs', { recursive: true });
}

const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(({ timestamp, level, message }) =>
      `[${timestamp}] ${level.toUpperCase()}: ${message}`)
  ),
  transports: [
    new transports.Console(),
    ...(process.env.NODE_ENV === 'production'
      ? [
          new transports.File({ filename: 'logs/error.log', level: 'error' }),
          new transports.File({ filename: 'logs/combined.log' }),
        ]
      : []),
  ],
});

module.exports = { logger };

const cors = require('cors');

function createCorsMiddleware(config) {
  const isProduction = config.nodeEnv === 'production';
  const allowedOrigins = config.cors.allowedOrigins;
  return cors({
    origin(origin, callback) {
      if (!origin || (!isProduction && allowedOrigins.length === 0) || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type', 'X-Request-Id'],
    maxAge: 86400
  });
}

module.exports = { createCorsMiddleware };

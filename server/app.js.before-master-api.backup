const express = require('express');
const { createCorsMiddleware } = require('./middleware/cors');
const { errorHandler, notFoundHandler } = require('./middleware/error-handler');
const { createHealthRouter } = require('./routes/health-routes');
const { createJiraRouter } = require('./routes/jira-routes');

function createApp({ config, pool, logger = console }) {
  const app = express();
  const dependencies = { config, pool, logger };
  app.disable('x-powered-by');
  app.use(createCorsMiddleware(config));
  app.use(express.json({ limit: '1mb' }));
  app.use('/api/health', createHealthRouter(dependencies));
  // Legacy routes remain available while clients migrate to /api/v1.
  app.use('/api', createJiraRouter(dependencies));
  app.use('/api/v1', createJiraRouter(dependencies));
  app.use(notFoundHandler);
  app.use(errorHandler({ logger }));
  return app;
}

module.exports = { createApp };

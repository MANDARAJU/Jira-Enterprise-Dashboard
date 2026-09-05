const { loadConfig } = require('./config');
const { createPool } = require('./db/pool');
const { createApp } = require('./app');

function start() {
  try {
    const config = loadConfig();
    const pool = createPool(config.database);
    const app = createApp({ config, pool });
    const server = app.listen(config.port, () => {
      console.log(`Jira backend listening on port ${config.port}`);
    });
    const shutdown = () => server.close(() => pool.end().finally(() => process.exit(0)));
    process.once('SIGINT', shutdown);
    process.once('SIGTERM', shutdown);
  } catch (error) {
    console.error(`Server startup failed: ${error.message}`);
    process.exitCode = 1;
  }
}

if (require.main === module) start();

module.exports = { start };

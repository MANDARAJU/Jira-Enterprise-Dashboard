const path = require('path');
const dotenv = require('dotenv');

class ConfigurationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

function required(env, name) {
  const value = env[name];
  if (!value || !String(value).trim()) throw new ConfigurationError(`Missing required environment variable: ${name}`);
  return String(value).trim();
}

function parsePort(value, name) {
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new ConfigurationError(`${name} must be a valid TCP port`);
  return port;
}

function createConfig(env = process.env) {
  const nodeEnv = env.NODE_ENV || 'development';
  const allowedOrigins = String(env.CORS_ALLOWED_ORIGINS || '').split(',').map(origin => origin.trim()).filter(Boolean);
  if (nodeEnv === 'production' && !allowedOrigins.length) throw new ConfigurationError('CORS_ALLOWED_ORIGINS is required in production');
  return Object.freeze({
    nodeEnv,
    port: parsePort(env.PORT || '3000', 'PORT'),
    cors: Object.freeze({ allowedOrigins }),
    jira: Object.freeze({
      baseUrl: required(env, 'JIRA_BASE_URL').replace(/\/$/, ''),
      email: required(env, 'JIRA_EMAIL'),
      apiToken: required(env, 'JIRA_API_TOKEN')
    }),
    database: Object.freeze({
      host: required(env, 'DB_HOST'), port: parsePort(required(env, 'DB_PORT'), 'DB_PORT'),
      database: required(env, 'DB_NAME'), user: required(env, 'DB_USER'), password: required(env, 'DB_PASSWORD')
    })
  });
}

function loadConfig() {
  const envPath = path.resolve(__dirname, '..', '..', '.env');
  const result = dotenv.config({ path: envPath, quiet: true });
  if (result.error && result.error.code !== 'ENOENT') throw new ConfigurationError('Unable to load environment configuration');
  return createConfig(process.env);
}

module.exports = { ConfigurationError, createConfig, loadConfig };

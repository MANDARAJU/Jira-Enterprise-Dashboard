const test = require('node:test');
const assert = require('node:assert/strict');
const { createConfig, ConfigurationError } = require('../config');
const { testEnvironment } = require('./helpers');

test('creates a typed configuration without exposing a secret in validation output', () => {
  const config = createConfig(testEnvironment());
  assert.equal(config.port, 3001);
  assert.equal(config.database.port, 5432);
  assert.equal(config.jira.baseUrl, 'https://jira.example.test');
});

test('rejects missing required configuration without printing its value', () => {
  const environment = testEnvironment({ JIRA_API_TOKEN: '' });
  assert.throws(() => createConfig(environment), error => error instanceof ConfigurationError && error.message === 'Missing required environment variable: JIRA_API_TOKEN');
});

test('requires explicit CORS origins in production', () => {
  assert.throws(() => createConfig(testEnvironment({ NODE_ENV: 'production' })), /CORS_ALLOWED_ORIGINS/);
  const config = createConfig(testEnvironment({ NODE_ENV: 'production', CORS_ALLOWED_ORIGINS: 'https://dashboard.example.test' }));
  assert.deepEqual(config.cors.allowedOrigins, ['https://dashboard.example.test']);
});

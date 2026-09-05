const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../app');
const { createConfig } = require('../config');
const { errorHandler } = require('../middleware/error-handler');
const { testEnvironment, withServer } = require('./helpers');

function logger() { return { error() {} }; }
function appWithPool(pool) { return createApp({ config: createConfig(testEnvironment()), pool, logger: logger() }); }

test('live health endpoint does not require a database connection', async () => {
  await withServer(appWithPool({ query: async () => { throw new Error('not used'); } }), async baseUrl => {
    const response = await fetch(`${baseUrl}/api/health/live`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { status: 'ok' });
  });
});

test('legacy health endpoint remains available for compatibility', async () => {
  await withServer(appWithPool({ query: async () => {} }), async baseUrl => {
    const response = await fetch(`${baseUrl}/api/health`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { status: 'OK', jiraConfigured: true, departmentProjects: 19 });
  });
});

test('ready health endpoint reports only a safe dependency status', async () => {
  await withServer(appWithPool({ query: async sql => { assert.equal(sql, 'SELECT 1'); } }), async baseUrl => {
    const response = await fetch(`${baseUrl}/api/health/ready`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { status: 'ready', database: 'available' });
  });
});

test('ready health endpoint sanitizes database failures', async () => {
  await withServer(appWithPool({ query: async () => { throw new Error('password=secret host=private-db'); } }), async baseUrl => {
    const response = await fetch(`${baseUrl}/api/health/ready`);
    const body = await response.json();
    assert.equal(response.status, 503);
    assert.deepEqual(body.error, { code: 'SERVICE_UNAVAILABLE', message: 'Service dependencies are unavailable.' });
    assert.doesNotMatch(JSON.stringify(body), /secret|private-db/);
  });
});

test('central error handler never returns an unexpected raw error', () => {
  let statusCode; let body;
  errorHandler({ logger: logger() })(new Error('Jira token=secret database password=hidden'), { get: () => undefined, path: '/test' }, {
    status(code) { statusCode = code; return this; }, json(value) { body = value; }
  });
  assert.equal(statusCode, 500);
  assert.deepEqual(body, { error: { code: 'INTERNAL_ERROR', message: 'An unexpected server error occurred.', requestId: undefined } });
  assert.doesNotMatch(JSON.stringify(body), /secret|hidden/);
});

test('CORS is permissive only outside production and respects configured origins', async () => {
  await withServer(appWithPool({ query: async () => {} }), async baseUrl => {
    const response = await fetch(`${baseUrl}/api/health/live`, { headers: { Origin: 'https://local.example.test' } });
    assert.equal(response.headers.get('access-control-allow-origin'), 'https://local.example.test');
  });
  const productionConfig = createConfig(testEnvironment({ NODE_ENV: 'production', CORS_ALLOWED_ORIGINS: 'https://dashboard.example.test' }));
  await withServer(createApp({ config: productionConfig, pool: { query: async () => {} }, logger: logger() }), async baseUrl => {
    const denied = await fetch(`${baseUrl}/api/health/live`, { headers: { Origin: 'https://other.example.test' } });
    assert.equal(denied.headers.get('access-control-allow-origin'), null);
    const allowed = await fetch(`${baseUrl}/api/health/live`, { headers: { Origin: 'https://dashboard.example.test' } });
    assert.equal(allowed.headers.get('access-control-allow-origin'), 'https://dashboard.example.test');
  });
});

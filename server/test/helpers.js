function testEnvironment(overrides = {}) {
  return {
    NODE_ENV: 'test', PORT: '3001', JIRA_BASE_URL: 'https://jira.example.test', JIRA_EMAIL: 'jira@example.test', JIRA_API_TOKEN: 'test-token',
    DB_HOST: 'localhost', DB_PORT: '5432', DB_NAME: 'jira_test', DB_USER: 'jira_user', DB_PASSWORD: 'test-password',
    ...overrides
  };
}

async function withServer(app, callback) {
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  try {
    const { port } = server.address();
    return await callback(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
}

module.exports = { testEnvironment, withServer };

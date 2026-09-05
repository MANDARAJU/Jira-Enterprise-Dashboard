const { AppError } = require('../middleware/error-handler');

function createJiraService({ config, logger = console }) {
  const auth = Buffer.from(`${config.jira.email}:${config.jira.apiToken}`).toString('base64');

  async function request(url) {
    let response;
    try {
      response = await fetch(url, { method: 'GET', headers: { Authorization: `Basic ${auth}`, Accept: 'application/json' } });
    } catch (error) {
      logger.error('Jira request failed', { type: 'network' });
      throw new AppError(502, 'JIRA_UNAVAILABLE', 'Jira data is temporarily unavailable.');
    }
    if (!response.ok) {
      logger.error('Jira request failed', { status: response.status });
      throw new AppError(502, 'JIRA_UNAVAILABLE', 'Jira data is temporarily unavailable.');
    }
    try {
      return await response.json();
    } catch (error) {
      logger.error('Jira request failed', { type: 'invalid_response' });
      throw new AppError(502, 'JIRA_UNAVAILABLE', 'Jira data is temporarily unavailable.');
    }
  }

  async function getAllIssues(jql) {
    const allIssues = [];
    let nextPageToken = null;
    let pageNumber = 1;
    do {
      let url = `${config.jira.baseUrl}/rest/api/3/search/jql?jql=${encodeURIComponent(jql)}&maxResults=100&fields=${encodeURIComponent('summary,status,assignee,project,issuetype,priority,created,updated,customfield_10163')}`;
      if (nextPageToken) url += `&nextPageToken=${encodeURIComponent(nextPageToken)}`;
      const data = await request(url);
      const issues = data.issues || [];
      allIssues.push(...issues);
      if (data.isLast === true || !data.nextPageToken || issues.length === 0 || pageNumber >= 100) break;
      nextPageToken = data.nextPageToken;
      pageNumber += 1;
    } while (true);
    return allIssues;
  }

  return { getAllIssues };
}

module.exports = { createJiraService };

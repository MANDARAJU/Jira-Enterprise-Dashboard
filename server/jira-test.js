const dotenv = require('dotenv');

dotenv.config();

const baseUrl = process.env.JIRA_BASE_URL;
const email = process.env.JIRA_EMAIL;
const token = process.env.JIRA_API_TOKEN;

const auth = Buffer.from(`${email}:${token}`).toString('base64');

async function test() {
  const jql = 'project = WSB ORDER BY created DESC';

  const url =
    `${baseUrl}/rest/api/3/search/jql` +
    `?jql=${encodeURIComponent(jql)}` +
    `&maxResults=10` +
    `&fields=summary,status,project,created`;

  console.log('Testing Jira API...');
  console.log('JQL:', jql);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${auth}`,
      Accept: 'application/json'
    }
  });

  console.log('HTTP Status:', response.status);

  const text = await response.text();

  console.log('Response:');
  console.log(text);
}

test().catch(error => {
  console.error('ERROR:', error);
});
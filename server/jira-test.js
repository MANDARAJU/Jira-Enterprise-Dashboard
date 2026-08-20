const dotenv = require('dotenv');

dotenv.config({ path: '../.env' });

const baseUrl = process.env.JIRA_BASE_URL;
const email = process.env.JIRA_EMAIL;
const token = process.env.JIRA_API_TOKEN;

const auth = Buffer.from(`${email}:${token}`).toString('base64');

async function test() {

  const jql =
  '(project = "DATN" OR project = "EXAN2" OR project = "WSB" OR project = "EX15" OR project = "NSISN" OR project = "P15N" OR project = "POR" OR project = "NSUT" OR project = "NBLD" OR project = "NLEAD" OR project = "NERP10F" OR project = "INVT10N" OR project = "N20" OR project = "NO" OR project = "INAPIS" OR project = "CRM1" OR project = "OQB2N" OR project = "WEB2" OR project = "EA") ' +
  'AND created >= -6M ' +
  'ORDER BY created DESC';

  const url =
    `${baseUrl}/rest/api/3/search/jql` +
    `?jql=${encodeURIComponent(jql)}` +
    `&maxResults=10` +
    `&fields=summary,status,project,created`;

  console.log('Testing Jira API...');
  console.log('JQL:', jql);
  console.log('URL:', url);

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
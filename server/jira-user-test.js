const dotenv = require('dotenv');

dotenv.config({ path: '../.env' });

const baseUrl = process.env.JIRA_BASE_URL;
const email = process.env.JIRA_EMAIL;
const token = process.env.JIRA_API_TOKEN;

const auth = Buffer.from(`${email}:${token}`).toString('base64');

async function test() {

  const url = `${baseUrl}/rest/api/3/myself`;

  console.log('Testing Jira authenticated user...');
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
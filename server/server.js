const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const JIRA_BASE_URL = process.env.JIRA_BASE_URL;
const JIRA_EMAIL = process.env.JIRA_EMAIL;
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;

if (!JIRA_BASE_URL || !JIRA_EMAIL || !JIRA_API_TOKEN) {
  console.error('Jira configuration is missing in .env');
  process.exit(1);
}

const auth = Buffer.from(
  `${JIRA_EMAIL}:${JIRA_API_TOKEN}`
).toString('base64');

app.get('/api/jira/issues', async (req, res) => {
  try {
    const url =
      `${JIRA_BASE_URL}/rest/api/3/search/jql` +
      `?jql=project%20is%20not%20EMPTY` +
      `&maxResults=10` +
      `&fields=summary,status,assignee,project,issuetype,priority,created,updated`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();

      return res.status(response.status).json({
        error: 'Jira API request failed',
        details: errorText
      });
    }

    const data = await response.json();

    res.json(data);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    jiraConfigured: true
  });
});

app.listen(PORT, () => {
  console.log(`Jira backend running on http://localhost:${PORT}`);
});
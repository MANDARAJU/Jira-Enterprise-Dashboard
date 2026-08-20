const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config({ path: '../.env' });

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

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


/*
|--------------------------------------------------------------------------
| Department Projects
|--------------------------------------------------------------------------
*/

const DEPARTMENT_PROJECTS = [
  'DATN',
  'EXAN2',
  'WSB',
  'EX15',
  'NSISN',
  'P15N',
  'POR',
  'NSUT',
  'NBLD',
  'NLEAD',
  'NERP10F',
  'INVT10N',
  'N20',
  'NO',
  'INAPIS',
  'CRM1',
  'OQB2N',
  'WEB2',
  'EA'
];


/*
|--------------------------------------------------------------------------
| Project Names
|--------------------------------------------------------------------------
*/

const PROJECT_NAMES = {
  DATN: 'DATABASE_New',
  EXAN2: 'Exam Analysis 2.0 (New)',
  WSB: 'Web_Stack_Board',
  EX15: 'Examination 1.5 (New)',
  NSISN: 'NSIS_ADMISSIONS_1.5_New',
  P15N: 'Payroll 1.5 (New)',
  POR: 'MYNSPIRA 2.0',
  NSUT: 'NSUITE (New)',
  NBLD: 'NERP 1.0 - Building',
  NLEAD: 'NLeader',
  NERP10F: 'NERP_1.0_Finance(New)',
  INVT10N: 'NERP_1.0_Inventory(New)',
  N20: 'NAP 2.0',
  NO: 'NSIS Ops',
  INAPIS: 'INTEGRATIONS(APIS)',
  CRM1: 'NAP 1.5_(NCRM_New)',
  OQB2N: 'OQB 2.0 (New)',
  WEB2: 'Web Applications',
  EA: 'Engineering Academics'
};


/*
|--------------------------------------------------------------------------
| Jira API helper
|--------------------------------------------------------------------------
*/

async function jiraRequest(url) {

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${auth}`,
      Accept: 'application/json'
    }
  });

  const text = await response.text();

  if (!response.ok) {

    console.error('Jira API Error');
    console.error('HTTP Status:', response.status);
    console.error(text);

    throw new Error(
      `Jira API failed with HTTP ${response.status}: ${text}`
    );
  }

  return JSON.parse(text);
}


/*
|--------------------------------------------------------------------------
| Build Project JQL
|--------------------------------------------------------------------------
*/

function buildProjectJql() {

  return DEPARTMENT_PROJECTS
    .map(key => `project = "${key}"`)
    .join(' OR ');
}


/*
|--------------------------------------------------------------------------
| Get Jira Issues - PAGINATED
|--------------------------------------------------------------------------
*/

async function getAllJiraIssues(jql) {

  const allIssues = [];

  let nextPageToken = null;

  let pageNumber = 1;

  while (true) {

    let url =
      `${JIRA_BASE_URL}/rest/api/3/search/jql` +
      `?jql=${encodeURIComponent(jql)}` +
      `&maxResults=100` +
      `&fields=${encodeURIComponent(
        'summary,status,assignee,project,issuetype,priority,created,updated'
      )}`;

    if (nextPageToken) {
      url += `&nextPageToken=${encodeURIComponent(nextPageToken)}`;
    }

    console.log(`Jira page ${pageNumber}`);

    const data = await jiraRequest(url);

    const issues = data.issues || [];

    console.log(
      `Jira page ${pageNumber} loaded: ${issues.length} issues`
    );

    allIssues.push(...issues);

    if (
      data.isLast === true ||
      !data.nextPageToken ||
      issues.length === 0
    ) {
      break;
    }

    nextPageToken = data.nextPageToken;

    pageNumber++;

    /*
     * Safety limit to prevent accidental infinite loops.
     */
    if (pageNumber > 100) {
      console.warn('Pagination safety limit reached.');
      break;
    }
  }

  return allIssues;
}


/*
|--------------------------------------------------------------------------
| Health
|--------------------------------------------------------------------------
*/

app.get('/api/health', (req, res) => {

  res.json({
    status: 'OK',
    jiraConfigured: true,
    departmentProjects: DEPARTMENT_PROJECTS.length
  });

});

/*
|--------------------------------------------------------------------------
| PostgreSQL Database Test
|--------------------------------------------------------------------------
*/

app.get('/api/db-test', async (req, res) => {

  try {

    const result = await pool.query(
      'SELECT NOW() AS current_time'
    );

    res.json({

      status: 'OK',

      database: 'Connected',

      databaseName: process.env.DB_NAME,

      currentTime: result.rows[0].current_time

    });

  } catch (error) {

    console.error(
      'PostgreSQL connection failed:',
      error
    );

    res.status(500).json({

      status: 'ERROR',

      database: 'Connection failed',

      error: error.message

    });

  }

});
/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/

app.listen(PORT, () => {

  console.log('');
  console.log(
    `Jira backend running on http://localhost:${PORT}`
  );

  console.log(
    `Department projects configured: ${DEPARTMENT_PROJECTS.length}`
  );

  console.log(
    `Projects: ${DEPARTMENT_PROJECTS.join(', ')}`
  );

});

const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.JIRA_BASE_URL;
const EMAIL = process.env.JIRA_EMAIL;
const TOKEN = process.env.JIRA_API_TOKEN;
const JQL = process.env.JIRA_JQL || 'ORDER BY updated DESC';

const OUTPUT_PATH = path.join(__dirname, '..', 'src', 'assets', 'jira_data.json');
const PAGE_SIZE = 100;

if (!BASE_URL || !EMAIL || !TOKEN) {
  console.error('ERROR: Missing JIRA_BASE_URL, JIRA_EMAIL, or JIRA_API_TOKEN environment variables.');
  process.exit(1);
}

const authHeader = 'Basic ' + Buffer.from(`${EMAIL}:${TOKEN}`).toString('base64');

function mapIssue(issue) {
  const f = issue.fields;
  return {
    key: issue.key,
    summary: f.summary || null,
    type: f.issuetype ? f.issuetype.name : null,
    status: f.status ? f.status.name : null,
    project: f.project ? f.project.name : null,
    priority: f.priority ? f.priority.name : null,
    assignee: f.assignee ? f.assignee.displayName : null,
    created: f.created ? f.created.slice(0, 10) : null,
    updated: f.updated ? f.updated.slice(0, 10) : null,
    due: f.duedate || null,
    points: f.customfield_10016 ?? null,
    parent: f.parent ? f.parent.key : null,
    statusCategory: f.status && f.status.statusCategory ? f.status.statusCategory.name : null,
    statusChanged: null
  };
}

async function fetchAllIssues() {
  const results = [];
  let nextPageToken = null;
  let page = 0;

  do {
    page++;
    const params = new URLSearchParams({
      jql: JQL,
      maxResults: String(PAGE_SIZE),
      fields: 'summary,issuetype,status,project,priority,assignee,created,updated,duedate,customfield_10016,parent'
    });
    if (nextPageToken) params.set('nextPageToken', nextPageToken);

    const url = `${BASE_URL}/rest/api/3/search/jql?${params.toString()}`;

    const res = await fetch(url, {
      headers: {
        Authorization: authHeader,
        Accept: 'application/json'
      }
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Jira API request failed: ${res.status} ${res.statusText}\n${body}`);
    }

    const data = await res.json();
    results.push(...data.issues.map(mapIssue));
    nextPageToken = data.nextPageToken || null;
    console.log(`Fetched page ${page}, ${results.length} issues so far...`);

    if (!nextPageToken || data.issues.length < PAGE_SIZE) break;
  } while (true);

  return results;
}

(async () => {
  console.log(`Fetching issues from ${BASE_URL} with JQL: ${JQL}`);
  const issues = await fetchAllIssues();
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(issues), 'utf-8');
  console.log(`Done. ${issues.length} issues written to ${OUTPUT_PATH}`);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
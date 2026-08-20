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
    console.log(`Jira URL: ${url}`);

    const data = await jiraRequest(url);

    const issues = data.issues || [];

    console.log(`Jira page ${pageNumber} loaded: ${issues.length} issues`);

    allIssues.push(...issues);

    if (data.isLast === true || !data.nextPageToken) {
      break;
    }

    nextPageToken = data.nextPageToken;
    pageNumber++;

    if (pageNumber > 100) {
      console.warn('Pagination safety limit reached.');
      break;
    }
  }

  return allIssues;
}
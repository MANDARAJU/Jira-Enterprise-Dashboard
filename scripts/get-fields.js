/**
 * get-fields.js
 *
 * Lists all Jira custom fields.
 *
 * Usage:
 *
 * Windows PowerShell
 *
 * $env:JIRA_BASE_URL="https://yourcompany.atlassian.net"
 * $env:JIRA_EMAIL="your@email.com"
 * $env:JIRA_API_TOKEN="YOUR_API_TOKEN"
 *
 * node scripts/get-fields.js
 */

const BASE_URL = process.env.JIRA_BASE_URL;
const EMAIL = process.env.JIRA_EMAIL;
const TOKEN = process.env.JIRA_API_TOKEN;

const auth =
  "Basic " + Buffer.from(`${EMAIL}:${TOKEN}`).toString("base64");

(async () => {
  try {
    const response = await fetch(`${BASE_URL}/rest/api/3/field`, {
      headers: {
        Authorization: auth,
        Accept: "application/json"
      }
    });

    console.log("Status:", response.status);

    const fields = await response.json();

    fields
      .filter(f => f.id.startsWith("customfield_"))
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach(f => {
        console.log(`${f.name} -> ${f.id}`);
      });

  } catch (err) {
    console.error(err);
  }
})();
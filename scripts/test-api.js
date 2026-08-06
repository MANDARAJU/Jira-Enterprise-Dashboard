const BASE_URL = process.env.JIRA_BASE_URL;
const EMAIL = process.env.JIRA_EMAIL;
const TOKEN = process.env.JIRA_API_TOKEN;

if (!BASE_URL || !EMAIL || !TOKEN) {
  console.error("Missing environment variables.");
  process.exit(1);
}

const auth =
  "Basic " + Buffer.from(`${EMAIL}:${TOKEN}`).toString("base64");

async function testConnection() {
  try {
    const response = await fetch(`${BASE_URL}/rest/api/3/myself`, {
      headers: {
        Authorization: auth,
        Accept: "application/json"
      }
    });

    console.log("Status:", response.status);
    console.log("Status Text:", response.statusText);

    const body = await response.text();
    console.log("\nResponse:\n");
    console.log(body);

  } catch (err) {
    console.error(err);
  }
}

testConnection();
const BASE_URL = process.env.JIRA_BASE_URL;
const EMAIL = process.env.JIRA_EMAIL;
const TOKEN = process.env.JIRA_API_TOKEN;
const JQL = process.env.JIRA_JQL || "ORDER BY updated DESC";

const PAGE_SIZE = 100;

const authHeader =
  "Basic " + Buffer.from(`${EMAIL}:${TOKEN}`).toString("base64");

module.exports = {
  BASE_URL,
  EMAIL,
  TOKEN,
  JQL,
  PAGE_SIZE,
  authHeader
};
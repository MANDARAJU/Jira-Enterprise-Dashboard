const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const { migrationsDirectory } = require('../db/migrate');
const { DEPARTMENT_PROJECTS } = require('../controllers/jira-controller');

test('Phase 1 migration defines the required foundation tables and all approved projects', () => {
  const migrationPath = path.join(migrationsDirectory, '001_phase1_foundation.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');
  for (const table of ['department_projects', 'department_users', 'stakeholders', 'jira_statuses', 'status_mappings', 'jira_field_mappings']) {
    assert.match(sql, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`));
  }
  assert.equal(DEPARTMENT_PROJECTS.length, 19);
  for (const project of DEPARTMENT_PROJECTS) assert.match(sql, new RegExp(`'${project}'`));
  assert.match(sql, /ON CONFLICT \(project_key\)/);
});

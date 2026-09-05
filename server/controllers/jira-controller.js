const { createJiraService } = require('../services/jira-service');
const { AppError } = require('../middleware/error-handler');

const DEPARTMENT_PROJECTS = ['DATN', 'EXAN2', 'WSB', 'EX15', 'NSISN', 'P15N', 'POR', 'NSUT', 'NBLD', 'NLEAD', 'NERP10F', 'INVT10N', 'N20', 'NO', 'INAPIS', 'CRM1', 'OQB2N', 'WEB2', 'EA'];
const PROJECT_NAMES = {
  DATN: 'DATABASE_New', EXAN2: 'Exam Analysis 2.0 (New)', WSB: 'Web_Stack_Board', EX15: 'Examination 1.5 (New)', NSISN: 'NSIS_ADMISSIONS_1.5_New', P15N: 'Payroll 1.5 (New)', POR: 'MYNSPIRA 2.0', NSUT: 'NSUITE (New)', NBLD: 'NERP 1.0 - Building', NLEAD: 'NLeader', NERP10F: 'NERP_1.0_Finance(New)', INVT10N: 'NERP_1.0_Inventory(New)', N20: 'NAP 2.0', NO: 'NSIS Ops', INAPIS: 'INTEGRATIONS(APIS)', CRM1: 'NAP 1.5_(NCRM_New)', OQB2N: 'OQB 2.0 (New)', WEB2: 'Web Applications', EA: 'Engineering Academics'
};

function createJiraController({ config, pool, logger }) {
  const jira = createJiraService({ config, logger });
  const buildProjectJql = () => DEPARTMENT_PROJECTS.map(key => `project = "${key}"`).join(' OR ');

  async function getIssues(req, res, next) {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const jql = `(${buildProjectJql()}) AND created >= "2026-01-01" AND created <= "${today}" ORDER BY created DESC`;
      const issues = await jira.getAllIssues(jql);
      for (const issue of issues) {
        const fields = issue.fields || {};
        const projectKey = fields.project?.key || null;
        await pool.query(`INSERT INTO jira_issues (issue_key, summary, status, assignee, project_key, project_name, issue_type, priority, jira_created, jira_updated, stakeholder, updated_at)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,CURRENT_TIMESTAMP)
          ON CONFLICT (issue_key) DO UPDATE SET summary=EXCLUDED.summary,status=EXCLUDED.status,assignee=EXCLUDED.assignee,project_key=EXCLUDED.project_key,project_name=EXCLUDED.project_name,issue_type=EXCLUDED.issue_type,priority=EXCLUDED.priority,jira_created=EXCLUDED.jira_created,jira_updated=EXCLUDED.jira_updated,stakeholder=EXCLUDED.stakeholder,updated_at=CURRENT_TIMESTAMP`, [
          issue.key || null, fields.summary || null, fields.status?.name || null, fields.assignee?.displayName || null,
          projectKey, PROJECT_NAMES[projectKey] || fields.project?.name || projectKey, fields.issuetype?.name || null,
          fields.priority?.name || null, fields.created ? new Date(fields.created) : null, fields.updated ? new Date(fields.updated) : null,
          fields.customfield_10163?.value || null
        ]);
      }
      res.json({ total: issues.length, savedToDatabase: true, filters: { period: '01-Jan-2026 to Today', projects: DEPARTMENT_PROJECTS }, issues });
    } catch (error) {
      next(error instanceof AppError ? error : new AppError(500, 'JIRA_SYNC_FAILED', 'Jira issues could not be loaded.'));
    }
  }

  async function getDashboard(req, res, next) {
    try {
      const [totalResult, statusResult, projectResult, monthlyResult, stakeholderResult] = await Promise.all([
        pool.query("SELECT COUNT(*)::int AS count FROM jira_issues WHERE jira_created >= DATE '2026-01-01' AND jira_created < CURRENT_DATE + INTERVAL '1 day'"),
        pool.query("SELECT status, COUNT(*)::int AS count FROM jira_issues WHERE jira_created >= DATE '2026-01-01' AND jira_created < CURRENT_DATE + INTERVAL '1 day' GROUP BY status ORDER BY count DESC"),
        pool.query("SELECT project_key, COUNT(*)::int AS count FROM jira_issues WHERE jira_created >= DATE '2026-01-01' AND jira_created < CURRENT_DATE + INTERVAL '1 day' GROUP BY project_key ORDER BY count DESC"),
        pool.query("SELECT TO_CHAR(jira_created, 'YYYY-MM') AS month, COUNT(*)::int AS count FROM jira_issues WHERE jira_created >= DATE '2026-01-01' AND jira_created < CURRENT_DATE + INTERVAL '1 day' GROUP BY TO_CHAR(jira_created, 'YYYY-MM') ORDER BY month"),
        pool.query("SELECT stakeholder, COUNT(*)::int AS count FROM jira_issues WHERE jira_created >= DATE '2026-01-01' AND jira_created < CURRENT_DATE + INTERVAL '1 day' AND stakeholder IS NOT NULL AND TRIM(stakeholder) <> '' GROUP BY stakeholder ORDER BY count DESC")
      ]);
      const counts = Object.fromEntries(statusResult.rows.map(row => [row.status, row.count]));
      const projectsByKey = Object.fromEntries(projectResult.rows.map(row => [row.project_key, row.count]));
      res.json({ period: '01-Jan-2026 to Today', projectCount: DEPARTMENT_PROJECTS.length, total: totalResult.rows[0].count,
        completed: (counts.Closed || 0) + (counts.Close || 0), inProgress: (counts['Dev In Progress'] || 0) + (counts['Code Review'] || 0) + (counts.Analysis || 0),
        todo: (counts['To Do (migrated)'] || 0) + (counts.ToDo || 0) + (counts.Backlog || 0) + (counts['Selected for Development'] || 0), open: counts.OPEN || 0,
        onHold: counts['On Hold'] || 0, readyForProd: counts['Ready for PROD'] || 0, uatVerified: (counts['UAT VERIFIED'] || 0) + (counts['QAT Verified'] || 0),
        readyForQA: counts['Ready for QA'] || 0, readyForUAT: counts['Ready for UAT'] || 0,
        projects: DEPARTMENT_PROJECTS.map(project => ({ project, count: projectsByKey[project] || 0 })), monthly: monthlyResult.rows, stakeholders: stakeholderResult.rows, statusBreakdown: statusResult.rows });
    } catch (error) {
      next(new AppError(500, 'DASHBOARD_UNAVAILABLE', 'Dashboard data could not be loaded.'));
    }
  }

  async function dbTest(req, res, next) {
    try {
      await pool.query('SELECT 1');
      res.json({ status: 'OK', database: 'Connected' });
    } catch (error) {
      next(new AppError(503, 'SERVICE_UNAVAILABLE', 'Service dependencies are unavailable.'));
    }
  }
  return { dbTest, getDashboard, getIssues };
}

module.exports = { createJiraController, DEPARTMENT_PROJECTS };

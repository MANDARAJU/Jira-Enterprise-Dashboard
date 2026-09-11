const { AppError } = require('../middleware/error-handler');

function createMasterController({ pool }) {
  async function getProjects(req, res, next) {
    try {
      const result = await pool.query(`
        SELECT
          id,
          jira_project_id,
          project_key,
          project_name,
          is_active,
          display_order
        FROM department_projects
        WHERE is_active = TRUE
        ORDER BY display_order, project_name
      `);

      res.json({
        total: result.rows.length,
        projects: result.rows
      });
    } catch (error) {
      next(new AppError(
        500,
        'MASTER_PROJECTS_UNAVAILABLE',
        'Department projects could not be loaded.'
      ));
    }
  }

  async function getUsers(req, res, next) {
    try {
      const result = await pool.query(`
        SELECT
          id,
          jira_account_id,
          email,
          display_name,
          employee_code,
          department,
          manager_id,
          is_active
        FROM department_users
        WHERE is_active = TRUE
        ORDER BY display_name
      `);

      res.json({
        total: result.rows.length,
        users: result.rows
      });
    } catch (error) {
      next(new AppError(
        500,
        'MASTER_USERS_UNAVAILABLE',
        'Department users could not be loaded.'
      ));
    }
  }

  async function getStakeholders(req, res, next) {
    try {
      const result = await pool.query(`
        SELECT
          id,
          jira_account_id,
          email,
          name,
          department,
          is_active
        FROM stakeholders
        WHERE is_active = TRUE
        ORDER BY name
      `);

      res.json({
        total: result.rows.length,
        stakeholders: result.rows
      });
    } catch (error) {
      next(new AppError(
        500,
        'MASTER_STAKEHOLDERS_UNAVAILABLE',
        'Stakeholders could not be loaded.'
      ));
    }
  }

  async function getStatuses(req, res, next) {
    try {
      const result = await pool.query(`
        SELECT
          js.id,
          js.jira_status_id,
          js.status_name,
          js.status_category_key,
          sm.canonical_status,
          js.is_active
        FROM jira_statuses js
        LEFT JOIN status_mappings sm
          ON sm.jira_status_id = js.id
         AND sm.is_active = TRUE
        WHERE js.is_active = TRUE
        ORDER BY js.status_name
      `);

      res.json({
        total: result.rows.length,
        statuses: result.rows
      });
    } catch (error) {
      next(new AppError(
        500,
        'MASTER_STATUSES_UNAVAILABLE',
        'Jira statuses could not be loaded.'
      ));
    }
  }

  return {
    getProjects,
    getUsers,
    getStakeholders,
    getStatuses
  };
}

module.exports = { createMasterController };
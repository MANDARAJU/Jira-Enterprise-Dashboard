const express = require('express');
const { AppError } = require('../middleware/error-handler');

function createHealthRouter({ config, pool }) {
  const router = express.Router();
  router.get('/', (req, res) => res.json({ status: 'OK', jiraConfigured: Boolean(config.jira.baseUrl), departmentProjects: 19 }));
  router.get('/live', (req, res) => res.json({ status: 'ok' }));
  router.get('/ready', async (req, res, next) => {
    try {
      await pool.query('SELECT 1');
      res.json({ status: 'ready', database: 'available' });
    } catch (error) {
      next(new AppError(503, 'SERVICE_UNAVAILABLE', 'Service dependencies are unavailable.'));
    }
  });
  return router;
}

module.exports = { createHealthRouter };

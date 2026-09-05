const express = require('express');
const { createJiraController } = require('../controllers/jira-controller');

function createJiraRouter(dependencies) {
  const router = express.Router();
  const controller = createJiraController(dependencies);
  router.get('/db-test', controller.dbTest);
  router.get('/jira/issues', controller.getIssues);
  router.get('/jira/dashboard', controller.getDashboard);
  return router;
}

module.exports = { createJiraRouter };

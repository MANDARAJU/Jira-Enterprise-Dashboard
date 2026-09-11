const express = require('express');
const { createMasterController } = require('../controllers/master-controller');

function createMasterRouter(dependencies) {
  const router = express.Router();
  const controller = createMasterController(dependencies);

  router.get('/projects', controller.getProjects);
  router.get('/users', controller.getUsers);
  router.get('/stakeholders', controller.getStakeholders);
  router.get('/statuses', controller.getStatuses);

  return router;
}

module.exports = { createMasterRouter };
const express = require('express');
const router = express.Router();
const databaseController = require('../controllers/databaseController');
const authController = require('../controllers/authController');
const demoMode = require('../middlewares/demo_mode');

router.route('/databases').get(databaseController.getDatabases);

router
  .route('/database/add')
  .get(authController.protect, databaseController.addDatabase)
  .post(authController.protect, demoMode, databaseController.createDatabase);

router.route('/database/:id').get(authController.protect, databaseController.getDatabase);

router
  .route('/database/edit/:id')
  .get(authController.protect, databaseController.editDatabase)
  .post(authController.protect, demoMode, databaseController.updateDatabase);

router.route('/database/delete/:id').post(authController.protect, demoMode, databaseController.deleteDatabase);

module.exports = router;

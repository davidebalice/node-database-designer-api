const express = require('express');
const router = express.Router();
const databaseController = require('../controllers/databaseController');
const authController = require('../controllers/authController');
const demoMode = require('../middlewares/demo_mode');
const User = require('../models/userModel');


router.route('/designer/:id').get(databaseController.getDatabases);
/*
router
  .route('/add/database')
  .get(authController.protect, databaseController.addDatabase)
  .post(authController.protect, demoMode, databaseController.createDatabase);

router.route('/database/:slug').get(databaseController.getDatabase);

router
  .route('/edit/database/:id')
  .get(databaseController.editDatabase)
  .post(authController.protect, demoMode, databaseController.updateDatabase);

router.route('/database/delete/:id').post(authController.protect, demoMode, databaseController.deleteDatabase);
*/
module.exports = router;

const express = require('express');
const router = express.Router();
const tableController = require('../controllers/tableController');
const authController = require('../controllers/authController');
const demoMode = require('../middlewares/demo_mode');

router.route('/tables').get(tableController.getTables);
router.route('/update-tables').post(authController.protect, demoMode, tableController.updateTables);

router
  .route('/add/table')
  .get(authController.protect, tableController.addTable)
  .post(authController.protect, demoMode, tableController.createTable);

router.route('/table/:id').get(tableController.getTable);

router
  .route('/edit/table/:id')
  .get(tableController.editTable)
  .post(authController.protect, demoMode, tableController.updateTable);

router.route('/table/delete/:id').post(authController.protect, demoMode, tableController.deleteTable);

module.exports = router;

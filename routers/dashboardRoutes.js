const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const authController = require('../controllers/authController');

const router = express.Router();

router.route('/').get(authController.protect, async function (req, res) {
  res.render('Dashboard/index');
});

router.get('/getdemomode', authController.protect, dashboardController.getDemoMode);
router.get('/get-connection', dashboardController.getConnection);

module.exports = router;

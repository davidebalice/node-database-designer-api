const express = require('express');
const router = express.Router();
const databaseController = require('../controllers/databaseController');
const authController = require('../controllers/authController');
const demoMode = require('../middlewares/demo_mode');
const User = require('../models/userModel');


router.route('/designer/:id').get(databaseController.getDatabases);

module.exports = router;

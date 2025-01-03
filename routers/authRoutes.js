const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.post('/forgotPassword',authController.protect, authController.forgotPassword);
router.patch('/resetPassword/:token', authController.protect, authController.resetPassword);
router.patch('/updatePassword',authController.protect, authController.updatePassword);

module.exports = router;

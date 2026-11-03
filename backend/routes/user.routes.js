const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.use(authenticateToken);
router.get('/dashboard', userController.getUserDashboard);

module.exports = router;


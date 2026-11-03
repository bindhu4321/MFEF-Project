const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.use(authenticateToken);
router.get('/profit-loss', reportController.getProfitAndLoss);
router.get('/financial', reportController.getFinancialReport);

module.exports = router;


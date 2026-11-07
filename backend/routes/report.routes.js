const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const cashflowController = require('../controllers/cashflow.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.use(authenticateToken);
router.get('/profit-loss', reportController.getProfitAndLoss);
router.get('/financial', reportController.getFinancialReport);
router.get('/financial-summary', reportController.getFinancialReport);
router.get('/cash-flow', cashflowController.getCashFlowSummary);

module.exports = router;


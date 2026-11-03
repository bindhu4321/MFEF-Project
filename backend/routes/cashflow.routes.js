const express = require('express');
const router = express.Router();
const cashflowController = require('../controllers/cashflow.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.use(authenticateToken);
router.get('/', cashflowController.getCashFlowSummary);

module.exports = router;


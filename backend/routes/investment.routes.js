const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const investmentController = require('../controllers/investment.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { handleValidationErrors } = require('../middleware/validate.middleware');

const investmentValidation = [
  body('title').trim().notEmpty().withMessage('Investment title is required.'),
  body('amount_invested').isFloat({ min: 0 }).withMessage('Amount invested must be a non-negative number.'),
  body('current_value').isFloat({ min: 0 }).withMessage('Current value must be a non-negative number.'),
  body('asset_type').trim().notEmpty().withMessage('Asset type is required.'),
  body('date').isDate({ format: 'YYYY-MM-DD' }).withMessage('Valid date is required.'),
  handleValidationErrors
];

router.use(authenticateToken);

router.get('/', investmentController.getInvestments);
router.get('/summary', investmentController.getInvestmentSummary);
router.get('/:id', investmentController.getInvestmentById);
router.post('/', investmentValidation, investmentController.createInvestment);
router.put('/:id', investmentController.updateInvestment);
router.delete('/:id', investmentController.deleteInvestment);

module.exports = router;


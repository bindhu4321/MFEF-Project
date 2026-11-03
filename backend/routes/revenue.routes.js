const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const revenueController = require('../controllers/revenue.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { handleValidationErrors } = require('../middleware/validate.middleware');

const revenueValidation = [
  body('title').trim().notEmpty().withMessage('Title is required.'),
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number.'),
  body('category').trim().notEmpty().withMessage('Category is required.'),
  body('date').isDate({ format: 'YYYY-MM-DD' }).withMessage('A valid date (YYYY-MM-DD) is required.'),
  handleValidationErrors
];

router.use(authenticateToken);

router.get('/', revenueController.getRevenues);
router.get('/summary', revenueController.getRevenueSummary);
router.get('/:id', revenueController.getRevenueById);
router.post('/', revenueValidation, revenueController.createRevenue);
router.put('/:id', revenueController.updateRevenue);
router.delete('/:id', revenueController.deleteRevenue);

module.exports = router;


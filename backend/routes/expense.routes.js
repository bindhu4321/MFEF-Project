const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const expenseController = require('../controllers/expense.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { handleValidationErrors } = require('../middleware/validate.middleware');

const expenseValidation = [
  body('title').trim().notEmpty().withMessage('Title is required.'),
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number.'),
  body('category').trim().notEmpty().withMessage('Category is required.'),
  body('date').isDate({ format: 'YYYY-MM-DD' }).withMessage('A valid date (YYYY-MM-DD) is required.'),
  handleValidationErrors
];

router.use(authenticateToken);

router.get('/', expenseController.getExpenses);
router.get('/summary', expenseController.getExpenseSummary);
router.get('/:id', expenseController.getExpenseById);
router.post('/', expenseValidation, expenseController.createExpense);
router.put('/:id', expenseController.updateExpense);
router.delete('/:id', expenseController.deleteExpense);

module.exports = router;


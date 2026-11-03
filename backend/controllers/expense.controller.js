const pool = require('../config/db');

// Get all expense records
exports.getExpenses = async (req, res) => {
  try {
    const { search, category, startDate, endDate, sortBy = 'date', order = 'DESC', limit, offset } = req.query;
    const isAdmin = req.user.role === 'admin';
    const viewAll = isAdmin && req.query.all === 'true';

    let query = `
      SELECT e.*, u.name as user_name, u.business_name 
      FROM expenses e
      JOIN users u ON e.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (!viewAll) {
      query += ` AND e.user_id = ?`;
      params.push(req.user.id);
    }

    if (search) {
      query += ` AND (e.title LIKE ? OR e.vendor LIKE ? OR e.receipt_number LIKE ? OR e.notes LIKE ?)`;
      const searchWild = `%${search}%`;
      params.push(searchWild, searchWild, searchWild, searchWild);
    }

    if (category && category !== 'All') {
      query += ` AND e.category = ?`;
      params.push(category);
    }

    if (startDate) {
      query += ` AND e.date >= ?`;
      params.push(startDate);
    }

    if (endDate) {
      query += ` AND e.date <= ?`;
      params.push(endDate);
    }

    const allowedSort = ['date', 'amount', 'title', 'category', 'vendor', 'created_at'];
    const safeSortBy = allowedSort.includes(sortBy) ? sortBy : 'date';
    const safeOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query += ` ORDER BY e.${safeSortBy} ${safeOrder}`;

    if (limit) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(Number(limit), Number(offset || 0));
    }

    const [rows] = await pool.query(query, params);

    return res.status(200).json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve expense records.',
      error: error.message
    });
  }
};

// Get single expense record
exports.getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user.role === 'admin';

    let query = `
      SELECT e.*, u.name as user_name, u.business_name 
      FROM expenses e 
      JOIN users u ON e.user_id = u.id 
      WHERE e.id = ?
    `;
    const params = [id];

    if (!isAdmin) {
      query += ` AND e.user_id = ?`;
      params.push(req.user.id);
    }

    const [rows] = await pool.query(query, params);
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Expense record not found or access denied.'
      });
    }

    return res.status(200).json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching expense record.',
      error: error.message
    });
  }
};

// Create new expense record
exports.createExpense = async (req, res) => {
  try {
    const { title, amount, category, date, vendor, payment_method, receipt_number, notes } = req.body;

    if (!title || amount === undefined || !category || !date) {
      return res.status(400).json({
        success: false,
        message: 'Title, amount, category, and date are required fields.'
      });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a valid positive number.'
      });
    }

    const [result] = await pool.query(
      `INSERT INTO expenses (user_id, title, amount, category, date, vendor, payment_method, receipt_number, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        title.trim(),
        parsedAmount,
        category.trim(),
        date,
        vendor ? vendor.trim() : null,
        payment_method ? payment_method.trim() : 'Company Card',
        receipt_number ? receipt_number.trim() : null,
        notes ? notes.trim() : null
      ]
    );

    const [created] = await pool.query('SELECT * FROM expenses WHERE id = ?', [result.insertId]);

    return res.status(201).json({
      success: true,
      message: 'Expense record created successfully.',
      data: created[0]
    });
  } catch (error) {
    console.error('Error creating expense:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create expense record.',
      error: error.message
    });
  }
};

// Update expense record
exports.updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, amount, category, date, vendor, payment_method, receipt_number, notes } = req.body;
    const isAdmin = req.user.role === 'admin';

    const [check] = await pool.query('SELECT id, user_id FROM expenses WHERE id = ?', [id]);
    if (check.length === 0) {
      return res.status(404).json({ success: false, message: 'Expense record not found.' });
    }

    if (!isAdmin && check[0].user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify this record.' });
    }

    const parsedAmount = parseFloat(amount);
    if (amount !== undefined && (isNaN(parsedAmount) || parsedAmount <= 0)) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a valid positive number.'
      });
    }

    await pool.query(
      `UPDATE expenses 
       SET title = COALESCE(?, title),
           amount = COALESCE(?, amount),
           category = COALESCE(?, category),
           date = COALESCE(?, date),
           vendor = ?,
           payment_method = COALESCE(?, payment_method),
           receipt_number = ?,
           notes = ?
       WHERE id = ?`,
      [
        title ? title.trim() : null,
        parsedAmount || null,
        category ? category.trim() : null,
        date || null,
        vendor !== undefined ? (vendor ? vendor.trim() : null) : null,
        payment_method ? payment_method.trim() : null,
        receipt_number !== undefined ? (receipt_number ? receipt_number.trim() : null) : null,
        notes !== undefined ? (notes ? notes.trim() : null) : null,
        id
      ]
    );

    const [updated] = await pool.query('SELECT * FROM expenses WHERE id = ?', [id]);

    return res.status(200).json({
      success: true,
      message: 'Expense record updated successfully.',
      data: updated[0]
    });
  } catch (error) {
    console.error('Error updating expense:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update expense record.',
      error: error.message
    });
  }
};

// Delete expense record
exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user.role === 'admin';

    const [check] = await pool.query('SELECT id, user_id FROM expenses WHERE id = ?', [id]);
    if (check.length === 0) {
      return res.status(404).json({ success: false, message: 'Expense record not found.' });
    }

    if (!isAdmin && check[0].user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this record.' });
    }

    await pool.query('DELETE FROM expenses WHERE id = ?', [id]);

    return res.status(200).json({
      success: true,
      message: 'Expense record deleted successfully.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete expense record.',
      error: error.message
    });
  }
};

// Summary metrics for expenses
exports.getExpenseSummary = async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const viewAll = isAdmin && req.query.all === 'true';

    let baseFilter = 'WHERE 1=1';
    const params = [];

    if (!viewAll) {
      baseFilter += ' AND user_id = ?';
      params.push(req.user.id);
    }

    const [totalRow] = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as totalExpense, COUNT(*) as count, COALESCE(AVG(amount), 0) as averageExpense FROM expenses ${baseFilter}`,
      params
    );

    const [categoryRows] = await pool.query(
      `SELECT category, SUM(amount) as total, COUNT(*) as count 
       FROM expenses ${baseFilter} 
       GROUP BY category 
       ORDER BY total DESC`,
      params
    );

    const [monthlyRows] = await pool.query(
      `SELECT DATE_FORMAT(date, '%Y-%m') as month, SUM(amount) as total 
       FROM expenses ${baseFilter} 
       GROUP BY month 
       ORDER BY month ASC`,
      params
    );

    return res.status(200).json({
      success: true,
      totalExpense: Number(totalRow[0].totalExpense),
      count: Number(totalRow[0].count),
      averageExpense: Number(totalRow[0].averageExpense),
      byCategory: categoryRows,
      byMonth: monthlyRows
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error computing expense summary.',
      error: error.message
    });
  }
};


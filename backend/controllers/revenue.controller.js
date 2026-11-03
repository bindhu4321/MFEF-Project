const pool = require('../config/db');

// Get all revenue records for authenticated user (or all if admin)
exports.getRevenues = async (req, res) => {
  try {
    const { search, category, startDate, endDate, sortBy = 'date', order = 'DESC', limit, offset } = req.query;
    const isAdmin = req.user.role === 'admin';
    const viewAll = isAdmin && req.query.all === 'true';

    let query = `
      SELECT r.*, u.name as user_name, u.business_name 
      FROM revenue r
      JOIN users u ON r.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (!viewAll) {
      query += ` AND r.user_id = ?`;
      params.push(req.user.id);
    }

    if (search) {
      query += ` AND (r.title LIKE ? OR r.notes LIKE ? OR r.invoice_number LIKE ?)`;
      const searchWild = `%${search}%`;
      params.push(searchWild, searchWild, searchWild);
    }

    if (category && category !== 'All') {
      query += ` AND r.category = ?`;
      params.push(category);
    }

    if (startDate) {
      query += ` AND r.date >= ?`;
      params.push(startDate);
    }

    if (endDate) {
      query += ` AND r.date <= ?`;
      params.push(endDate);
    }

    // Allowed sort columns
    const allowedSort = ['date', 'amount', 'title', 'category', 'created_at'];
    const safeSortBy = allowedSort.includes(sortBy) ? sortBy : 'date';
    const safeOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query += ` ORDER BY r.${safeSortBy} ${safeOrder}`;

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
    console.error('Error fetching revenues:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve revenue records.',
      error: error.message
    });
  }
};

// Get single revenue record by ID
exports.getRevenueById = async (req, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user.role === 'admin';

    let query = `
      SELECT r.*, u.name as user_name, u.business_name 
      FROM revenue r 
      JOIN users u ON r.user_id = u.id 
      WHERE r.id = ?
    `;
    const params = [id];

    if (!isAdmin) {
      query += ` AND r.user_id = ?`;
      params.push(req.user.id);
    }

    const [rows] = await pool.query(query, params);
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Revenue record not found or access denied.'
      });
    }

    return res.status(200).json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching revenue record.',
      error: error.message
    });
  }
};

// Create new revenue record
exports.createRevenue = async (req, res) => {
  try {
    const { title, amount, category, date, payment_method, invoice_number, notes } = req.body;

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
      `INSERT INTO revenue (user_id, title, amount, category, date, payment_method, invoice_number, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        title.trim(),
        parsedAmount,
        category.trim(),
        date,
        payment_method ? payment_method.trim() : 'Bank Transfer',
        invoice_number ? invoice_number.trim() : null,
        notes ? notes.trim() : null
      ]
    );

    const [created] = await pool.query('SELECT * FROM revenue WHERE id = ?', [result.insertId]);

    return res.status(201).json({
      success: true,
      message: 'Revenue record created successfully.',
      data: created[0]
    });
  } catch (error) {
    console.error('Error creating revenue:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create revenue record.',
      error: error.message
    });
  }
};

// Update revenue record
exports.updateRevenue = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, amount, category, date, payment_method, invoice_number, notes } = req.body;
    const isAdmin = req.user.role === 'admin';

    // Verify ownership
    const [check] = await pool.query('SELECT id, user_id FROM revenue WHERE id = ?', [id]);
    if (check.length === 0) {
      return res.status(404).json({ success: false, message: 'Revenue record not found.' });
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
      `UPDATE revenue 
       SET title = COALESCE(?, title),
           amount = COALESCE(?, amount),
           category = COALESCE(?, category),
           date = COALESCE(?, date),
           payment_method = COALESCE(?, payment_method),
           invoice_number = ?,
           notes = ?
       WHERE id = ?`,
      [
        title ? title.trim() : null,
        parsedAmount || null,
        category ? category.trim() : null,
        date || null,
        payment_method ? payment_method.trim() : null,
        invoice_number !== undefined ? (invoice_number ? invoice_number.trim() : null) : null,
        notes !== undefined ? (notes ? notes.trim() : null) : null,
        id
      ]
    );

    const [updated] = await pool.query('SELECT * FROM revenue WHERE id = ?', [id]);

    return res.status(200).json({
      success: true,
      message: 'Revenue record updated successfully.',
      data: updated[0]
    });
  } catch (error) {
    console.error('Error updating revenue:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update revenue record.',
      error: error.message
    });
  }
};

// Delete revenue record
exports.deleteRevenue = async (req, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user.role === 'admin';

    const [check] = await pool.query('SELECT id, user_id FROM revenue WHERE id = ?', [id]);
    if (check.length === 0) {
      return res.status(404).json({ success: false, message: 'Revenue record not found.' });
    }

    if (!isAdmin && check[0].user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this record.' });
    }

    await pool.query('DELETE FROM revenue WHERE id = ?', [id]);

    return res.status(200).json({
      success: true,
      message: 'Revenue record deleted successfully.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete revenue record.',
      error: error.message
    });
  }
};

// Summary metrics for revenue
exports.getRevenueSummary = async (req, res) => {
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
      `SELECT COALESCE(SUM(amount), 0) as totalRevenue, COUNT(*) as count, COALESCE(AVG(amount), 0) as averageRevenue FROM revenue ${baseFilter}`,
      params
    );

    const [categoryRows] = await pool.query(
      `SELECT category, SUM(amount) as total, COUNT(*) as count 
       FROM revenue ${baseFilter} 
       GROUP BY category 
       ORDER BY total DESC`,
      params
    );

    const [monthlyRows] = await pool.query(
      `SELECT DATE_FORMAT(date, '%Y-%m') as month, SUM(amount) as total 
       FROM revenue ${baseFilter} 
       GROUP BY month 
       ORDER BY month ASC`,
      params
    );

    return res.status(200).json({
      success: true,
      totalRevenue: Number(totalRow[0].totalRevenue),
      count: Number(totalRow[0].count),
      averageRevenue: Number(totalRow[0].averageRevenue),
      byCategory: categoryRows,
      byMonth: monthlyRows
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error computing revenue summary.',
      error: error.message
    });
  }
};


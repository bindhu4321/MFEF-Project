const pool = require('../config/db');

// Get all investment records
exports.getInvestments = async (req, res) => {
  try {
    const { search, status, assetType, sortBy = 'date', order = 'DESC', limit, offset } = req.query;
    const isAdmin = req.user.role === 'admin';
    const viewAll = isAdmin && req.query.all === 'true';

    let query = `
      SELECT i.*, u.name as user_name, u.business_name 
      FROM investments i
      JOIN users u ON i.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (!viewAll) {
      query += ` AND i.user_id = ?`;
      params.push(req.user.id);
    }

    if (search) {
      query += ` AND (i.title LIKE ? OR i.notes LIKE ? OR i.asset_type LIKE ?)`;
      const searchWild = `%${search}%`;
      params.push(searchWild, searchWild, searchWild);
    }

    if (status && status !== 'All') {
      query += ` AND i.status = ?`;
      params.push(status);
    }

    if (assetType && assetType !== 'All') {
      query += ` AND i.asset_type = ?`;
      params.push(assetType);
    }

    const allowedSort = ['date', 'amount_invested', 'current_value', 'expected_return_rate', 'title', 'created_at'];
    const safeSortBy = allowedSort.includes(sortBy) ? sortBy : 'date';
    const safeOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query += ` ORDER BY i.${safeSortBy} ${safeOrder}`;

    if (limit) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(Number(limit), Number(offset || 0));
    }

    const [rows] = await pool.query(query, params);

    // Compute individual ROI% and profit for each item
    const formatted = rows.map(item => {
      const invested = Number(item.amount_invested);
      const current = Number(item.current_value);
      const profitLoss = current - invested;
      const roiPercent = invested > 0 ? ((profitLoss / invested) * 100).toFixed(2) : '0.00';
      return {
        ...item,
        gain_loss: profitLoss,
        roi_percentage: Number(roiPercent)
      };
    });

    return res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (error) {
    console.error('Error fetching investments:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve investment records.',
      error: error.message
    });
  }
};

// Get single investment record
exports.getInvestmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user.role === 'admin';

    let query = `
      SELECT i.*, u.name as user_name, u.business_name 
      FROM investments i 
      JOIN users u ON i.user_id = u.id 
      WHERE i.id = ?
    `;
    const params = [id];

    if (!isAdmin) {
      query += ` AND i.user_id = ?`;
      params.push(req.user.id);
    }

    const [rows] = await pool.query(query, params);
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Investment record not found or access denied.'
      });
    }

    const item = rows[0];
    const invested = Number(item.amount_invested);
    const current = Number(item.current_value);
    const profitLoss = current - invested;
    const roiPercent = invested > 0 ? ((profitLoss / invested) * 100).toFixed(2) : '0.00';

    return res.status(200).json({
      success: true,
      data: {
        ...item,
        gain_loss: profitLoss,
        roi_percentage: Number(roiPercent)
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching investment record.',
      error: error.message
    });
  }
};

// Create new investment record
exports.createInvestment = async (req, res) => {
  try {
    const { title, amount_invested, current_value, asset_type, date, expected_return_rate, status, notes } = req.body;

    if (!title || amount_invested === undefined || current_value === undefined || !asset_type || !date) {
      return res.status(400).json({
        success: false,
        message: 'Title, amount invested, current value, asset type, and date are required.'
      });
    }

    const investedNum = parseFloat(amount_invested);
    const currentNum = parseFloat(current_value);

    if (isNaN(investedNum) || investedNum < 0 || isNaN(currentNum) || currentNum < 0) {
      return res.status(400).json({
        success: false,
        message: 'Investment amounts must be non-negative numbers.'
      });
    }

    const allowedStatuses = ['Active', 'Matured', 'Liquidated', 'Pending'];
    const safeStatus = allowedStatuses.includes(status) ? status : 'Active';

    const [result] = await pool.query(
      `INSERT INTO investments (user_id, title, amount_invested, current_value, asset_type, date, expected_return_rate, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        title.trim(),
        investedNum,
        currentNum,
        asset_type.trim(),
        date,
        parseFloat(expected_return_rate) || 0.00,
        safeStatus,
        notes ? notes.trim() : null
      ]
    );

    const [created] = await pool.query('SELECT * FROM investments WHERE id = ?', [result.insertId]);

    return res.status(201).json({
      success: true,
      message: 'Investment record created successfully.',
      data: created[0]
    });
  } catch (error) {
    console.error('Error creating investment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create investment record.',
      error: error.message
    });
  }
};

// Update investment record
exports.updateInvestment = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, amount_invested, current_value, asset_type, date, expected_return_rate, status, notes } = req.body;
    const isAdmin = req.user.role === 'admin';

    const [check] = await pool.query('SELECT id, user_id FROM investments WHERE id = ?', [id]);
    if (check.length === 0) {
      return res.status(404).json({ success: false, message: 'Investment record not found.' });
    }

    if (!isAdmin && check[0].user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify this record.' });
    }

    const investedNum = amount_invested !== undefined ? parseFloat(amount_invested) : null;
    const currentNum = current_value !== undefined ? parseFloat(current_value) : null;
    const returnRateNum = expected_return_rate !== undefined ? parseFloat(expected_return_rate) : null;

    await pool.query(
      `UPDATE investments 
       SET title = COALESCE(?, title),
           amount_invested = COALESCE(?, amount_invested),
           current_value = COALESCE(?, current_value),
           asset_type = COALESCE(?, asset_type),
           date = COALESCE(?, date),
           expected_return_rate = COALESCE(?, expected_return_rate),
           status = COALESCE(?, status),
           notes = ?
       WHERE id = ?`,
      [
        title ? title.trim() : null,
        investedNum,
        currentNum,
        asset_type ? asset_type.trim() : null,
        date || null,
        returnRateNum,
        status || null,
        notes !== undefined ? (notes ? notes.trim() : null) : null,
        id
      ]
    );

    const [updated] = await pool.query('SELECT * FROM investments WHERE id = ?', [id]);

    return res.status(200).json({
      success: true,
      message: 'Investment record updated successfully.',
      data: updated[0]
    });
  } catch (error) {
    console.error('Error updating investment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update investment record.',
      error: error.message
    });
  }
};

// Delete investment record
exports.deleteInvestment = async (req, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user.role === 'admin';

    const [check] = await pool.query('SELECT id, user_id FROM investments WHERE id = ?', [id]);
    if (check.length === 0) {
      return res.status(404).json({ success: false, message: 'Investment record not found.' });
    }

    if (!isAdmin && check[0].user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this record.' });
    }

    await pool.query('DELETE FROM investments WHERE id = ?', [id]);

    return res.status(200).json({
      success: true,
      message: 'Investment record deleted successfully.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete investment record.',
      error: error.message
    });
  }
};

// Summary metrics for investments
exports.getInvestmentSummary = async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const viewAll = isAdmin && req.query.all === 'true';

    let baseFilter = 'WHERE 1=1';
    const params = [];

    if (!viewAll) {
      baseFilter += ' AND user_id = ?';
      params.push(req.user.id);
    }

    const [sumRow] = await pool.query(
      `SELECT 
        COALESCE(SUM(amount_invested), 0) as totalInvested,
        COALESCE(SUM(current_value), 0) as totalCurrentValue,
        COUNT(*) as totalAssets
       FROM investments ${baseFilter}`,
      params
    );

    const totalInvested = Number(sumRow[0].totalInvested);
    const totalCurrentValue = Number(sumRow[0].totalCurrentValue);
    const totalGainLoss = totalCurrentValue - totalInvested;
    const totalRoi = totalInvested > 0 ? ((totalGainLoss / totalInvested) * 100).toFixed(2) : '0.00';

    const [byStatus] = await pool.query(
      `SELECT status, COUNT(*) as count, SUM(amount_invested) as invested, SUM(current_value) as currentValue 
       FROM investments ${baseFilter} 
       GROUP BY status`,
      params
    );

    const [byAssetType] = await pool.query(
      `SELECT asset_type, COUNT(*) as count, SUM(amount_invested) as invested, SUM(current_value) as currentValue 
       FROM investments ${baseFilter} 
       GROUP BY asset_type 
       ORDER BY currentValue DESC`,
      params
    );

    return res.status(200).json({
      success: true,
      totalInvested,
      totalCurrentValue,
      totalGainLoss,
      roiPercentage: Number(totalRoi),
      totalAssets: Number(sumRow[0].totalAssets),
      byStatus,
      byAssetType
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error computing investment summary.',
      error: error.message
    });
  }
};


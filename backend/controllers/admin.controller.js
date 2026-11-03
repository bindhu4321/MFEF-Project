const pool = require('../config/db');

// Admin Dashboard Overview
exports.getAdminDashboard = async (req, res) => {
  try {
    // 1. Total counts
    const [userCount] = await pool.query('SELECT COUNT(*) as totalUsers FROM users');
    const [revCount] = await pool.query('SELECT COALESCE(SUM(amount), 0) as totalRevenue, COUNT(*) as count FROM revenue');
    const [expCount] = await pool.query('SELECT COALESCE(SUM(amount), 0) as totalExpenses, COUNT(*) as count FROM expenses');
    const [invCount] = await pool.query('SELECT COALESCE(SUM(amount_invested), 0) as totalInvested, COALESCE(SUM(current_value), 0) as totalCurrentValue, COUNT(*) as count FROM investments');

    const totalRevenue = Number(revCount[0].totalRevenue);
    const totalExpenses = Number(expCount[0].totalExpenses);
    const netSystemBalance = totalRevenue - totalExpenses;
    const totalInvested = Number(invCount[0].totalInvested);
    const totalCurrentVal = Number(invCount[0].totalCurrentValue);

    // 2. User list with their financial summaries
    const [usersWithStats] = await pool.query(`
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.role, 
        u.business_name, 
        u.phone, 
        u.created_at,
        COALESCE(r.user_revenue, 0) as total_revenue,
        COALESCE(e.user_expense, 0) as total_expense,
        COALESCE(i.user_invested, 0) as total_invested,
        (COALESCE(r.user_revenue, 0) - COALESCE(e.user_expense, 0)) as net_income
      FROM users u
      LEFT JOIN (
        SELECT user_id, SUM(amount) as user_revenue FROM revenue GROUP BY user_id
      ) r ON u.id = r.user_id
      LEFT JOIN (
        SELECT user_id, SUM(amount) as user_expense FROM expenses GROUP BY user_id
      ) e ON u.id = e.user_id
      LEFT JOIN (
        SELECT user_id, SUM(amount_invested) as user_invested FROM investments GROUP BY user_id
      ) i ON u.id = i.user_id
      ORDER BY u.created_at DESC
    `);

    // 3. System monthly performance
    const [monthlyRev] = await pool.query(`
      SELECT DATE_FORMAT(date, '%Y-%m') as month, SUM(amount) as revenue 
      FROM revenue 
      GROUP BY month 
      ORDER BY month ASC
    `);

    const [monthlyExp] = await pool.query(`
      SELECT DATE_FORMAT(date, '%Y-%m') as month, SUM(amount) as expense 
      FROM expenses 
      GROUP BY month 
      ORDER BY month ASC
    `);

    // 4. Recent transactions across system
    const [recentRevenues] = await pool.query(`
      SELECT r.id, r.title, r.amount, r.category, r.date, u.name as user_name, u.business_name 
      FROM revenue r 
      JOIN users u ON r.user_id = u.id 
      ORDER BY r.created_at DESC 
      LIMIT 5
    `);

    const [recentExpenses] = await pool.query(`
      SELECT e.id, e.title, e.amount, e.category, e.date, u.name as user_name, u.business_name 
      FROM expenses e 
      JOIN users u ON e.user_id = u.id 
      ORDER BY e.created_at DESC 
      LIMIT 5
    `);

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers: Number(userCount[0].totalUsers),
        totalRevenue,
        totalExpenses,
        netSystemBalance,
        totalInvested,
        totalCurrentVal,
        revenueCount: Number(revCount[0].count),
        expenseCount: Number(expCount[0].count),
        investmentCount: Number(invCount[0].count)
      },
      users: usersWithStats,
      monthlyRevenue: monthlyRev,
      monthlyExpenses: monthlyExp,
      recentRevenues,
      recentExpenses
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve admin dashboard.',
      error: error.message
    });
  }
};

// Admin: Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.query(`
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.role, 
        u.business_name, 
        u.phone, 
        u.created_at,
        COUNT(DISTINCT r.id) as revenue_count,
        COUNT(DISTINCT e.id) as expense_count,
        COUNT(DISTINCT i.id) as investment_count,
        COALESCE(SUM(DISTINCT r.amount), 0) as total_revenue,
        COALESCE(SUM(DISTINCT e.amount), 0) as total_expense
      FROM users u
      LEFT JOIN revenue r ON u.id = r.user_id
      LEFT JOIN expenses e ON u.id = e.user_id
      LEFT JOIN investments i ON u.id = i.user_id
      GROUP BY u.id
      ORDER BY u.id ASC
    `);

    return res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve users.',
      error: error.message
    });
  }
};

// Admin: Update user role
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be either "admin" or "user".'
      });
    }

    if (Number(id) === req.user.id && role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot demote your own admin account.'
      });
    }

    await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);

    return res.status(200).json({
      success: true,
      message: `User role updated to ${role} successfully.`
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update user role.',
      error: error.message
    });
  }
};

// Admin: Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (Number(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own admin account.'
      });
    }

    const [user] = await pool.query('SELECT id FROM users WHERE id = ?', [id]);
    if (user.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    await pool.query('DELETE FROM users WHERE id = ?', [id]);

    return res.status(200).json({
      success: true,
      message: 'User and all associated financial records deleted successfully.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete user.',
      error: error.message
    });
  }
};


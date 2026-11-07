const pool = require('../config/db');
const { getDemoDashboardMetrics } = require('../utils/demoStore');

// User Dashboard Summary Metrics
exports.getUserDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!pool.isDatabaseAvailable()) {
      return res.status(200).json(getDemoDashboardMetrics());
    }

    // 1. Total Revenue
    const [revResult] = await pool.query(
      'SELECT COALESCE(SUM(amount), 0) as totalRevenue, COUNT(*) as revenueCount FROM revenue WHERE user_id = ?',
      [userId]
    );

    // 2. Total Expenses
    const [expResult] = await pool.query(
      'SELECT COALESCE(SUM(amount), 0) as totalExpenses, COUNT(*) as expenseCount FROM expenses WHERE user_id = ?',
      [userId]
    );

    // 3. Total Investments
    const [invResult] = await pool.query(
      `SELECT 
        COALESCE(SUM(amount_invested), 0) as totalInvested,
        COALESCE(SUM(current_value), 0) as totalCurrentValue,
        COUNT(*) as assetCount 
       FROM investments WHERE user_id = ?`,
      [userId]
    );

    const totalRevenue = Number(revResult[0].totalRevenue);
    const totalExpenses = Number(expResult[0].totalExpenses);
    const netProfitLoss = totalRevenue - totalExpenses;
    const totalInvested = Number(invResult[0].totalInvested);
    const totalCurrentVal = Number(invResult[0].totalCurrentValue);
    const investmentGainLoss = totalCurrentVal - totalInvested;
    const profitMargin = totalRevenue > 0 ? ((netProfitLoss / totalRevenue) * 100).toFixed(2) : '0.00';

    // 4. Monthly timeline for Revenue vs Expense Chart
    const [monthlyRev] = await pool.query(
      `SELECT DATE_FORMAT(date, '%Y-%m') as month, SUM(amount) as revenue 
       FROM revenue WHERE user_id = ? 
       GROUP BY month ORDER BY month ASC`,
      [userId]
    );

    const [monthlyExp] = await pool.query(
      `SELECT DATE_FORMAT(date, '%Y-%m') as month, SUM(amount) as expense 
       FROM expenses WHERE user_id = ? 
       GROUP BY month ORDER BY month ASC`,
      [userId]
    );

    const monthsMap = new Map();
    monthlyRev.forEach(r => {
      monthsMap.set(r.month, {
        month: r.month,
        revenue: Number(r.revenue),
        expense: 0,
        netProfit: Number(r.revenue)
      });
    });

    monthlyExp.forEach(e => {
      if (monthsMap.has(e.month)) {
        const item = monthsMap.get(e.month);
        item.expense = Number(e.expense);
        item.netProfit = item.revenue - Number(e.expense);
      } else {
        monthsMap.set(e.month, {
          month: e.month,
          revenue: 0,
          expense: Number(e.expense),
          netProfit: -Number(e.expense)
        });
      }
    });

    const monthlyTrends = Array.from(monthsMap.values()).sort((a, b) => a.month.localeCompare(b.month));

    // 5. Expense breakdown by category for doughnut/pie chart
    const [categoryExpenses] = await pool.query(
      `SELECT category, SUM(amount) as total 
       FROM expenses WHERE user_id = ? 
       GROUP BY category ORDER BY total DESC LIMIT 6`,
      [userId]
    );

    // 6. Recent Revenue records (last 5)
    const [recentRevenues] = await pool.query(
      'SELECT id, title, amount, category, date, payment_method FROM revenue WHERE user_id = ? ORDER BY date DESC, id DESC LIMIT 5',
      [userId]
    );

    // 7. Recent Expense records (last 5)
    const [recentExpenses] = await pool.query(
      'SELECT id, title, amount, category, date, vendor FROM expenses WHERE user_id = ? ORDER BY date DESC, id DESC LIMIT 5',
      [userId]
    );

    return res.status(200).json({
      success: true,
      stats: {
        totalRevenue,
        totalExpenses,
        netProfitLoss,
        profitMargin: Number(profitMargin),
        totalInvested,
        totalCurrentVal,
        investmentGainLoss,
        revenueTransactions: Number(revResult[0].revenueCount),
        expenseTransactions: Number(expResult[0].expenseCount),
        totalAssets: Number(invResult[0].assetCount)
      },
      monthlyTrends,
      categoryExpenses,
      recentRevenues,
      recentExpenses
    });
  } catch (error) {
    console.error('User dashboard error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard metrics.',
      error: error.message
    });
  }
};


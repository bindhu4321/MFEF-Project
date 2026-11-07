const pool = require('../config/db');
const { getDemoProfitLossReport, getDemoFinancialReport } = require('../utils/demoStore');

// Profit and Loss Statement Calculation
exports.getProfitAndLoss = async (req, res) => {
  try {
    if (!pool.isDatabaseAvailable()) {
      return res.status(200).json(getDemoProfitLossReport());
    }

    const { year = new Date().getFullYear().toString(), month } = req.query;
    const isAdmin = req.user.role === 'admin';
    const viewAll = isAdmin && req.query.all === 'true';

    let revFilter = 'WHERE 1=1';
    let expFilter = 'WHERE 1=1';
    const revParams = [];
    const expParams = [];

    if (!viewAll) {
      revFilter += ' AND user_id = ?';
      expFilter += ' AND user_id = ?';
      revParams.push(req.user.id);
      expParams.push(req.user.id);
    }

    if (year) {
      revFilter += ' AND YEAR(date) = ?';
      expFilter += ' AND YEAR(date) = ?';
      revParams.push(year);
      expParams.push(year);
    }

    if (month) {
      revFilter += ' AND MONTH(date) = ?';
      expFilter += ' AND MONTH(date) = ?';
      revParams.push(month);
      expParams.push(month);
    }

    // Total Revenue
    const [revTotal] = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as totalRevenue, COUNT(*) as revenueCount FROM revenue ${revFilter}`,
      revParams
    );

    // Total Expenses
    const [expTotal] = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as totalExpense, COUNT(*) as expenseCount FROM expenses ${expFilter}`,
      expParams
    );

    const totalRevenue = Number(revTotal[0].totalRevenue);
    const totalExpense = Number(expTotal[0].totalExpense);
    const netProfitLoss = totalRevenue - totalExpense;
    const isProfitable = netProfitLoss >= 0;
    const profitMargin = totalRevenue > 0 ? ((netProfitLoss / totalRevenue) * 100).toFixed(2) : '0.00';
    const expenseRatio = totalRevenue > 0 ? ((totalExpense / totalRevenue) * 100).toFixed(2) : '0.00';

    // Revenue Breakdown by Category
    const [revCategories] = await pool.query(
      `SELECT category, SUM(amount) as total, COUNT(*) as count 
       FROM revenue ${revFilter} 
       GROUP BY category 
       ORDER BY total DESC`,
      revParams
    );

    // Expense Breakdown by Category
    const [expCategories] = await pool.query(
      `SELECT category, SUM(amount) as total, COUNT(*) as count 
       FROM expenses ${expFilter} 
       GROUP BY category 
       ORDER BY total DESC`,
      expParams
    );

    // Monthly breakdown for the year
    const [monthlyRev] = await pool.query(
      `SELECT DATE_FORMAT(date, '%Y-%m') as month, SUM(amount) as revenue 
       FROM revenue ${revFilter} 
       GROUP BY month 
       ORDER BY month ASC`,
      revParams
    );

    const [monthlyExp] = await pool.query(
      `SELECT DATE_FORMAT(date, '%Y-%m') as month, SUM(amount) as expense 
       FROM expenses ${expFilter} 
       GROUP BY month 
       ORDER BY month ASC`,
      expParams
    );

    const monthsMap = new Map();
    monthlyRev.forEach(r => {
      monthsMap.set(r.month, {
        month: r.month,
        revenue: Number(r.revenue),
        expense: 0,
        netProfit: 0,
        margin: '0.00'
      });
    });

    monthlyExp.forEach(e => {
      if (monthsMap.has(e.month)) {
        monthsMap.get(e.month).expense = Number(e.expense);
      } else {
        monthsMap.set(e.month, {
          month: e.month,
          revenue: 0,
          expense: Number(e.expense),
          netProfit: 0,
          margin: '0.00'
        });
      }
    });

    const monthlyBreakdown = Array.from(monthsMap.values())
      .sort((a, b) => a.month.localeCompare(b.month))
      .map(item => {
        const net = item.revenue - item.expense;
        const margin = item.revenue > 0 ? ((net / item.revenue) * 100).toFixed(2) : '0.00';
        return {
          ...item,
          netProfit: net,
          margin
        };
      });

    return res.status(200).json({
      success: true,
      period: {
        year,
        month: month || 'All'
      },
      summary: {
        totalRevenue,
        totalExpense,
        netProfitLoss,
        isProfitable,
        profitMargin: Number(profitMargin),
        expenseRatio: Number(expenseRatio),
        revenueCount: Number(revTotal[0].revenueCount),
        expenseCount: Number(expTotal[0].expenseCount)
      },
      revenueCategories: revCategories,
      expenseCategories: expCategories,
      monthlyBreakdown
    });
  } catch (error) {
    console.error('Profit and Loss calculation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to calculate Profit and Loss.',
      error: error.message
    });
  }
};

// Comprehensive Financial Report Generator (Monthly / Yearly)
exports.getFinancialReport = async (req, res) => {
  try {
    if (!pool.isDatabaseAvailable()) {
      return res.status(200).json(getDemoFinancialReport());
    }

    const { year = new Date().getFullYear().toString(), month } = req.query;
    const isAdmin = req.user.role === 'admin';
    const viewAll = isAdmin && req.query.all === 'true';

    let userRevFilter = 'WHERE 1=1';
    let userExpFilter = 'WHERE 1=1';
    let userInvFilter = 'WHERE 1=1';
    const revParams = [];
    const expParams = [];
    const invParams = [];

    if (!viewAll) {
      userRevFilter += ' AND user_id = ?';
      userExpFilter += ' AND user_id = ?';
      userInvFilter += ' AND user_id = ?';
      revParams.push(req.user.id);
      expParams.push(req.user.id);
      invParams.push(req.user.id);
    }

    if (year) {
      userRevFilter += ' AND YEAR(date) = ?';
      userExpFilter += ' AND YEAR(date) = ?';
      userInvFilter += ' AND YEAR(date) = ?';
      revParams.push(year);
      expParams.push(year);
      invParams.push(year);
    }

    if (month) {
      userRevFilter += ' AND MONTH(date) = ?';
      userExpFilter += ' AND MONTH(date) = ?';
      userInvFilter += ' AND MONTH(date) = ?';
      revParams.push(month);
      expParams.push(month);
      invParams.push(month);
    }

    // Revenue Totals & Top Sources
    const [revData] = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count FROM revenue ${userRevFilter}`,
      revParams
    );

    const [topRevenues] = await pool.query(
      `SELECT title, amount, category, date, payment_method FROM revenue ${userRevFilter} ORDER BY amount DESC LIMIT 5`,
      revParams
    );

    const [revCategories] = await pool.query(
      `SELECT category, SUM(amount) as total FROM revenue ${userRevFilter} GROUP BY category ORDER BY total DESC`,
      revParams
    );

    // Expense Totals & Top Expenses
    const [expData] = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count FROM expenses ${userExpFilter}`,
      expParams
    );

    const [topExpenses] = await pool.query(
      `SELECT title, amount, category, date, vendor FROM expenses ${userExpFilter} ORDER BY amount DESC LIMIT 5`,
      expParams
    );

    const [expCategories] = await pool.query(
      `SELECT category, SUM(amount) as total FROM expenses ${userExpFilter} GROUP BY category ORDER BY total DESC`,
      expParams
    );

    // Investment Portfolio Snapshot
    const [invData] = await pool.query(
      `SELECT 
        COALESCE(SUM(amount_invested), 0) as totalInvested,
        COALESCE(SUM(current_value), 0) as totalCurrentValue,
        COUNT(*) as totalAssets
       FROM investments ${userInvFilter}`,
      invParams
    );

    const totalRev = Number(revData[0].total);
    const totalExp = Number(expData[0].total);
    const netProfit = totalRev - totalExp;
    const margin = totalRev > 0 ? ((netProfit / totalRev) * 100).toFixed(2) : '0.00';
    const totalInvested = Number(invData[0].totalInvested);
    const totalCurrentVal = Number(invData[0].totalCurrentValue);
    const unrealizedGain = totalCurrentVal - totalInvested;
    const invRoi = totalInvested > 0 ? ((unrealizedGain / totalInvested) * 100).toFixed(2) : '0.00';

    // Available years for dropdown
    const [availableYears] = await pool.query(
      `SELECT DISTINCT YEAR(date) as year FROM (
        SELECT date FROM revenue
        UNION
        SELECT date FROM expenses
      ) combined ORDER BY year DESC`
    );

    return res.status(200).json({
      success: true,
      reportInfo: {
        title: month ? `Financial Report: ${year}-${String(month).padStart(2, '0')}` : `Annual Financial Report: ${year}`,
        generatedAt: new Date().toISOString(),
        year,
        month: month || null,
        availableYears: availableYears.map(y => y.year)
      },
      metrics: {
        totalRevenue: totalRev,
        totalExpenses: totalExp,
        netProfit,
        profitMargin: Number(margin),
        totalInvested,
        totalCurrentVal,
        unrealizedGain,
        investmentRoi: Number(invRoi),
        revenueTransactions: Number(revData[0].count),
        expenseTransactions: Number(expData[0].count),
        investmentAssets: Number(invData[0].totalAssets)
      },
      topRevenues,
      topExpenses,
      revenueCategories: revCategories,
      expenseCategories: expCategories
    });
  } catch (error) {
    console.error('Error generating financial report:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate financial report.',
      error: error.message
    });
  }
};


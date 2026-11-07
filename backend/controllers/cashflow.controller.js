const pool = require('../config/db');
const { getDemoCashFlowSummary } = require('../utils/demoStore');

// Cash Flow Analysis and Breakdown
exports.getCashFlowSummary = async (req, res) => {
  try {
    if (!pool.isDatabaseAvailable()) {
      return res.status(200).json(getDemoCashFlowSummary());
    }

    const { year, startDate, endDate } = req.query;
    const isAdmin = req.user.role === 'admin';
    const viewAll = isAdmin && req.query.all === 'true';

    let userRevenueFilter = 'WHERE 1=1';
    let userExpenseFilter = 'WHERE 1=1';
    const revParams = [];
    const expParams = [];

    if (!viewAll) {
      userRevenueFilter += ' AND user_id = ?';
      userExpenseFilter += ' AND user_id = ?';
      revParams.push(req.user.id);
      expParams.push(req.user.id);
    }

    if (year) {
      userRevenueFilter += ' AND YEAR(date) = ?';
      userExpenseFilter += ' AND YEAR(date) = ?';
      revParams.push(year);
      expParams.push(year);
    } else {
      if (startDate) {
        userRevenueFilter += ' AND date >= ?';
        userExpenseFilter += ' AND date >= ?';
        revParams.push(startDate);
        expParams.push(startDate);
      }
      if (endDate) {
        userRevenueFilter += ' AND date <= ?';
        userExpenseFilter += ' AND date <= ?';
        revParams.push(endDate);
        expParams.push(endDate);
      }
    }

    // 1. Total Inflow (Revenue)
    const [revTotal] = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as totalInflow, COUNT(*) as inflowTransactions FROM revenue ${userRevenueFilter}`,
      revParams
    );

    // 2. Total Outflow (Expenses)
    const [expTotal] = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as totalOutflow, COUNT(*) as outflowTransactions FROM expenses ${userExpenseFilter}`,
      expParams
    );

    const totalInflow = Number(revTotal[0].totalInflow);
    const totalOutflow = Number(expTotal[0].totalOutflow);
    const netCashFlow = totalInflow - totalOutflow;
    const inflowRatio = totalOutflow > 0 ? (totalInflow / totalOutflow).toFixed(2) : (totalInflow > 0 ? 'Infinity' : '1.00');

    // 3. Monthly Inflow breakdown
    const [monthlyInflows] = await pool.query(
      `SELECT DATE_FORMAT(date, '%Y-%m') as month, SUM(amount) as inflow 
       FROM revenue ${userRevenueFilter} 
       GROUP BY month 
       ORDER BY month ASC`,
      revParams
    );

    // 4. Monthly Outflow breakdown
    const [monthlyOutflows] = await pool.query(
      `SELECT DATE_FORMAT(date, '%Y-%m') as month, SUM(amount) as outflow 
       FROM expenses ${userExpenseFilter} 
       GROUP BY month 
       ORDER BY month ASC`,
      expParams
    );

    // Merge monthly inflows and outflows into a unified monthly timeline
    const monthlyMap = new Map();

    monthlyInflows.forEach(row => {
      monthlyMap.set(row.month, {
        month: row.month,
        inflow: Number(row.inflow),
        outflow: 0,
        net: 0,
        cumulative: 0
      });
    });

    monthlyOutflows.forEach(row => {
      if (monthlyMap.has(row.month)) {
        monthlyMap.get(row.month).outflow = Number(row.outflow);
      } else {
        monthlyMap.set(row.month, {
          month: row.month,
          inflow: 0,
          outflow: Number(row.outflow),
          net: 0,
          cumulative: 0
        });
      }
    });

    // Sort months chronologically
    const sortedMonths = Array.from(monthlyMap.values()).sort((a, b) => a.month.localeCompare(b.month));

    let runningCumulative = 0;
    const monthlyCashFlow = sortedMonths.map(item => {
      const net = item.inflow - item.outflow;
      runningCumulative += net;
      return {
        ...item,
        net,
        cumulative: runningCumulative
      };
    });

    // Inflow by Payment Method
    const [paymentMethodInflow] = await pool.query(
      `SELECT payment_method, SUM(amount) as total 
       FROM revenue ${userRevenueFilter} 
       GROUP BY payment_method 
       ORDER BY total DESC`,
      revParams
    );

    // Outflow by Payment Method
    const [paymentMethodOutflow] = await pool.query(
      `SELECT payment_method, SUM(amount) as total 
       FROM expenses ${userExpenseFilter} 
       GROUP BY payment_method 
       ORDER BY total DESC`,
      expParams
    );

    return res.status(200).json({
      success: true,
      summary: {
        totalInflow,
        totalOutflow,
        netCashFlow,
        inflowRatio,
        inflowTransactions: Number(revTotal[0].inflowTransactions),
        outflowTransactions: Number(expTotal[0].outflowTransactions)
      },
      monthlyTimeline: monthlyCashFlow,
      inflowByMethod: paymentMethodInflow,
      outflowByMethod: paymentMethodOutflow
    });
  } catch (error) {
    console.error('Cash flow calculation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to calculate cash flow.',
      error: error.message
    });
  }
};


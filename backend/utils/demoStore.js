const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const DEMO_USERS_PATH = path.join(__dirname, '..', '.demo-users.json');

const adminPasswordHash = bcrypt.hashSync('adminPassword123!', 10);
const userPasswordHash = bcrypt.hashSync('userPassword123!', 10);

const demoUsers = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@business.com',
    password: adminPasswordHash,
    role: 'admin',
    business_name: 'Apex Financial Systems',
    phone: '+1 555-010-0001'
  },
  {
    id: 2,
    name: 'Sarah Jenkins',
    email: 'sarah@apex.com',
    password: userPasswordHash,
    role: 'user',
    business_name: 'Apex Digital Studio',
    phone: '+1 555-014-2234'
  }
];

const loadRegisteredDemoUsers = () => {
  try {
    const storedUsers = JSON.parse(fs.readFileSync(DEMO_USERS_PATH, 'utf8'));
    return Array.isArray(storedUsers)
      ? storedUsers.filter((user) => (
        user && Number.isSafeInteger(Number(user.id)) &&
        typeof user.name === 'string' &&
        typeof user.email === 'string' &&
        typeof user.password === 'string' &&
        user.role === 'user'
      ))
      : [];
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error('[Demo users] Could not load saved accounts:', error);
    }
    return [];
  }
};

const registeredDemoUsers = loadRegisteredDemoUsers();
demoUsers.push(...registeredDemoUsers);

const buildUserPublicProfile = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  business_name: user.business_name,
  phone: user.phone,
  created_at: new Date().toISOString()
});

const getDemoUserByEmail = (email) => {
  const normalized = String(email || '').trim().toLowerCase();
  return demoUsers.find((user) => user.email.toLowerCase() === normalized) || null;
};

const addDemoUser = (user) => {
  const updatedUsers = [...registeredDemoUsers, user];
  fs.writeFileSync(DEMO_USERS_PATH, JSON.stringify(updatedUsers, null, 2), 'utf8');
  registeredDemoUsers.push(user);
  demoUsers.push(user);
};

const getDemoUserById = (id) => demoUsers.find((user) => Number(user.id) === Number(id)) || null;

const getDemoDashboardMetrics = () => ({
  success: true,
  stats: {
    totalRevenue: 187430.5,
    totalExpenses: 122945.3,
    netProfitLoss: 64485.2,
    profitMargin: 34.4,
    totalInvested: 95000,
    totalCurrentVal: 118500,
    investmentGainLoss: 23500,
    revenueTransactions: 18,
    expenseTransactions: 22,
    totalAssets: 6
  },
  monthlyTrends: [
    { month: '2026-01', revenue: 30950, expense: 26650, netProfit: 4300 },
    { month: '2026-02', revenue: 35550, expense: 27200, netProfit: 8350 },
    { month: '2026-03', revenue: 39200, expense: 29400, netProfit: 9800 },
    { month: '2026-04', revenue: 38200, expense: 31000, netProfit: 7200 },
    { month: '2026-05', revenue: 43100, expense: 32000, netProfit: 11100 },
    { month: '2026-06', revenue: 44600, expense: 33100, netProfit: 11500 }
  ],
  categoryExpenses: [
    { category: 'Payroll', total: 42100 },
    { category: 'Rent', total: 27000 },
    { category: 'Cloud Services', total: 8600 },
    { category: 'Software', total: 6500 },
    { category: 'Marketing', total: 5400 }
  ],
  recentRevenues: [
    { id: 1, title: 'Enterprise Cloud Migration', amount: 18500, category: 'Consulting', date: '2026-06-15', payment_method: 'Bank Transfer' },
    { id: 2, title: 'Monthly SaaS Subscriptions', amount: 18200, category: 'Subscriptions', date: '2026-06-30', payment_method: 'Stripe' },
    { id: 3, title: 'AI Model Training Workshop', amount: 11500, category: 'Training', date: '2026-07-20', payment_method: 'Bank Transfer' }
  ],
  recentExpenses: [
    { id: 1, title: 'Engineering Team Payroll', amount: 17500, category: 'Payroll', date: '2026-06-28', vendor: 'Apex Payroll Corp' },
    { id: 2, title: 'Commercial Office Lease', amount: 4500, category: 'Rent', date: '2026-06-02', vendor: 'Skyline Properties' },
    { id: 3, title: 'AWS Cloud Infrastructure', amount: 2340, category: 'Cloud Services', date: '2026-05-31', vendor: 'Amazon Web Services' }
  ]
});

const getDemoProfitLossReport = () => ({
  success: true,
  period: { year: String(new Date().getFullYear()), month: 'All' },
  summary: {
    totalRevenue: 187430.5,
    totalExpense: 122945.3,
    netProfitLoss: 64485.2,
    isProfitable: true,
    profitMargin: 34.4,
    expenseRatio: 65.6,
    revenueCount: 18,
    expenseCount: 22
  },
  revenueCategories: [
    { category: 'Consulting', total: 68100, count: 6 },
    { category: 'Subscriptions', total: 60200, count: 5 },
    { category: 'Development', total: 36850, count: 3 },
    { category: 'Licensing', total: 32000, count: 2 }
  ],
  expenseCategories: [
    { category: 'Payroll', total: 42100, count: 4 },
    { category: 'Rent', total: 27000, count: 6 },
    { category: 'Cloud Services', total: 8600, count: 3 },
    { category: 'Software', total: 6500, count: 2 }
  ],
  monthlyBreakdown: [
    { month: '2026-01', revenue: 30950, expense: 26650, netProfit: 4300, margin: '13.89' },
    { month: '2026-02', revenue: 35550, expense: 27200, netProfit: 8350, margin: '23.49' },
    { month: '2026-03', revenue: 39200, expense: 29400, netProfit: 9800, margin: '25.00' },
    { month: '2026-04', revenue: 38200, expense: 31000, netProfit: 7200, margin: '18.85' },
    { month: '2026-05', revenue: 43100, expense: 32000, netProfit: 11100, margin: '25.75' },
    { month: '2026-06', revenue: 44600, expense: 33100, netProfit: 11500, margin: '25.78' }
  ]
});

const getDemoFinancialReport = () => ({
  success: true,
  reportInfo: {
    title: `Financial Report: ${new Date().getFullYear()}`,
    generatedAt: new Date().toISOString(),
    year: String(new Date().getFullYear()),
    month: null,
    availableYears: [new Date().getFullYear()]
  },
  metrics: {
    totalRevenue: 187430.5,
    totalExpenses: 122945.3,
    netProfit: 64485.2,
    profitMargin: 34.4,
    totalInvested: 95000,
    totalCurrentVal: 118500,
    unrealizedGain: 23500,
    investmentRoi: 24.74,
    revenueTransactions: 18,
    expenseTransactions: 22,
    investmentAssets: 6
  },
  topRevenues: [
    { title: 'Enterprise Cloud Migration', amount: 18500, category: 'Consulting', date: '2026-06-15', payment_method: 'Bank Transfer' },
    { title: 'Annual Software Licensing Fee', amount: 32000, category: 'Licensing', date: '2026-09-10', payment_method: 'Wire Transfer' },
    { title: 'Cloud Infrastructure Automation', amount: 21000, category: 'Consulting', date: '2026-10-15', payment_method: 'Bank Transfer' }
  ],
  topExpenses: [
    { title: 'Engineering Team Payroll', amount: 17500, category: 'Payroll', date: '2026-06-28', vendor: 'Apex Payroll Corp' },
    { title: 'Commercial Office Lease', amount: 4500, category: 'Rent', date: '2026-06-02', vendor: 'Skyline Properties' },
    { title: 'High-End Developer Laptops', amount: 7200, category: 'Equipment', date: '2026-04-05', vendor: 'Apple Store' }
  ],
  revenueCategories: [
    { category: 'Consulting', total: 68100 },
    { category: 'Subscriptions', total: 60200 },
    { category: 'Development', total: 36850 },
    { category: 'Licensing', total: 32000 }
  ],
  expenseCategories: [
    { category: 'Payroll', total: 42100 },
    { category: 'Rent', total: 27000 },
    { category: 'Cloud Services', total: 8600 },
    { category: 'Software', total: 6500 }
  ]
});

const getDemoCashFlowSummary = () => ({
  success: true,
  summary: {
    totalInflow: 187430.5,
    totalOutflow: 122945.3,
    netCashFlow: 64485.2,
    inflowRatio: '1.52',
    inflowTransactions: 18,
    outflowTransactions: 22
  },
  monthlyTimeline: [
    { month: '2026-01', inflow: 30950, outflow: 26650, net: 4300, cumulative: 4300 },
    { month: '2026-02', inflow: 35550, outflow: 27200, net: 8350, cumulative: 12650 },
    { month: '2026-03', inflow: 39200, outflow: 29400, net: 9800, cumulative: 22450 },
    { month: '2026-04', inflow: 38200, outflow: 31000, net: 7200, cumulative: 29650 },
    { month: '2026-05', inflow: 43100, outflow: 32000, net: 11100, cumulative: 40750 },
    { month: '2026-06', inflow: 44600, outflow: 33100, net: 11500, cumulative: 52250 }
  ],
  inflowByMethod: [
    { payment_method: 'Bank Transfer', total: 89600 },
    { payment_method: 'Stripe', total: 62500 },
    { payment_method: 'Wire Transfer', total: 32000 }
  ],
  outflowByMethod: [
    { payment_method: 'Direct Deposit', total: 42100 },
    { payment_method: 'Bank Transfer', total: 27000 },
    { payment_method: 'Company Card', total: 15345 }
  ]
});

module.exports = {
  demoUsers,
  buildUserPublicProfile,
  getDemoUserByEmail,
  addDemoUser,
  getDemoUserById,
  getDemoDashboardMetrics,
  getDemoProfitLossReport,
  getDemoFinancialReport,
  getDemoCashFlowSummary
};

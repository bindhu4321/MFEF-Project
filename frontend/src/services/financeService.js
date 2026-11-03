import axiosClient from '../api/axiosClient';

const financeService = {
  // User Dashboard
  getUserDashboard: async () => {
    const response = await axiosClient.get('/user/dashboard');
    return response.data;
  },

  // Revenue APIs
  getRevenues: async (params = {}) => {
    const response = await axiosClient.get('/revenue', { params });
    return response.data;
  },

  getRevenueSummary: async (params = {}) => {
    const response = await axiosClient.get('/revenue/summary', { params });
    return response.data;
  },

  getRevenueById: async (id) => {
    const response = await axiosClient.get(`/revenue/${id}`);
    return response.data;
  },

  createRevenue: async (data) => {
    const response = await axiosClient.post('/revenue', data);
    return response.data;
  },

  updateRevenue: async (id, data) => {
    const response = await axiosClient.put(`/revenue/${id}`, data);
    return response.data;
  },

  deleteRevenue: async (id) => {
    const response = await axiosClient.delete(`/revenue/${id}`);
    return response.data;
  },

  // Expense APIs
  getExpenses: async (params = {}) => {
    const response = await axiosClient.get('/expenses', { params });
    return response.data;
  },

  getExpenseSummary: async (params = {}) => {
    const response = await axiosClient.get('/expenses/summary', { params });
    return response.data;
  },

  getExpenseById: async (id) => {
    const response = await axiosClient.get(`/expenses/${id}`);
    return response.data;
  },

  createExpense: async (data) => {
    const response = await axiosClient.post('/expenses', data);
    return response.data;
  },

  updateExpense: async (id, data) => {
    const response = await axiosClient.put(`/expenses/${id}`, data);
    return response.data;
  },

  deleteExpense: async (id) => {
    const response = await axiosClient.delete(`/expenses/${id}`);
    return response.data;
  },

  // Investment APIs
  getInvestments: async (params = {}) => {
    const response = await axiosClient.get('/investments', { params });
    return response.data;
  },

  getInvestmentSummary: async (params = {}) => {
    const response = await axiosClient.get('/investments/summary', { params });
    return response.data;
  },

  getInvestmentById: async (id) => {
    const response = await axiosClient.get(`/investments/${id}`);
    return response.data;
  },

  createInvestment: async (data) => {
    const response = await axiosClient.post('/investments', data);
    return response.data;
  },

  updateInvestment: async (id, data) => {
    const response = await axiosClient.put(`/investments/${id}`, data);
    return response.data;
  },

  deleteInvestment: async (id) => {
    const response = await axiosClient.delete(`/investments/${id}`);
    return response.data;
  },

  // Cash Flow APIs
  getCashFlowSummary: async (params = {}) => {
    const response = await axiosClient.get('/cashflow', { params });
    return response.data;
  },

  // Reports & P&L APIs
  getProfitAndLoss: async (params = {}) => {
    const response = await axiosClient.get('/reports/profit-loss', { params });
    return response.data;
  },

  getFinancialReport: async (params = {}) => {
    const response = await axiosClient.get('/reports/financial', { params });
    return response.data;
  }
};

export default financeService;


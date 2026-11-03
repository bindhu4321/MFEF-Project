import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import financeService from '../services/financeService';
import StatCard from '../components/StatCard';
import { useAuth } from '../context/AuthContext';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const UserDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await financeService.getUserDashboard();
      if (data.success) {
        setDashboardData(data);
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError('Unable to load dashboard data. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center p-5 min-vh-50">
        <div className="spinner-border text-primary mb-3" role="status"></div>
        <p className="text-muted fw-semibold">Loading your financial dashboard...</p>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="alert alert-danger d-flex align-items-center justify-content-between p-4 rounded-3 shadow-sm">
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-exclamation-triangle-fill fs-4"></i>
          <span>{error || 'Failed to load dashboard data.'}</span>
        </div>
        <button className="btn btn-outline-danger btn-sm" onClick={fetchDashboard}>
          Retry
        </button>
      </div>
    );
  }

  const { stats, monthlyTrends, categoryExpenses, recentRevenues, recentExpenses } = dashboardData;

  // Monthly trends chart data
  const monthsLabels = monthlyTrends.map((t) => t.month);
  const revenueTrendData = monthlyTrends.map((t) => t.revenue);
  const expenseTrendData = monthlyTrends.map((t) => t.expense);

  const barChartData = {
    labels: monthsLabels.length > 0 ? monthsLabels : ['No Data'],
    datasets: [
      {
        label: 'Revenue ($)',
        data: revenueTrendData.length > 0 ? revenueTrendData : [0],
        backgroundColor: 'rgba(25, 135, 84, 0.75)',
        borderColor: '#198754',
        borderWidth: 1,
        borderRadius: 4
      },
      {
        label: 'Expenses ($)',
        data: expenseTrendData.length > 0 ? expenseTrendData : [0],
        backgroundColor: 'rgba(220, 53, 69, 0.75)',
        borderColor: '#dc3545',
        borderWidth: 1,
        borderRadius: 4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { boxWidth: 14, font: { weight: 600 } }
      },
      tooltip: {
        callbacks: {
          label: (context) => ` ${context.dataset.label}: $${Number(context.raw).toLocaleString()}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (val) => `$${Number(val).toLocaleString()}`
        }
      }
    }
  };

  // Category Doughnut chart data
  const categoryLabels = categoryExpenses.map((c) => c.category);
  const categoryTotals = categoryExpenses.map((c) => Number(c.total));

  const doughnutData = {
    labels: categoryLabels.length > 0 ? categoryLabels : ['No Expenses Recorded'],
    datasets: [
      {
        data: categoryTotals.length > 0 ? categoryTotals : [1],
        backgroundColor: [
          '#0d6efd',
          '#6610f2',
          '#6f42c1',
          '#d63384',
          '#dc3545',
          '#fd7e14',
          '#ffc107',
          '#198754',
          '#20c997',
          '#0dcaf0'
        ],
        hoverOffset: 4
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { boxWidth: 12, font: { size: 11 } }
      },
      tooltip: {
        callbacks: {
          label: (context) => ` ${context.label}: $${Number(context.raw).toLocaleString()}`
        }
      }
    }
  };

  return (
    <div className="dashboard-content pb-5">
      {/* Welcome & Action Bar */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1 text-dark">
            Welcome back, {user?.name} 👋
          </h4>
          <p className="text-muted small mb-0">
            Real-time financial status for <span className="fw-semibold text-dark">{user?.business_name || 'My Small Business'}</span>
          </p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <Link to="/revenue" className="btn btn-success btn-sm d-flex align-items-center gap-1 shadow-sm">
            <i className="bi bi-plus-circle"></i>
            <span>Add Revenue</span>
          </Link>
          <Link to="/expenses" className="btn btn-danger btn-sm d-flex align-items-center gap-1 shadow-sm">
            <i className="bi bi-dash-circle"></i>
            <span>Add Expense</span>
          </Link>
          <Link to="/investments" className="btn btn-primary btn-sm d-flex align-items-center gap-1 shadow-sm">
            <i className="bi bi-piggy-bank"></i>
            <span>Investments</span>
          </Link>
          <button 
            type="button" 
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
            onClick={fetchDashboard}
            title="Refresh Financial Figures"
          >
            <i className="bi bi-arrow-clockwise"></i>
          </button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Total Revenue"
            value={stats.totalRevenue}
            subtext={`${stats.revenueTransactions} incoming transactions`}
            icon="bi-cash-coin"
            variant="success"
            isPositive={true}
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Total Expenses"
            value={stats.totalExpenses}
            subtext={`${stats.expenseTransactions} recorded expenses`}
            icon="bi-credit-card"
            variant="danger"
            isPositive={false}
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Net Profit / Loss"
            value={stats.netProfitLoss}
            subtext={`Net Margin: ${stats.profitMargin}%`}
            icon="bi-graph-up"
            variant={stats.netProfitLoss >= 0 ? 'success' : 'danger'}
            isPositive={stats.netProfitLoss >= 0}
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Portfolio Value"
            value={stats.totalCurrentVal}
            subtext={`Invested: $${stats.totalInvested.toLocaleString()} (${stats.totalAssets} assets)`}
            icon="bi-bank"
            variant="purple"
            isPositive={stats.investmentGainLoss >= 0}
          />
        </div>
      </div>

      {/* Charts Row */}
      <div className="row g-3 mb-4">
        {/* Revenue vs Expenses Monthly Trend */}
        <div className="col-12 col-lg-8">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white border-bottom py-3 d-flex align-items-center justify-content-between">
              <div>
                <h6 className="fw-bold mb-0 text-dark">Revenue vs Expenses Comparison</h6>
                <span className="text-muted x-small">Monthly performance timeline</span>
              </div>
              <Link to="/profit-loss" className="btn btn-outline-primary btn-sm x-small">
                Full P&L Report <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
            <div className="card-body p-3" style={{ height: '330px' }}>
              <Bar data={barChartData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Expense Category Breakdown */}
        <div className="col-12 col-lg-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white border-bottom py-3 d-flex align-items-center justify-content-between">
              <div>
                <h6 className="fw-bold mb-0 text-dark">Expense Distribution</h6>
                <span className="text-muted x-small">Spending breakdown by category</span>
              </div>
              <Link to="/expenses" className="btn btn-outline-danger btn-sm x-small">
                View All
              </Link>
            </div>
            <div className="card-body p-3 d-flex flex-column justify-content-center" style={{ height: '330px' }}>
              {categoryTotals.length > 0 ? (
                <Doughnut data={doughnutData} options={doughnutOptions} />
              ) : (
                <div className="text-center text-muted small">No expenses logged yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Tables Row */}
      <div className="row g-3">
        {/* Recent Revenue */}
        <div className="col-12 col-lg-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white border-bottom py-3 d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-arrow-down-left-circle-fill text-success fs-5"></i>
                <h6 className="fw-bold mb-0 text-dark">Recent Inflows (Revenue)</h6>
              </div>
              <Link to="/revenue" className="btn btn-sm btn-link text-decoration-none p-0 x-small fw-semibold">
                Manage Revenue &rarr;
              </Link>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr className="x-small text-uppercase text-muted">
                      <th className="ps-3">Description</th>
                      <th>Category</th>
                      <th>Date</th>
                      <th className="text-end pe-3">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentRevenues.length > 0 ? (
                      recentRevenues.map((r) => (
                        <tr key={r.id}>
                          <td className="ps-3">
                            <span className="fw-semibold text-dark small d-block">{r.title}</span>
                            <span className="text-muted x-small">{r.payment_method || 'Direct'}</span>
                          </td>
                          <td>
                            <span className="badge bg-success-subtle text-success small">{r.category}</span>
                          </td>
                          <td className="text-muted small">{r.date}</td>
                          <td className="text-end pe-3 fw-bold text-success small">
                            +${Number(r.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center py-4 text-muted small">
                          No revenue records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="col-12 col-lg-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white border-bottom py-3 d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-arrow-up-right-circle-fill text-danger fs-5"></i>
                <h6 className="fw-bold mb-0 text-dark">Recent Outflows (Expenses)</h6>
              </div>
              <Link to="/expenses" className="btn btn-sm btn-link text-decoration-none p-0 x-small fw-semibold text-danger">
                Manage Expenses &rarr;
              </Link>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr className="x-small text-uppercase text-muted">
                      <th className="ps-3">Description</th>
                      <th>Category</th>
                      <th>Date</th>
                      <th className="text-end pe-3">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentExpenses.length > 0 ? (
                      recentExpenses.map((e) => (
                        <tr key={e.id}>
                          <td className="ps-3">
                            <span className="fw-semibold text-dark small d-block">{e.title}</span>
                            <span className="text-muted x-small">{e.vendor || 'Direct Expense'}</span>
                          </td>
                          <td>
                            <span className="badge bg-danger-subtle text-danger small">{e.category}</span>
                          </td>
                          <td className="text-muted small">{e.date}</td>
                          <td className="text-end pe-3 fw-bold text-danger small">
                            -${Number(e.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center py-4 text-muted small">
                          No expense records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;


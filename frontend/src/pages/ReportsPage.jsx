import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import financeService from '../services/financeService';

const reports = {
  cashflow: {
    title: 'Cash flow',
    description: 'Compare incoming and outgoing money for your account.',
    load: 'getCashFlowSummary',
    summaryKey: 'summary',
    cards: [
      ['totalInflow', 'Money in', 'green'],
      ['totalOutflow', 'Money out', 'orange'],
      ['netCashFlow', 'Net cash flow', 'purple']
    ],
    rowsKey: 'monthlyTimeline',
    columns: [['month', 'Month'], ['inflow', 'Inflow'], ['outflow', 'Outflow'], ['net', 'Net']]
  },
  'profit-loss': {
    title: 'Profit & loss',
    description: 'Review revenue, expenses, and your net profit for this year.',
    load: 'getProfitAndLoss',
    summaryKey: 'summary',
    cards: [
      ['totalRevenue', 'Revenue', 'green'],
      ['totalExpense', 'Expenses', 'orange'],
      ['netProfitLoss', 'Net profit / loss', 'purple']
    ],
    rowsKey: 'monthlyBreakdown',
    columns: [['month', 'Month'], ['revenue', 'Revenue'], ['expense', 'Expenses'], ['netProfit', 'Net profit']]
  },
  financial: {
    title: 'Financial report',
    description: 'A snapshot of revenue, spending, and investment performance.',
    load: 'getFinancialReport',
    summaryKey: 'metrics',
    cards: [
      ['totalRevenue', 'Revenue', 'green'],
      ['totalExpenses', 'Expenses', 'orange'],
      ['totalCurrentVal', 'Portfolio value', 'blue']
    ],
    rowsKey: null,
    columns: []
  }
};

const money = (value) =>
  Number(value || 0).toLocaleString(undefined, { style: 'currency', currency: 'USD' });

const ReportsPage = ({ type }) => {
  const config = reports[type];
  const { isAdmin } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await financeService[config.load](isAdmin ? { all: true } : {});
      setData(response);
    } catch (requestError) {
      setError(requestError.response?.data?.message || `Unable to load ${config.title.toLowerCase()}.`);
    } finally {
      setLoading(false);
    }
  }, [config, isAdmin]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  if (loading) return <div className="loading-panel">Preparing your report...</div>;
  if (error) {
    return (
      <div className="alert alert-danger d-flex justify-content-between align-items-center">
        <span>{error}</span>
        <button className="btn btn-sm btn-outline-danger" onClick={loadReport}>Retry</button>
      </div>
    );
  }

  const summary = data[config.summaryKey] || {};
  const rows = config.rowsKey ? data[config.rowsKey] || [] : [];

  return (
    <div className="page-stack">
      <section className="page-heading page-heading-reports">
        <div>
          <span className="eyebrow">{isAdmin ? 'Platform-wide report' : 'Business insights'}</span>
          <h1>{config.title}</h1>
          <p>{config.description}</p>
        </div>
        <button className="btn btn-light fw-semibold" onClick={loadReport}>
          <i className="bi bi-arrow-clockwise me-2" />Refresh
        </button>
      </section>

      <div className="row g-3">
        {config.cards.map(([key, title, color]) => (
          <div className="col-12 col-sm-6 col-xl-4" key={key}>
            <div className="metric-card">
              <div className={`metric-icon metric-icon-${color}`}><i className="bi bi-bar-chart-line" /></div>
              <div className="metric-title">{title}</div>
              <div className="metric-value">{money(summary[key])}</div>
            </div>
          </div>
        ))}
      </div>

      {config.rowsKey ? (
        <section className="card border-0 shadow-sm dashboard-card">
          <div className="card-body p-0">
            <div className="px-4 py-3 border-bottom">
              <h2 className="h5 fw-bold mb-0">{type === 'cashflow' ? 'Monthly cash flow' : 'Monthly performance'}</h2>
            </div>
            {rows.length ? (
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead><tr>{config.columns.map(([, label]) => <th key={label}>{label}</th>)}</tr></thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.month}>
                        {config.columns.map(([key]) => (
                          <td key={key} className={key === 'net' || key === 'netProfit' ? 'fw-bold' : ''}>
                            {key === 'month' ? row[key] : money(row[key])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <div className="empty-state">No dated financial activity to report yet.</div>}
          </div>
        </section>
      ) : (
        <div className="row g-4">
          <div className="col-12 col-lg-6">
            <section className="card border-0 shadow-sm dashboard-card h-100">
              <div className="card-body p-4">
                <h2 className="h5 fw-bold mb-3">Investment performance</h2>
                <div className="report-line"><span>Amount invested</span><strong>{money(summary.totalInvested)}</strong></div>
                <div className="report-line"><span>Current portfolio value</span><strong>{money(summary.totalCurrentVal)}</strong></div>
                <div className="report-line"><span>Unrealized gain / loss</span><strong>{money(summary.unrealizedGain)}</strong></div>
                <div className="report-line"><span>Return on investment</span><strong>{Number(summary.investmentRoi || 0).toFixed(2)}%</strong></div>
              </div>
            </section>
          </div>
          <div className="col-12 col-lg-6">
            <section className="card border-0 shadow-sm dashboard-card h-100">
              <div className="card-body p-4">
                <h2 className="h5 fw-bold mb-3">Quick summary</h2>
                <div className="report-line"><span>Net profit / loss</span><strong>{money(summary.netProfit)}</strong></div>
                <div className="report-line"><span>Profit margin</span><strong>{Number(summary.profitMargin || 0).toFixed(2)}%</strong></div>
                <div className="report-line"><span>Revenue transactions</span><strong>{summary.revenueTransactions || 0}</strong></div>
                <div className="report-line"><span>Expense transactions</span><strong>{summary.expenseTransactions || 0}</strong></div>
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;

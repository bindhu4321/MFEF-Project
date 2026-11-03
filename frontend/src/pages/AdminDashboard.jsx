import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../services/adminService';

const money = (value) =>
  Number(value || 0).toLocaleString(undefined, { style: 'currency', currency: 'USD' });

const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminService.getAdminDashboard();
      setDashboard(response);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load the admin dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading) return <div className="loading-panel">Loading admin overview...</div>;
  if (error) {
    return (
      <div className="alert alert-danger d-flex justify-content-between align-items-center">
        <span>{error}</span>
        <button className="btn btn-sm btn-outline-danger" onClick={loadDashboard}>Retry</button>
      </div>
    );
  }

  const stats = dashboard.stats;
  const cards = [
    { title: 'Business accounts', value: stats.totalUsers, icon: 'bi-people', color: 'blue' },
    { title: 'System revenue', value: money(stats.totalRevenue), icon: 'bi-arrow-down-left-circle', color: 'green' },
    { title: 'System expenses', value: money(stats.totalExpenses), icon: 'bi-arrow-up-right-circle', color: 'orange' },
    { title: 'Net balance', value: money(stats.netSystemBalance), icon: 'bi-wallet2', color: 'purple' }
  ];

  return (
    <div className="page-stack">
      <section className="page-heading page-heading-admin">
        <div>
          <span className="eyebrow">System overview</span>
          <h1>Welcome to your admin workspace</h1>
          <p>Monitor business accounts and the financial activity across the platform.</p>
        </div>
        <Link className="btn btn-light fw-semibold" to="/reports">
          <i className="bi bi-file-earmark-bar-graph me-2" />View reports
        </Link>
      </section>

      <div className="row g-3">
        {cards.map((card) => (
          <div className="col-12 col-sm-6 col-xxl-3" key={card.title}>
            <div className="metric-card">
              <div className={`metric-icon metric-icon-${card.color}`}><i className={`bi ${card.icon}`} /></div>
              <div className="metric-title">{card.title}</div>
              <div className="metric-value">{card.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-12 col-xl-8">
          <section className="card border-0 shadow-sm dashboard-card">
            <div className="card-body p-0">
              <div className="px-4 py-3 border-bottom">
                <h2 className="h5 fw-bold mb-1">Business accounts</h2>
                <span className="small text-muted">Financial totals per account</span>
              </div>
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead><tr><th>Business</th><th>Role</th><th>Revenue</th><th>Expenses</th><th>Net</th></tr></thead>
                  <tbody>
                    {dashboard.users.map((account) => (
                      <tr key={account.id}>
                        <td>
                          <span className="fw-semibold d-block">{account.business_name || account.name}</span>
                          <span className="small text-muted">{account.email}</span>
                        </td>
                        <td><span className="badge text-bg-light">{account.role}</span></td>
                        <td className="text-success fw-semibold">{money(account.total_revenue)}</td>
                        <td className="text-danger fw-semibold">{money(account.total_expense)}</td>
                        <td className="fw-bold">{money(account.net_income)}</td>
                      </tr>
                    ))}
                    {dashboard.users.length === 0 && (
                      <tr><td className="text-center text-muted py-4" colSpan="5">No business accounts found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
        <div className="col-12 col-xl-4">
          <section className="card border-0 shadow-sm dashboard-card h-100">
            <div className="card-body p-4">
              <h2 className="h5 fw-bold mb-3">Quick access</h2>
              <div className="quick-links">
                <Link to="/revenue"><i className="bi bi-graph-up-arrow text-success" />Review revenue</Link>
                <Link to="/expenses"><i className="bi bi-graph-down-arrow text-danger" />Review expenses</Link>
                <Link to="/investments"><i className="bi bi-piggy-bank text-primary" />Review investments</Link>
                <Link to="/reports"><i className="bi bi-bar-chart-line text-info" />Financial reports</Link>
              </div>
              <div className="admin-note mt-4">
                <i className="bi bi-shield-check" />
                <span>Admin pages and all-business figures are available only to authenticated administrator accounts.</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

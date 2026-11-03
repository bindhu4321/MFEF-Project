import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import financeService from '../services/financeService';

const configs = {
  revenue: {
    title: 'Revenue',
    singular: 'Revenue',
    description: 'Record money coming into your business.',
    icon: 'bi-graph-up-arrow',
    color: 'success',
    load: 'getRevenues',
    create: 'createRevenue',
    remove: 'deleteRevenue',
    amountLabel: 'Amount received',
    amountField: 'amount',
    categories: ['Sales', 'Services', 'Consulting', 'Other']
  },
  expenses: {
    title: 'Expenses',
    singular: 'Expense',
    description: 'Track business spending and operating costs.',
    icon: 'bi-graph-down-arrow',
    color: 'danger',
    load: 'getExpenses',
    create: 'createExpense',
    remove: 'deleteExpense',
    amountLabel: 'Expense amount',
    amountField: 'amount',
    categories: ['Supplies', 'Rent', 'Payroll', 'Marketing', 'Travel', 'Other']
  },
  investments: {
    title: 'Investments',
    singular: 'Investment',
    description: 'Keep an eye on invested amounts and current values.',
    icon: 'bi-piggy-bank',
    color: 'primary',
    load: 'getInvestments',
    create: 'createInvestment',
    remove: 'deleteInvestment',
    amountLabel: 'Amount invested',
    amountField: 'amount_invested',
    categories: ['Stocks', 'Equipment', 'Property', 'Bonds', 'Other']
  }
};

const today = () => new Date().toISOString().slice(0, 10);

const initialForm = () => ({
  title: '',
  amount: '',
  current_value: '',
  category: '',
  date: today(),
  notes: ''
});

const money = (amount) =>
  Number(amount || 0).toLocaleString(undefined, { style: 'currency', currency: 'USD' });

const FinancialRecords = ({ type }) => {
  const config = configs[type];
  const { isAdmin } = useAuth();
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await financeService[config.load](isAdmin ? { all: true } : {});
      setRecords(response.data || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || `Unable to load ${config.title.toLowerCase()}.`);
    } finally {
      setLoading(false);
    }
  }, [config, isAdmin]);

  useEffect(() => {
    setForm(initialForm());
    setNotice('');
    loadRecords();
  }, [loadRecords, type]);

  const total = useMemo(
    () =>
      records.reduce(
        (sum, record) => sum + Number(type === 'investments' ? record.current_value : record.amount),
        0
      ),
    [records, type]
  );

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');
    setSaving(true);
    try {
      const payload =
        type === 'investments'
          ? {
              title: form.title,
              amount_invested: form.amount,
              current_value: form.current_value,
              asset_type: form.category,
              date: form.date,
              notes: form.notes
            }
          : {
              title: form.title,
              amount: form.amount,
              category: form.category,
              date: form.date,
              notes: form.notes
            };
      await financeService[config.create](payload);
      setForm(initialForm());
      setNotice(`${config.singular} saved successfully.`);
      await loadRecords();
    } catch (requestError) {
      setError(requestError.response?.data?.message || `Unable to save ${config.title.toLowerCase()} record.`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (record) => {
    if (!window.confirm(`Delete "${record.title}"? This cannot be undone.`)) return;
    setError('');
    setNotice('');
    try {
      await financeService[config.remove](record.id);
      setNotice('Record deleted.');
      await loadRecords();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to delete this record.');
    }
  };

  return (
    <div className="page-stack">
      <section className={`page-heading page-heading-${config.color}`}>
        <div>
          <span className="eyebrow">{isAdmin ? 'All businesses' : 'Your business'}</span>
          <h1>{config.title}</h1>
          <p>{config.description}</p>
        </div>
        <div className="heading-total">
          <span>{type === 'investments' ? 'Portfolio value' : 'Total recorded'}</span>
          <strong>{money(total)}</strong>
        </div>
      </section>

      {error && <div className="alert alert-danger">{error}</div>}
      {notice && <div className="alert alert-success">{notice}</div>}

      <div className="row g-4 align-items-start">
        <div className="col-12 col-xl-4">
          <section className="card border-0 shadow-sm dashboard-card">
            <div className="card-body p-4">
              <div className="d-flex align-items-center gap-2 mb-3">
                <span className={`section-icon text-bg-${config.color}`}>
                  <i className={`bi ${config.icon}`} />
                </span>
                <div>
                  <h2 className="h5 fw-bold mb-0">Add {config.singular}</h2>
                  <span className="small text-muted">Enter the amount and details below.</span>
                </div>
              </div>
              <form onSubmit={handleSubmit}>
                <label className="form-label">Description</label>
                <input
                  className="form-control mb-3"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Monthly service invoice"
                  required
                />
                <div className="row g-3">
                  <div className={type === 'investments' ? 'col-6' : 'col-12'}>
                    <label className="form-label">{config.amountLabel} ($)</label>
                    <input
                      className="form-control"
                      type="number"
                      name="amount"
                      value={form.amount}
                      onChange={handleChange}
                      min="0.01"
                      step="0.01"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  {type === 'investments' && (
                    <div className="col-6">
                      <label className="form-label">Current value ($)</label>
                      <input
                        className="form-control"
                        type="number"
                        name="current_value"
                        value={form.current_value}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  )}
                  <div className="col-sm-6">
                    <label className="form-label">{type === 'investments' ? 'Asset type' : 'Category'}</label>
                    <select className="form-select" name="category" value={form.category} onChange={handleChange} required>
                      <option value="">Choose one</option>
                      {config.categories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-sm-6">
                    <label className="form-label">Date</label>
                    <input className="form-control" type="date" name="date" value={form.date} onChange={handleChange} required />
                  </div>
                </div>
                <label className="form-label mt-3">Notes (optional)</label>
                <textarea className="form-control mb-3" name="notes" rows="2" value={form.notes} onChange={handleChange} />
                <button className={`btn btn-${config.color} w-100 fw-semibold`} type="submit" disabled={saving}>
                  {saving ? 'Saving...' : `Save ${config.singular}`}
                </button>
              </form>
            </div>
          </section>
        </div>

        <div className="col-12 col-xl-8">
          <section className="card border-0 shadow-sm dashboard-card">
            <div className="card-body p-0">
              <div className="px-4 py-3 border-bottom d-flex justify-content-between align-items-center">
                <div>
                  <h2 className="h5 fw-bold mb-1">Recent {config.title.toLowerCase()}</h2>
                  <span className="small text-muted">{records.length} record{records.length === 1 ? '' : 's'}</span>
                </div>
                <button className="btn btn-sm btn-outline-secondary" onClick={loadRecords} disabled={loading}>
                  <i className="bi bi-arrow-clockwise me-1" />Refresh
                </button>
              </div>
              {loading ? (
                <div className="p-5 text-center text-muted">Loading records...</div>
              ) : records.length === 0 ? (
                <div className="empty-state">
                  <i className={`bi ${config.icon}`} />
                  <p>No {config.title.toLowerCase()} recorded yet.</p>
                  <span>Add the first amount using the form.</span>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table align-middle mb-0">
                    <thead>
                      <tr>
                        {isAdmin && <th>Business</th>}
                        <th>Description</th>
                        <th>Category</th>
                        <th>Date</th>
                        <th className="text-end">Amount</th>
                        <th aria-label="Actions" />
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((record) => (
                        <tr key={record.id}>
                          {isAdmin && <td>{record.business_name || record.user_name || 'Business'}</td>}
                          <td className="fw-semibold">{record.title}</td>
                          <td><span className={`badge text-bg-${config.color}-subtle`}>{record.category || record.asset_type}</span></td>
                          <td>{String(record.date).slice(0, 10)}</td>
                          <td className="text-end fw-bold">
                            {type === 'investments'
                              ? `${money(record.amount_invested)} / ${money(record.current_value)}`
                              : money(record.amount)}
                          </td>
                          <td className="text-end">
                            <button
                              className="btn btn-sm btn-outline-danger"
                              type="button"
                              onClick={() => handleDelete(record)}
                              aria-label={`Delete ${record.title}`}
                            >
                              <i className="bi bi-trash" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default FinancialRecords;

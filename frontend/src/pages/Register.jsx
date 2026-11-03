import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    business_name: '',
    phone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const res = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        business_name: formData.business_name,
        phone: formData.phone
      });

      if (res.success) {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Registration error:', err);
      const msg = err.response?.data?.message || 'Registration failed. Please check inputs.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container min-vh-100 d-flex align-items-center justify-content-center bg-light py-5 px-3">
      <div className="card shadow-lg border-0 rounded-4 overflow-hidden w-100" style={{ maxWidth: '520px' }}>
        <div className="card-header bg-primary text-white text-center py-4 border-0">
          <div className="brand-logo-icon bg-white text-primary rounded-circle d-inline-flex p-3 mb-2 shadow-sm">
            <i className="bi bi-briefcase-fill fs-2"></i>
          </div>
          <h4 className="fw-bold mb-1">Create Account</h4>
          <p className="small mb-0 text-white-50">Set up your business financial ledger</p>
        </div>

        <div className="card-body p-4 p-sm-5">
          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2 small mb-3">
              <i className="bi bi-exclamation-triangle-fill fs-5"></i>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="row g-3 mb-3">
              <div className="col-sm-6">
                <label className="form-label fw-semibold text-secondary small">Your Full Name *</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-sm-6">
                <label className="form-label fw-semibold text-secondary small">Business Name</label>
                <input
                  type="text"
                  name="business_name"
                  className="form-control"
                  placeholder="e.g. Acme Tech Studio"
                  value={formData.business_name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-sm-6">
                <label className="form-label fw-semibold text-secondary small">Work Email Address *</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-sm-6">
                <label className="form-label fw-semibold text-secondary small">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-control"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-sm-6">
                <label className="form-label fw-semibold text-secondary small">Password (min 6 chars) *</label>
                <div className="input-group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    className="form-control border-end-0"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary border-start-0 bg-white"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                  </button>
                </div>
              </div>
              <div className="col-sm-6">
                <label className="form-label fw-semibold text-secondary small">Confirm Password *</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  className="form-control"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-2.5 fw-bold rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status"></span>
                  <span>Registering Account...</span>
                </>
              ) : (
                <>
                  <i className="bi bi-person-plus-fill fs-5"></i>
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          <div className="text-center mt-4 pt-2">
            <span className="small text-muted">Already have an account? </span>
            <Link to="/login" className="small fw-bold text-primary text-decoration-none">
              Sign In Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

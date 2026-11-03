import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginRole, setLoginRole] = useState('user');

  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const sessionExpired = new URLSearchParams(location.search).get('session') === 'expired';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email address and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await login(email, password);
      if (res.success) {
        if (res.user.role !== loginRole) {
          logout();
          setError(`This account is registered as a ${res.user.role === 'admin' ? 'administrator' : 'business owner'}. Choose the matching sign-in option.`);
          return;
        }
        navigate(location.state?.from?.pathname || (res.user.role === 'admin' ? '/admin' : '/dashboard'), { replace: true });
      }
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.response?.data?.message || 'Login failed. Please verify your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (type) => {
    if (type === 'admin') {
      setEmail('admin@business.com');
      setPassword('adminPassword123!');
      setLoginRole('admin');
    } else {
      setEmail('sarah@apex.com');
      setPassword('userPassword123!');
      setLoginRole('user');
    }
    setError('');
  };

  return (
    <div className="auth-container min-vh-100 d-flex align-items-center justify-content-center bg-light py-5 px-3">
      <div className="card shadow-lg border-0 rounded-4 overflow-hidden w-100" style={{ maxWidth: '440px' }}>
        <div className="card-header bg-primary text-white text-center py-4 border-0">
          <div className="brand-logo-icon bg-white text-primary rounded-circle d-inline-flex p-3 mb-2 shadow-sm">
            <i className="bi bi-shield-check fs-2"></i>
          </div>
          <h4 className="fw-bold mb-1">Small Business Finance</h4>
          <p className="small mb-0 text-white-50">Your business finances, clearly in view.</p>
        </div>

        <div className="card-body p-4 p-sm-5">
          <div className="login-role-picker mb-4">
            <button
              type="button"
              className={`login-role-option ${loginRole === 'user' ? 'active' : ''}`}
              onClick={() => { setLoginRole('user'); setError(''); }}
              aria-pressed={loginRole === 'user'}
            >
              <i className="bi bi-briefcase" />
              <span>Business login</span>
            </button>
            <button
              type="button"
              className={`login-role-option ${loginRole === 'admin' ? 'active' : ''}`}
              onClick={() => { setLoginRole('admin'); setError(''); }}
              aria-pressed={loginRole === 'admin'}
            >
              <i className="bi bi-shield-lock" />
              <span>Admin login</span>
            </button>
          </div>

          {sessionExpired && (
            <div className="alert alert-warning d-flex align-items-center gap-2 small mb-3">
              <i className="bi bi-clock-history fs-5"></i>
              <span>Your session has expired. Please sign in again.</span>
            </div>
          )}

          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2 small mb-3">
              <i className="bi bi-exclamation-triangle-fill fs-5"></i>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold text-secondary small">Email Address</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <i className="bi bi-envelope text-muted"></i>
                </span>
                <input
                  type="email"
                  className="form-control border-start-0 ps-0"
                  placeholder="name@business.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="form-label fw-semibold text-secondary small mb-0">Password</label>
              </div>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <i className="bi bi-lock text-muted"></i>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control border-start-0 border-end-0 ps-0"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            <button
              type="submit"
              className="btn btn-primary w-100 py-2.5 fw-bold rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status"></span>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <i className="bi bi-box-arrow-in-right fs-5"></i>
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-4 pt-3 border-top text-center">
            <span className="x-small text-muted fw-bold text-uppercase d-block mb-2">Demo account shortcuts</span>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary w-50 small"
                onClick={() => fillCredentials('user')}
              >
                <i className="bi bi-person me-1"></i> Business User
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-danger w-50 small"
                onClick={() => fillCredentials('admin')}
              >
                <i className="bi bi-shield-lock me-1"></i> Admin Demo
              </button>
            </div>
          </div>

          <div className="text-center mt-4 pt-2">
            <span className="small text-muted">Don't have an account yet? </span>
            <Link to="/register" className="small fw-bold text-primary text-decoration-none">
              Register Business
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

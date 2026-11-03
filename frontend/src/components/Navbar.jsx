import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onToggleSidebar, pageTitle = 'Dashboard' }) => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Do you wish to log out?')) {
      logout();
      navigate('/login');
    }
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <nav className="navbar navbar-expand bg-white border-bottom sticky-top px-3 py-2.5 top-navbar">
      <div className="container-fluid px-0 d-flex justify-content-between align-items-center">
        {/* Left side: Toggle button & page title */}
        <div className="d-flex align-items-center gap-3">
          <button
            type="button"
            className="btn btn-outline-secondary border-0 d-lg-none p-1.5"
            onClick={onToggleSidebar}
            aria-label="Toggle Navigation"
          >
            <i className="bi bi-list fs-4"></i>
          </button>
          <div>
            <h5 className="fw-bold mb-0 text-dark">{pageTitle}</h5>
            <span className="text-muted small d-none d-sm-inline">
              {user?.business_name ? `${user.business_name} • ` : ''}{currentDate}
            </span>
          </div>
        </div>

        {/* Right side: Quick stats badge, User info, and Logout */}
        <div className="d-flex align-items-center gap-3">
          <div className="d-none d-md-flex align-items-center gap-2 border rounded-pill px-3 py-1 bg-light">
            <span className="spinner-grow spinner-grow-sm text-success" role="status"></span>
            <span className="x-small fw-semibold text-secondary">System Online</span>
          </div>

          <Link
            to="/profile"
            className="d-flex align-items-center gap-2 text-decoration-none text-dark bg-light px-2.5 py-1.5 rounded-pill border hover-bg-subtle"
          >
            <div className="avatar-mini rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="d-none d-sm-block text-start me-1">
              <div className="fw-semibold small line-height-1">{user?.name?.split(' ')[0]}</div>
              <div className="x-small text-muted">{isAdmin ? 'Admin' : 'Owner'}</div>
            </div>
          </Link>

          <button
            type="button"
            className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1 rounded-pill px-2.5 py-1"
            onClick={handleLogout}
            title="Log out of application"
          >
            <i className="bi bi-box-arrow-right"></i>
            <span className="d-none d-md-inline">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;


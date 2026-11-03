import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out of your financial account?')) {
      logout();
      navigate('/login');
    }
  };

  const navItemClass = ({ isActive }) =>
    `nav-link d-flex align-items-center gap-3 px-3 py-2.5 rounded-3 fw-medium ${
      isActive ? 'active-nav-link text-white bg-primary' : 'text-secondary hover-nav-item'
    }`;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="sidebar-backdrop d-lg-none position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
          style={{ zIndex: 1040 }}
          onClick={onClose}
        />
      )}

      <aside className={`sidebar bg-white border-end d-flex flex-column ${isOpen ? 'show' : ''}`}>
        {/* Brand header */}
        <div className="sidebar-header p-4 border-bottom d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <div className="brand-logo-badge bg-primary text-white rounded-3 p-2 d-flex align-items-center justify-content-center shadow-sm">
              <i className="bi bi-wallet2 fs-5"></i>
            </div>
            <div>
              <h6 className="fw-bold mb-0 text-dark">FinanceTrack</h6>
              <span className="badge bg-secondary-subtle text-secondary x-small">Small Business ERP</span>
            </div>
          </div>
          <button 
            type="button" 
            className="btn btn-sm btn-light border-0 d-lg-none"
            onClick={onClose}
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* User Card */}
        <div className="px-4 py-3 bg-light border-bottom">
          <div className="d-flex align-items-center gap-3">
            <div className="avatar-circle rounded-circle bg-primary-subtle text-primary fw-bold d-flex align-items-center justify-content-center">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden">
              <div className="fw-bold text-dark text-truncate small">{user?.name}</div>
              <div className="text-muted x-small text-truncate">{user?.business_name || 'My Small Business'}</div>
              <span className={`badge ${isAdmin ? 'bg-danger' : 'bg-primary'} x-small mt-1`}>
                {isAdmin ? 'ADMINISTRATOR' : 'BUSINESS OWNER'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="sidebar-menu p-3 flex-grow-1 overflow-y-auto">
          <div className="text-uppercase x-small text-muted fw-bold px-3 mb-2">Core Dashboards</div>
          <ul className="nav flex-column gap-1 mb-3">
            <li className="nav-item">
              <NavLink to={isAdmin ? '/admin' : '/dashboard'} className={navItemClass} onClick={() => onClose && onClose()}>
                <i className={`bi ${isAdmin ? 'bi-shield-lock-fill text-danger' : 'bi-speedometer2'} fs-5`}></i>
                <span>{isAdmin ? 'Admin Dashboard' : 'Business Dashboard'}</span>
              </NavLink>
            </li>
          </ul>

          <div className="text-uppercase x-small text-muted fw-bold px-3 mb-2">Operations</div>
          <ul className="nav flex-column gap-1 mb-3">
            <li className="nav-item">
              <NavLink to="/revenue" className={navItemClass} onClick={() => onClose && onClose()}>
                <i className="bi bi-graph-up-arrow fs-5 text-success"></i>
                <span>Revenue</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/expenses" className={navItemClass} onClick={() => onClose && onClose()}>
                <i className="bi bi-graph-down-arrow fs-5 text-danger"></i>
                <span>Expenses</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/investments" className={navItemClass} onClick={() => onClose && onClose()}>
                <i className="bi bi-piggy-bank fs-5 text-primary"></i>
                <span>Investments</span>
              </NavLink>
            </li>
          </ul>

          <div className="text-uppercase x-small text-muted fw-bold px-3 mb-2">Financial Analysis</div>
          <ul className="nav flex-column gap-1 mb-3">
            <li className="nav-item">
              <NavLink to="/cash-flow" className={navItemClass} onClick={() => onClose && onClose()}>
                <i className="bi bi-arrow-left-right fs-5 text-info"></i>
                <span>Cash Flow</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/profit-loss" className={navItemClass} onClick={() => onClose && onClose()}>
                <i className="bi bi-calculator fs-5 text-warning"></i>
                <span>Profit & Loss</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/reports" className={navItemClass} onClick={() => onClose && onClose()}>
                <i className="bi bi-file-earmark-bar-graph fs-5 text-secondary"></i>
                <span>Financial Reports</span>
              </NavLink>
            </li>
          </ul>

          <div className="text-uppercase x-small text-muted fw-bold px-3 mb-2">Account</div>
          <ul className="nav flex-column gap-1">
            <li className="nav-item">
              <NavLink to="/profile" className={navItemClass} onClick={() => onClose && onClose()}>
                <i className="bi bi-person-gear fs-5"></i>
                <span>User Profile</span>
              </NavLink>
            </li>
          </ul>
        </div>

        {/* Sidebar Footer Logout */}
        <div className="p-3 border-top bg-light">
          <button 
            type="button" 
            className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2 py-2 fw-semibold"
            onClick={handleLogout}
          >
            <i className="bi bi-box-arrow-right fs-5"></i>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

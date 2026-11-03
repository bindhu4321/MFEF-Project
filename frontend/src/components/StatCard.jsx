import React from 'react';

const StatCard = ({ title, value, subtext, icon, variant = 'primary', isPositive, prefix = '$' }) => {
  const formatCurrency = (val) => {
    if (val === undefined || val === null) return '$0.00';
    if (typeof val === 'number') {
      return `${prefix}${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `${prefix}${val}`;
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          bg: 'bg-success-subtle text-success',
          border: 'border-success-subtle',
          iconBg: 'rgba(25, 135, 84, 0.15)',
          iconColor: '#198754'
        };
      case 'danger':
        return {
          bg: 'bg-danger-subtle text-danger',
          border: 'border-danger-subtle',
          iconBg: 'rgba(220, 53, 69, 0.15)',
          iconColor: '#dc3545'
        };
      case 'warning':
        return {
          bg: 'bg-warning-subtle text-warning-emphasis',
          border: 'border-warning-subtle',
          iconBg: 'rgba(255, 193, 7, 0.2)',
          iconColor: '#d39e00'
        };
      case 'info':
        return {
          bg: 'bg-info-subtle text-info-emphasis',
          border: 'border-info-subtle',
          iconBg: 'rgba(13, 202, 240, 0.2)',
          iconColor: '#0dcaf0'
        };
      case 'purple':
        return {
          bg: 'bg-primary-subtle text-primary',
          border: 'border-primary-subtle',
          iconBg: 'rgba(111, 66, 193, 0.15)',
          iconColor: '#6f42c1'
        };
      default:
        return {
          bg: 'bg-primary-subtle text-primary',
          border: 'border-primary-subtle',
          iconBg: 'rgba(13, 110, 253, 0.15)',
          iconColor: '#0d6efd'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="card shadow-sm border-0 stat-card h-100">
      <div className="card-body p-4">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <span className="text-muted fw-semibold text-uppercase small tracking-wide">{title}</span>
          <div
            className="rounded-3 d-flex align-items-center justify-content-center"
            style={{ width: '48px', height: '48px', backgroundColor: styles.iconBg, color: styles.iconColor }}
          >
            <i className={`bi ${icon} fs-4`}></i>
          </div>
        </div>
        <div className="d-flex align-items-baseline gap-2 mb-1">
          <h3 className="fw-bold mb-0 text-dark">
            {typeof value === 'number' ? formatCurrency(value) : value}
          </h3>
        </div>
        {subtext && (
          <p className="small text-muted mb-0 d-flex align-items-center gap-1">
            {isPositive !== undefined && (
              <span className={`fw-semibold ${isPositive ? 'text-success' : 'text-danger'}`}>
                <i className={`bi bi-arrow-${isPositive ? 'up' : 'down'}-right me-1`}></i>
              </span>
            )}
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatCard;


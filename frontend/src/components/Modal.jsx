import React, { useEffect } from 'react';

const Modal = ({ show, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [show]);

  if (!show) return null;

  return (
    <div className="custom-modal-wrapper position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3" style={{ zIndex: 1055 }}>
      {/* Backdrop */}
      <div 
        className="modal-backdrop-custom position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
        onClick={onClose}
      />
      {/* Modal Dialog */}
      <div className={`card shadow-lg border-0 position-relative w-100 modal-card modal-${size}`} style={{ maxWidth: size === 'lg' ? '800px' : size === 'xl' ? '1000px' : '550px', zIndex: 1060 }}>
        <div className="card-header bg-white border-bottom p-3 d-flex align-items-center justify-content-between">
          <h5 className="modal-title fw-bold text-dark mb-0">{title}</h5>
          <button 
            type="button" 
            className="btn-close" 
            aria-label="Close"
            onClick={onClose}
          />
        </div>
        <div className="card-body p-4 max-h-75 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;


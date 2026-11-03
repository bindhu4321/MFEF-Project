import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const pageTitles = {
  '/dashboard': 'Business dashboard',
  '/admin': 'Admin dashboard',
  '/revenue': 'Revenue',
  '/expenses': 'Expenses',
  '/investments': 'Investments',
  '/cash-flow': 'Cash flow',
  '/profit-loss': 'Profit & loss',
  '/reports': 'Financial reports',
  '/profile': 'My profile'
};

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <div className="app-shell">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="app-main">
        <Navbar
          pageTitle={pageTitles[pathname] || 'FinanceTrack'}
          onToggleSidebar={() => setSidebarOpen((open) => !open)}
        />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;

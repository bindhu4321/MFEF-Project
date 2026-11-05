import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './components/AppLayout';
import AdminDashboard from './pages/AdminDashboard';
import FinancialRecords from './pages/FinancialRecords';
import Login from './pages/Login';
import Register from './pages/Register';
import ReportsPage from './pages/ReportsPage';
import UserDashboard from './pages/UserDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

const RoleDashboard = () => {
  const { isAdmin } = useAuth();
  return isAdmin ? <Navigate to="/admin" replace /> : <UserDashboard />;
};

const ProfilePage = () => {
  const { user, isAdmin } = useAuth();

  return (
    <div className="card border-0 shadow-sm dashboard-card">
      <div className="card-body p-4">
        <div className="d-flex align-items-center gap-3 mb-4">
          <div className="profile-avatar">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
          <div>
            <h2 className="h4 fw-bold mb-1">{user?.name}</h2>
            <span className="text-muted">{isAdmin ? 'Administrator' : 'Business owner'}</span>
          </div>
        </div>
        <dl className="row mb-0">
          <dt className="col-sm-3 text-muted">Email</dt>
          <dd className="col-sm-9">{user?.email}</dd>
          <dt className="col-sm-3 text-muted">Business</dt>
          <dd className="col-sm-9">{user?.business_name || 'Not set'}</dd>
          <dt className="col-sm-3 text-muted">Phone</dt>
          <dd className="col-sm-9">{user?.phone || 'Not set'}</dd>
        </dl>
      </div>
    </div>
  );
};

const AppRoutes = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? (isAdmin ? '/admin' : '/dashboard') : '/login'} replace />}
      />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<RoleDashboard />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route path="/revenue" element={<FinancialRecords type="revenue" />} />
        <Route path="/expenses" element={<FinancialRecords type="expenses" />} />
        <Route path="/investments" element={<FinancialRecords type="investments" />} />
        <Route path="/cash-flow" element={<ReportsPage type="cashflow" />} />
        <Route path="/profit-loss" element={<ReportsPage type="profit-loss" />} />
        <Route path="/reports" element={<ReportsPage type="financial" />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => (
  <AuthProvider>
    <BrowserRouter basename={import.meta.env.PROD ? import.meta.env.BASE_URL : '/'}>
      <AppRoutes />
    </BrowserRouter>
  </AuthProvider>
);

export default App;

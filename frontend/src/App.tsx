import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Shield } from 'lucide-react';

// Lazy loading pages for better performance
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const SurveyPage = React.lazy(() => import('./pages/SurveyPage'));
const MemberDashboard = React.lazy(() => import('./pages/MemberDashboard'));
const LeaderDashboard = React.lazy(() => import('./pages/LeaderDashboard'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));

// Layout Component
const Layout = ({ children }: { children: React.ReactNode }) => {
  const { userData, signOut } = useAuth();
  
  return (
    <div className="min-h-screen">
      <nav>
        <div className="nav-container">
          <div className="nav-logo">
            <Shield size={24} />
            DIME Dynamics
          </div>
          {userData && (
            <div className="nav-links">
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                {userData.full_name} ({userData.role.replace('_', ' ')})
              </span>
              <button 
                onClick={signOut} 
                className="btn btn-secondary" 
                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </nav>
      <main className="page-container animate-fade-in">
        {children}
      </main>
    </div>
  );
};

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { user, userData, isLoading } = useAuth();

  if (isLoading) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem' }}>Loading DIME System...</div>;
  if (!user) return <Navigate to="/login" replace />;
  
  if (allowedRoles && userData && !allowedRoles.includes(userData.role)) {
    // Redirect to their appropriate dashboard if unauthorized
    if (userData.role === 'admin' || userData.role === 'hr_analyst') return <Navigate to="/admin" replace />;
    if (userData.role === 'team_leader') return <Navigate to="/leader" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <BrowserRouter>
      <React.Suspense fallback={<div style={{ textAlign: 'center', padding: '4rem' }}>Loading application...</div>}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['team_member', 'team_leader', 'admin']}>
              <MemberDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/leader" element={
            <ProtectedRoute allowedRoles={['team_leader', 'admin']}>
              <LeaderDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin', 'hr_analyst']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="/survey/:id" element={
            <ProtectedRoute>
              <SurveyPage />
            </ProtectedRoute>
          } />
          
          {/* Default Route */}
          <Route path="/" element={
            <ProtectedRoute>
              <Navigate to="/dashboard" replace />
            </ProtectedRoute>
          } />
        </Routes>
      </React.Suspense>
    </BrowserRouter>
  );
}

export default App;

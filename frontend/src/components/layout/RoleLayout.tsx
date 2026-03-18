import React from 'react';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

export default function RoleLayout({ allowedRoles }: { allowedRoles?: string[] }) {
  const { user, userData, isLoading } = useAuth();

  if (isLoading) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem' }}>Loading DIME System...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!userData) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem' }}>Loading Profile...</div>;
  
  if (userData.status === 'pending') return <Navigate to="/pending" replace />;
  if (userData.status === 'rejected') return <Navigate to="/rejected" replace />;
  if (userData.status === 'suspended') return <Navigate to="/suspended" replace />;

  if (allowedRoles && !allowedRoles.includes(userData.role)) {
    if (userData.role === 'system_admin') return <Navigate to="/admin/dashboard" replace />;
    if (userData.role === 'organization_admin') return <Navigate to="/org/dashboard" replace />;
    if (userData.role === 'leader') return <Navigate to="/leader/dashboard" replace />;
    if (userData.role === 'hr_analyst') return <Navigate to="/hr/dashboard" replace />;
    return <Navigate to="/member/dashboard" replace />;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F9FAFB' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: '260px', display: 'flex', flexDirection: 'column', width: 'calc(100% - 260px)' }}>
        <TopNav />
        <main style={{ padding: '2rem', flex: 1, overflowX: 'hidden' }} className="animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

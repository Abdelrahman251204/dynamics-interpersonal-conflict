import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Shield, Users, Activity, Settings, 
  BarChart2, FileText, LayoutDashboard, 
  UserCheck, AlertTriangle, User, LogOut, Heart
} from 'lucide-react';

export default function Sidebar() {
  const { userData, signOut } = useAuth();
  const location = useLocation();

  if (!userData) return null;

  const role = userData.role;

  const links: Record<string, {name: string, path: string, icon: React.ReactNode}[]> = {
    system_admin: [
      { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
      { name: 'Access Requests', path: '/admin/access-requests', icon: <UserCheck size={20} /> },
      { name: 'Organizations', path: '/admin/organizations', icon: <Shield size={20} /> },
      { name: 'Groups', path: '/admin/groups', icon: <Users size={20} /> },
      { name: 'Users', path: '/admin/users', icon: <User size={20} /> },
      { name: 'Surveys Library', path: '/admin/surveys', icon: <FileText size={20} /> },
      { name: 'Analytics', path: '/admin/analytics', icon: <BarChart2 size={20} /> },
      { name: 'Risk Flags', path: '/admin/risk-flags', icon: <AlertTriangle size={20} /> },
      { name: 'Audit Logs', path: '/admin/audit-logs', icon: <Activity size={20} /> },
      { name: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
    ],
    organization_admin: [
      { name: 'Dashboard', path: '/org/dashboard', icon: <LayoutDashboard size={20} /> },
      { name: 'Groups', path: '/org/groups', icon: <Users size={20} /> },
      { name: 'Members', path: '/org/members', icon: <User size={20} /> },
      { name: 'Surveys', path: '/org/surveys', icon: <FileText size={20} /> },
      { name: 'Analytics', path: '/org/analytics', icon: <BarChart2 size={20} /> },
      { name: 'Reports', path: '/org/reports', icon: <FileText size={20} /> },
      { name: 'Profile', path: '/org/profile', icon: <Settings size={20} /> },
    ],
    leader: [
      { name: 'Team Dashboard', path: '/leader/dashboard', icon: <LayoutDashboard size={20} /> },
      { name: 'Team Members', path: '/leader/team', icon: <Users size={20} /> },
      { name: 'Surveys', path: '/leader/surveys', icon: <FileText size={20} /> },
      { name: 'Analytics', path: '/leader/analytics', icon: <BarChart2 size={20} /> },
      { name: 'Conflict Map', path: '/leader/conflict-map', icon: <Activity size={20} /> },
      { name: 'Alerts', path: '/leader/alerts', icon: <AlertTriangle size={20} /> },
      { name: 'Recommendations', path: '/leader/recommendations', icon: <Heart size={20} /> },
    ],
    member: [
      { name: 'My Dashboard', path: '/member/dashboard', icon: <LayoutDashboard size={20} /> },
      { name: 'Active Surveys', path: '/member/surveys', icon: <FileText size={20} /> },
      { name: 'History', path: '/member/survey-history', icon: <Activity size={20} /> },
      { name: 'My Results', path: '/member/results', icon: <BarChart2 size={20} /> },
      { name: 'Trends', path: '/member/trends', icon: <Activity size={20} /> },
      { name: 'Profile', path: '/member/profile', icon: <User size={20} /> },
    ],
    hr_analyst: [
      { name: 'HR Dashboard', path: '/hr/dashboard', icon: <LayoutDashboard size={20} /> },
      { name: 'Risk Flags', path: '/hr/flags', icon: <AlertTriangle size={20} /> },
      { name: 'Cases', path: '/hr/cases', icon: <UserCheck size={20} /> },
      { name: 'Interventions', path: '/hr/interventions', icon: <Heart size={20} /> },
      { name: 'Reports', path: '/hr/reports', icon: <FileText size={20} /> },
    ]
  };

  const navLinks = links[role as keyof typeof links] || [];

  return (
    <div style={{
      width: '260px',
      background: 'white',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      height: '100vh',
      left: 0,
      top: 0,
      zIndex: 40
    }}>
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <img src="/dynamics-interpersonal-conflict/logo.png" alt="DIME" style={{ height: '32px', borderRadius: '4px' }} />
        <span style={{ fontWeight: 600, fontSize: '1.25rem', color: 'var(--primary)' }}>DIME</span>
      </div>

      <div style={{ padding: '1.5rem 1rem', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', paddingLeft: '0.75rem' }}>
          {role.replace('_', ' ')}
        </div>
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path || location.pathname.startsWith(link.path + '/');
          return (
            <Link 
              key={link.path} 
              to={link.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem',
                borderRadius: '8px',
                textDecoration: 'none',
                color: isActive ? 'var(--primary)' : 'var(--text-main)',
                backgroundColor: isActive ? '#EEF2FF' : 'transparent',
                fontWeight: isActive ? 600 : 400,
                transition: 'all 0.2s ease'
              }}
            >
              {link.icon}
              {link.name}
            </Link>
          );
        })}
      </div>

      <div style={{ padding: '1.5rem 1rem', borderTop: '1px solid var(--border)' }}>
        <button 
          onClick={signOut}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem',
            width: '100%',
            borderRadius: '8px',
            border: 'none',
            background: 'transparent',
            color: 'var(--danger)',
            cursor: 'pointer',
            textAlign: 'left'
          }}
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </div>
  );
}

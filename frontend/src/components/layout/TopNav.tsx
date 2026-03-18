import React from 'react';
import { useAuth, type UserRole } from '../../contexts/AuthContext';
import { AlertTriangle, User } from 'lucide-react';

export default function TopNav() {
  const { userData, realUserRole, setImpersonatedRole } = useAuth();
  
  if (!userData) return null;

  return (
    <div style={{
      height: '70px',
      background: 'white',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 30
    }}>
      <div>
        {realUserRole === 'system_admin' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#FFFBEB', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #FEF3C7' }}>
            <AlertTriangle size={16} color="#D97706" />
            <span style={{ fontSize: '0.875rem', color: '#D97706', fontWeight: 600 }}>Admin View As:</span>
            <select 
              value={userData.role}
              onChange={(e) => setImpersonatedRole(e.target.value === 'system_admin' ? null : e.target.value as UserRole)}
              style={{
                padding: '0.25rem 0.5rem',
                borderRadius: '6px',
                border: '1px solid #D97706',
                background: 'white',
                color: '#D97706',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="system_admin">System Admin (Default)</option>
              <option value="organization_admin">Organization Admin</option>
              <option value="leader">Group Leader</option>
              <option value="hr_analyst">HR Analyst</option>
              <option value="member">Standard Member</option>
            </select>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)' }}>{userData.full_name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{userData.role.replace('_', ' ').toUpperCase()}</div>
        </div>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '1.25rem' }}>
          {userData.full_name.substring(0, 1).toUpperCase()}
        </div>
      </div>
    </div>
  );
}

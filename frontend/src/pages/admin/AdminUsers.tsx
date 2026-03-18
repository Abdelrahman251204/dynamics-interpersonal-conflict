import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { User, Settings, Shield } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      await supabase.from('users').update({ role: newRole }).eq('id', userId);
      loadUsers();
    } catch (err) {
      alert("Error updating user role");
    }
  };

  const updateUserStatus = async (userId: string, newStatus: string) => {
    try {
      await supabase.from('users').update({ status: newStatus }).eq('id', userId);
      loadUsers();
    } catch (err) {
      alert("Error updating user status");
    }
  };

  if (loading) return <div>Loading users...</div>;

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>User Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage all platform users, roles, and access statuses.</p>
        </div>
        <div style={{ padding: '0.5rem 1rem', background: '#EEF2FF', color: 'var(--primary)', borderRadius: '8px', fontWeight: 600 }}>
          {users.length} Total Users
        </div>
      </div>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)' }}>
              <th style={{ padding: '1rem' }}>User</th>
              <th style={{ padding: '1rem' }}>Role</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem' }}>Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontWeight: 600 }}>{u.full_name}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{u.email}</div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <select 
                    value={u.role}
                    onChange={(e) => updateUserRole(u.id, e.target.value)}
                    style={{ padding: '0.35rem 0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface)' }}
                  >
                    <option value="system_admin">System Admin</option>
                    <option value="organization_admin">Org Admin</option>
                    <option value="leader">Group Leader</option>
                    <option value="hr_analyst">HR Analyst</option>
                    <option value="member">Member</option>
                  </select>
                </td>
                <td style={{ padding: '1rem' }}>
                  <select 
                    value={u.status}
                    onChange={(e) => updateUserStatus(u.id, e.target.value)}
                    style={{ 
                      padding: '0.35rem 0.5rem', 
                      borderRadius: '6px', 
                      border: u.status === 'approved' ? '1px solid var(--success)' : '1px solid var(--border)', 
                      background: u.status === 'approved' ? '#ECFDF5' : 'var(--surface)',
                      color: u.status === 'approved' ? 'var(--success)' : 'var(--text-main)',
                      fontWeight: 500
                    }}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="suspended">Suspended</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </td>
                <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

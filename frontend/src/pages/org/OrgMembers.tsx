import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { User, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function OrgMembers() {
  const { userData } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMembers();
  }, [userData]);

  const loadMembers = async () => {
    try {
      if (!userData?.id) return;
      
      const { data: membership } = await supabase
        .from('organization_memberships')
        .select('org_id')
        .eq('user_id', userData.id)
        .limit(1)
        .single();
        
      if (!membership?.org_id) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('organization_memberships')
        .select('users(id, full_name, email, role, status, created_at)')
        .eq('org_id', membership.org_id);
        
      if (data) setMembers(data.map((m: any) => m.users));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading organization directory...</div>;

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Organization Directory</h1>
          <p style={{ color: 'var(--text-muted)' }}>All users assigned to your organization.</p>
        </div>
        <div style={{ padding: '0.5rem 1rem', background: '#F3E8FF', color: '#9333EA', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Shield size={18} />
          {members.length} Enrolled
        </div>
      </div>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)' }}>
              <th style={{ padding: '1rem' }}>User Profile</th>
              <th style={{ padding: '1rem' }}>System Role</th>
              <th style={{ padding: '1rem' }}>Access Status</th>
              <th style={{ padding: '1rem' }}>Join Date</th>
            </tr>
          </thead>
          <tbody>
            {members.map(m => (
              m && <tr key={m.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600 }}>
                      {m.full_name?.substring(0, 2).toUpperCase() || <User size={16} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{m.full_name}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{m.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-main)', textTransform: 'capitalize' }}>
                    {m.role?.replace('_', ' ')}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                   <span className={`badge \${m.status === 'approved' ? 'badge-low' : 'badge-medium'}`}>
                    {m.status?.toUpperCase()}
                   </span>
                </td>
                <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  {new Date(m.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {members.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No members are currently mapped to this organization.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

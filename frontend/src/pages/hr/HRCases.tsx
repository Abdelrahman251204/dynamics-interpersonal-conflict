import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { FileText, Search, Filter } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function HRCases() {
  const { userData } = useAuth();
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCases();
  }, [userData]);

  const loadCases = async () => {
    try {
      const { data } = await supabase
        .from('case_management')
        .select(`
          *,
          users!case_management_assigned_to_fkey(full_name)
        `)
        .order('created_at', { ascending: false });
        
      if (data) setCases(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading Cases...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Case Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage, track, and resolve escalated HR interventions securely.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={18} /> Filter
          </button>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input type="text" className="input" placeholder="Search cases..." style={{ paddingLeft: '2.5rem' }} />
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                <th style={{ padding: '1rem' }}>Case Identifier</th>
                <th style={{ padding: '1rem' }}>Priority</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem' }}>Analyst Lead</th>
                <th style={{ padding: '1rem' }}>Opened</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cases.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ background: '#F3E8FF', padding: '0.5rem', borderRadius: '8px' }}>
                        <FileText size={16} color="#9333EA" />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{c.title || 'Untitled Assessment'}</div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>ID: {c.id.substring(0, 8)}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', textTransform: 'capitalize' }}>
                     <span className={`badge \${c.priority === 'high' || c.priority === 'critical' ? 'badge-high' : c.priority === 'medium' ? 'badge-medium' : 'badge-low'}`}>
                       {c.priority}
                     </span>
                  </td>
                  <td style={{ padding: '1rem', textTransform: 'capitalize' }}>
                    <span className={`badge \${c.status === 'resolved' ? 'badge-low' : c.status === 'in_progress' ? 'badge-medium' : 'badge-high'}`}>
                      {c.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-main)' }}>
                    {c.users?.full_name || 'Unassigned'}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    {new Date(c.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
                      Open Workspace
                    </button>
                  </td>
                </tr>
              ))}
              {cases.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No active cases in your queue.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

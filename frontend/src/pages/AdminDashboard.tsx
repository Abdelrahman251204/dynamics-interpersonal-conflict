import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Users, AlertTriangle, ShieldCheck, UserCheck, UserX, UserMinus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function AdminDashboard() {
  const { userData } = useAuth();
  const [stats, setStats] = useState({ users: 0, surveys: 0, flags: 0, pending: 0 });
  const [recentFlags, setRecentFlags] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [view, setView] = useState<'overview' | 'access'>('overview');

  useEffect(() => {
    loadAdminData();
    if (userData?.role === 'system_admin') {
      loadAccessRequests();
    }
  }, [userData]);

  const loadAdminData = async () => {
    try {
      const { count: uCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
      const { count: sCount } = await supabase.from('survey_instances').select('*', { count: 'exact', head: true });
      const { count: fCount } = await supabase.from('risk_flags').select('*', { count: 'exact', head: true }).eq('is_resolved', false);
      const { count: pCount } = await supabase.from('access_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending');
      
      setStats({
        users: uCount || 0,
        surveys: sCount || 0,
        flags: fCount || 0,
        pending: pCount || 0
      });

      const { data: flags } = await supabase
        .from('risk_flags')
        .select('id, risk_level, created_at, triggered_rules')
        .eq('is_resolved', false)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (flags) setRecentFlags(flags);
    } catch (err) {
      console.error(err);
    }
  };

  const loadAccessRequests = async () => {
    try {
      const { data } = await supabase
        .from('access_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setRequests(data);
    } catch (err) {
      console.error(err);
    }
  };

  const updateRequestStatus = async (requestId: string, authUserId: string, newStatus: string, roleToSet?: string) => {
    try {
      // 1. Update access_request
      await supabase
        .from('access_requests')
        .update({ status: newStatus, reviewed_at: new Date().toISOString(), reviewed_by: userData?.id })
        .eq('id', requestId);
      
      // 2. Update user profile status & role
      const updatePayload: any = { status: newStatus };
      if (roleToSet) updatePayload.role = roleToSet;
      
      await supabase
        .from('users')
        .update(updatePayload)
        .eq('id', authUserId);

      // Refresh
      loadAccessRequests();
      loadAdminData();
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Error updating status");
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 600 }}>System Administration</h1>
        {userData?.role === 'system_admin' && (
          <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--surface)', padding: '0.25rem', borderRadius: '8px' }}>
            <button 
              className={`btn ${view === 'overview' ? 'btn-primary' : ''}`} 
              onClick={() => setView('overview')}
              style={view !== 'overview' ? { background: 'transparent', color: 'var(--text-main)', border: 'none' } : {}}
            >
              Overview
            </button>
            <button 
              className={`btn ${view === 'access' ? 'btn-primary' : ''}`} 
              onClick={() => setView('access')}
              style={view !== 'access' ? { background: 'transparent', color: 'var(--text-main)', border: 'none' } : {}}
            >
              Access Requests {stats.pending > 0 && <span className="badge badge-high" style={{ marginLeft: '4px' }}>{stats.pending}</span>}
            </button>
          </div>
        )}
      </div>

      {view === 'overview' ? (
        <>
          <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ background: '#EEF2FF', padding: '1rem', borderRadius: '12px' }}>
                <Users size={32} color="var(--primary)" />
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Total Users</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.users}</div>
              </div>
            </div>
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ background: '#ECFDF5', padding: '1rem', borderRadius: '12px' }}>
                <ShieldCheck size={32} color="var(--success)" />
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Total Surveys</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.surveys}</div>
              </div>
            </div>
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ background: '#FEF2F2', padding: '1rem', borderRadius: '12px' }}>
                <AlertTriangle size={32} color="var(--danger)" />
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Active Risk Flags</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.flags}</div>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Active Risk Flags (Anonymized)</h2>
            {recentFlags.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No active risk flags detected.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {recentFlags.map(flag => (
                  <div key={flag.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span className={`badge badge-${flag.risk_level}`}>{flag.risk_level} Risk</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                          {new Date(flag.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        {flag.triggered_rules.map((rule: any, i: number) => (
                          <div key={i} style={{ fontSize: '0.875rem' }}>Triggered: <b>{rule.rule}</b> (Value: {rule.value?.toFixed(2) || 'N/A'})</div>
                        ))}
                      </div>
                    </div>
                    <button className="btn btn-secondary" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
                      Acknowledge
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="card">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Access Requests & User Management</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  <th style={{ padding: '1rem' }}>Email</th>
                  <th style={{ padding: '1rem' }}>Requested Role</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  <th style={{ padding: '1rem' }}>Date</th>
                  <th style={{ padding: '1rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(req => (
                  <tr key={req.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem' }}>{req.email}</td>
                    <td style={{ padding: '1rem' }}>
                      <select 
                        defaultValue={req.requested_role}
                        onChange={(e) => { req.requested_role = e.target.value; }}
                        style={{ padding: '0.25rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--surface)' }}
                      >
                        <option value="member">Member</option>
                        <option value="leader">Leader</option>
                        <option value="hr_analyst">HR Analyst</option>
                        <option value="organization_admin">Org Admin</option>
                        <option value="system_admin">System Admin</option>
                      </select>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`badge ${req.status === 'pending' ? 'badge-medium' : req.status === 'approved' ? 'badge-low' : 'badge-high'}`}>
                        {req.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      {new Date(req.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {req.status !== 'approved' && (
                          <button 
                            title="Approve"
                            onClick={() => updateRequestStatus(req.id, req.auth_user_id, 'approved', req.requested_role)}
                            style={{ padding: '0.5rem', background: '#ECFDF5', color: 'var(--success)', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                          >
                            <UserCheck size={18} />
                          </button>
                        )}
                        {req.status !== 'rejected' && (
                          <button 
                            title="Reject"
                            onClick={() => updateRequestStatus(req.id, req.auth_user_id, 'rejected')}
                            style={{ padding: '0.5rem', background: '#FEF2F2', color: 'var(--danger)', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                          >
                            <UserX size={18} />
                          </button>
                        )}
                        {req.status === 'approved' && (
                          <button 
                            title="Suspend"
                            onClick={() => updateRequestStatus(req.id, req.auth_user_id, 'suspended')}
                            style={{ padding: '0.5rem', background: '#FFFBEB', color: '#D97706', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                          >
                            <UserMinus size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {requests.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No access requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

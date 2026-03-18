import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, AlertTriangle, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { userData } = useAuth();
  const [stats, setStats] = useState({ users: 0, surveys: 0, flags: 0, pending: 0, orgs: 0, groups: 0 });
  const [recentFlags, setRecentFlags] = useState<any[]>([]);

  useEffect(() => {
    loadAdminData();
  }, [userData]);

  const loadAdminData = async () => {
    try {
      const { count: uCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
      const { count: sCount } = await supabase.from('survey_instances').select('*', { count: 'exact', head: true });
      const { count: fCount } = await supabase.from('risk_flags').select('*', { count: 'exact', head: true }).eq('is_resolved', false);
      const { count: pCount } = await supabase.from('access_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending');
      const { count: oCount } = await supabase.from('organizations').select('*', { count: 'exact', head: true });
      const { count: gCount } = await supabase.from('groups').select('*', { count: 'exact', head: true });
      
      setStats({
        users: uCount || 0,
        surveys: sCount || 0,
        flags: fCount || 0,
        pending: pCount || 0,
        orgs: oCount || 0,
        groups: gCount || 0
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

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 600 }}>System Administration Overview</h1>
        {stats.pending > 0 && (
          <Link to="/admin/access-requests" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserCheck size={18} />
            Review {stats.pending} Access Requests
          </Link>
        )}
      </div>

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
          <div style={{ background: '#F3E8FF', padding: '1rem', borderRadius: '12px' }}>
            <ShieldCheck size={32} color="#9333EA" />
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Organizations</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.orgs}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ background: '#ECFDF5', padding: '1rem', borderRadius: '12px' }}>
            <ShieldCheck size={32} color="var(--success)" />
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Total Surveys Completed</div>
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
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Critical Platform Events</h2>
        {recentFlags.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No critical alerts active.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recentFlags.map(flag => (
              <div key={flag.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span className={`badge badge-${flag.risk_level === 'critical' || flag.risk_level === 'high' ? 'high' : flag.risk_level === 'medium' ? 'medium' : 'low'}`}>
                      {flag.risk_level.toUpperCase()}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      {new Date(flag.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    {flag.triggered_rules.map((rule: any, i: number) => (
                      <div key={i} style={{ fontSize: '0.875rem' }}>Rule Triggered: <b>{rule.rule}</b> (Value: {rule.value?.toFixed(2) || 'N/A'})</div>
                    ))}
                  </div>
                </div>
                <Link to="/admin/risk-flags" className="btn btn-secondary" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
                  View Details
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

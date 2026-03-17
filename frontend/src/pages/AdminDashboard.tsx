import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Users, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, surveys: 0, flags: 0 });
  const [recentFlags, setRecentFlags] = useState<any[]>([]);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const { count: uCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
      const { count: sCount } = await supabase.from('survey_instances').select('*', { count: 'exact', head: true });
      const { count: fCount } = await supabase.from('risk_flags').select('*', { count: 'exact', head: true }).eq('is_resolved', false);
      
      setStats({
        users: uCount || 0,
        surveys: sCount || 0,
        flags: fCount || 0
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
      <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '2rem' }}>System Administration</h1>

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
    </div>
  );
}

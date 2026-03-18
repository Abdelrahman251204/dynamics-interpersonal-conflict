import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ShieldAlert, Activity, Users, FileText } from 'lucide-react';

export default function HRDashboard() {
  const [stats, setStats] = useState({ activeCases: 0, criticalFlags: 0, completedInterventions: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHRData();
  }, []);

  const loadHRData = async () => {
    try {
      const { count: cases } = await supabase.from('case_management').select('*', { count: 'exact', head: true }).neq('status', 'resolved').neq('status', 'dismissed');
      const { count: flags } = await supabase.from('risk_flags').select('*', { count: 'exact', head: true }).eq('risk_level', 'critical').eq('is_resolved', false);
      const { count: interventions } = await supabase.from('case_management').select('*', { count: 'exact', head: true }).eq('status', 'resolved');

      setStats({
        activeCases: cases || 0,
        criticalFlags: flags || 0,
        completedInterventions: interventions || 0
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading Analytics...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 600 }}>HR Analyst Workspace</h1>
      </div>

      <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ background: '#FEF2F2', padding: '1rem', borderRadius: '12px' }}>
            <Activity size={32} color="var(--danger)" />
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Critical System Flags</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.criticalFlags}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ background: '#FFFBEB', padding: '1rem', borderRadius: '12px' }}>
            <ShieldAlert size={32} color="#D97706" />
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Open HR Cases</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.activeCases}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ background: '#ECFDF5', padding: '1rem', borderRadius: '12px' }}>
            <FileText size={32} color="var(--success)" />
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Resolved Interventions</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.completedInterventions}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={20} /> Latest Priority Issues
        </h2>
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
          Please navigate to the <a href="/dynamics-interpersonal-conflict/hr/flags" style={{ color: 'var(--primary)' }}>Flags</a> section to triage incoming priority incidents dynamically.
        </div>
      </div>
    </div>
  );
}

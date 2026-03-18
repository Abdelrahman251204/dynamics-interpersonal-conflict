import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { BarChart2, TrendingUp, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function OrgAnalytics() {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orgId, setOrgId] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, [userData]);

  const loadAnalytics = async () => {
    try {
      if (!userData?.id) return;
      const { data: membership } = await supabase
        .from('organization_memberships')
        .select('org_id')
        .eq('user_id', userData.id)
        .limit(1)
        .single();
        
      if (membership?.org_id) setOrgId(membership.org_id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading organization analytics...</div>;
  if (!orgId) return <div style={{ padding: '2rem' }}>You are not assigned to an organization.</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Organization Analytics</h1>
          <p style={{ color: 'var(--text-muted)' }}>Aggregate risk, compliance, and wellbeing metrics across all groups.</p>
        </div>
      </div>

      <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>
            <TrendingUp size={18} /> Survey Completion Rate
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>78%</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--success)', marginTop: '0.5rem' }}>+5% from last month</div>
        </div>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>
            <BarChart2 size={18} /> Average Burnout Risk
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#D97706' }}>Medium</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Based on MBI metrics</div>
        </div>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>
            <AlertTriangle size={18} /> Active Critical Flags
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--danger)' }}>3</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Require HR Intervention</div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Group Comparison Models</h2>
        <div style={{ height: '300px', background: 'var(--surface)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border)' }}>
          [Recharts Visualizations Loading...]
        </div>
      </div>
    </div>
  );
}

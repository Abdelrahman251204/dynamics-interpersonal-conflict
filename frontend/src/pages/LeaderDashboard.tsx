import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ShieldAlert, Users, Activity } from 'lucide-react';

interface Metric {
  team_id: string;
  avg_normalized_score: number;
  risk_distribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  created_at: string;
}

export default function LeaderDashboard() {
  const [metrics, setMetrics] = useState<Metric | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeamData();
  }, []);

  const loadTeamData = async () => {
    try {
      // In a real app, you'd fetch the team ID the leader belongs to first.
      // Assuming a leader has a team_id in team_members:
      const { data: { user } } = await supabase.auth.getUser();
      const { data: memberData } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user?.id)
        .eq('role', 'team_leader')
        .maybeSingle();

      if (memberData?.team_id) {
        const { data: recentMetric } = await supabase
          .from('team_metrics')
          .select('*')
          .eq('team_id', memberData.team_id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (recentMetric) setMetrics(recentMetric as Metric);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading analytics...</div>;

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '2rem' }}>Team Analytics</h1>

      {metrics ? (
        <div className="dashboard-grid">
          <div className="card">
            <h2 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Overall Team Health</h2>
            <div style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--primary)' }}>
              {metrics.avg_normalized_score}/100
            </div>
            <p style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
              Based on the latest aggregated anonymous team surveys.
            </p>
          </div>

          <div className="card">
            <h2 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Risk Distribution</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Low Risk</span>
              <span className="badge badge-low">{metrics.risk_distribution.low || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Medium Risk</span>
              <span className="badge badge-medium">{metrics.risk_distribution.medium || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>High Risk</span>
              <span className="badge badge-high">{metrics.risk_distribution.high || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Critical</span>
              <span className="badge badge-critical">{metrics.risk_distribution.critical || 0}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <Activity size={48} color="var(--border)" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 500 }}>No Analytics Yet</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Team analytics will appear here once your members complete their psychometric surveys.
          </p>
        </div>
      )}
    </div>
  );
}

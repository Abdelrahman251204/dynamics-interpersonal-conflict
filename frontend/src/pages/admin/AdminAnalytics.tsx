import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Activity, Users, Building, ShieldAlert } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({ users: 0, orgs: 0, surveys: 0, alerts: 0 });
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    loadPlatformData();
  }, []);

  const loadPlatformData = async () => {
    try {
      // Fetch high level metrics
      const [{ count: userCount }, { count: orgCount }, { count: alertCount }, { data: instances }] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('organizations').select('*', { count: 'exact', head: true }),
        supabase.from('risk_flags').select('*', { count: 'exact', head: true }).eq('is_resolved', false),
        supabase.from('survey_instances').select('created_at').order('created_at', { ascending: true })
      ]);

      setMetrics({
        users: userCount || 0,
        orgs: orgCount || 0,
        surveys: instances?.length || 0,
        alerts: alertCount || 0
      });

      // Process timeline of survey completions
      if (instances && instances.length > 0) {
        const timeline: Record<string, number> = {};
        instances.forEach(i => {
          const d = new Date(i.created_at).toLocaleDateString();
          timeline[d] = (timeline[d] || 0) + 1;
        });
        
        const cData = Object.keys(timeline).map(date => ({
          date,
          Completions: timeline[date]
        }));
        setChartData(cData);
      }
    } catch (err) {
      console.error("Failed to load analytics", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading Platform Analytics...</div>;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>Platform Analytics</h1>
        <p style={{ color: 'var(--text-muted)' }}>Global adoption and system health metrics across all organizations.</p>
      </div>

      <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ background: '#EEF2FF', padding: '1rem', borderRadius: '12px' }}>
            <Building size={32} color="var(--primary)" />
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Total Organizations</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{metrics.orgs}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ background: '#ECFDF5', padding: '1rem', borderRadius: '12px' }}>
            <Users size={32} color="var(--success)" />
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Total Users</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{metrics.users}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ background: '#F3E8FF', padding: '1rem', borderRadius: '12px' }}>
            <Activity size={32} color="#9333EA" />
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Assessments Completed</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{metrics.surveys}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ background: '#FEF2F2', padding: '1rem', borderRadius: '12px' }}>
            <ShieldAlert size={32} color="var(--danger)" />
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Active Risk Flags</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{metrics.alerts}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Assessment Adoption Timeline</h2>
        <div style={{ height: '350px' }}>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCompletions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9333EA" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#9333EA" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="Completions" stroke="#9333EA" strokeWidth={3} fillOpacity={1} fill="url(#colorCompletions)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
             <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
               No assessment data collected yet.
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

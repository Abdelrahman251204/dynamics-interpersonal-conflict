import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ShieldAlert, Users, Activity, BarChart2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function LeaderDashboard() {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [managedGroups, setManagedGroups] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({ safetyScore: 0, alerts: 0, participation: 'High' });
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    loadLeaderData();
  }, [userData]);

  const loadLeaderData = async () => {
    try {
      if (!userData?.id) return;
      
      const { data: memberships } = await supabase
        .from('group_memberships')
        .select('group_id, groups(id, name, org_id)')
        .eq('user_id', userData.id);

      if (memberships && memberships.length > 0) {
        const groups = memberships.map((m: any) => m.groups);
        setManagedGroups(groups);
        
        // Fetch group members
        const groupIds = groups.map((g: any) => g.id);
        const { data: teamMemberships } = await supabase
          .from('group_memberships')
          .select('user_id')
          .in('group_id', groupIds);
          
        const teamUserIds = teamMemberships?.map(m => m.user_id) || [];
        
        if (teamUserIds.length > 0) {
          // Fetch scores
          const { data: scores } = await supabase
            .from('scores')
            .select('created_at, total_normalized')
            .in('user_id', teamUserIds)
            .order('created_at', { ascending: true });
            
          // Process for chart and metrics
          if (scores && scores.length > 0) {
            let totalScore = 0;
            const timelineData: Record<string, { date: string, avgScore: number, count: number }> = {};
            
            scores.forEach(s => {
              totalScore += s.total_normalized;
              const d = new Date(s.created_at).toLocaleDateString();
              
              if (!timelineData[d]) timelineData[d] = { date: d, avgScore: 0, count: 0 };
              timelineData[d].avgScore += s.total_normalized;
              timelineData[d].count += 1;
            });
            
            const finalChartData = Object.values(timelineData).map(d => ({
              date: d.date,
              Score: Math.round(d.avgScore / d.count)
            }));
            
            setChartData(finalChartData);
            setMetrics({
              safetyScore: Math.round(totalScore / scores.length),
              alerts: scores.filter(s => s.total_normalized < 40).length, // naive risk checking
              participation: scores.length > teamUserIds.length ? 'High' : 'Moderate'
            });
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading Leader Dashboard...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>Team Health Overview</h1>
          <p style={{ color: 'var(--text-muted)' }}>Monitor psychological safety, stress, and burnout metrics for your assigned groups.</p>
        </div>
      </div>

      {managedGroups.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <Users size={48} color="var(--border)" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 500 }}>No Groups Assigned</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            You haven't been assigned as a leader to any groups yet. Contact your Org Admin.
          </p>
        </div>
      ) : (
        <>
          <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ background: '#ECFDF5', padding: '1rem', borderRadius: '12px' }}>
                <Activity size={32} color="var(--success)" />
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Overall Aggregated Score</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{metrics.safetyScore} / 100</div>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ background: '#FEF2F2', padding: '1rem', borderRadius: '12px' }}>
                <ShieldAlert size={32} color="var(--danger)" />
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Active Team Alerts</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{metrics.alerts}</div>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ background: '#EEF2FF', padding: '1rem', borderRadius: '12px' }}>
                <Users size={32} color="var(--primary)" />
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Participation Confidence</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{metrics.participation}</div>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart2 size={20} /> Team Trend Analysis (Anonymized)
            </h2>
            <div style={{ height: '350px' }}>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area type="monotone" dataKey="Score" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                  Not enough survey data collected yet to display trends.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

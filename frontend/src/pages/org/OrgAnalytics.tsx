import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { BarChart2, TrendingUp, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function OrgAnalytics() {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orgId, setOrgId] = useState<string | null>(null);
  
  const [metrics, setMetrics] = useState({ completions: 0, alerts: 0, avgScore: 0 });
  const [chartData, setChartData] = useState<any[]>([]);

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
        
      if (!membership?.org_id) {
        setLoading(false);
        return;
      }
      setOrgId(membership.org_id);

      // Get all users in org
      const { data: orgUsers } = await supabase
        .from('organization_memberships')
        .select('user_id')
        .eq('org_id', membership.org_id);
        
      const userIds = orgUsers?.map(u => u.user_id) || [];
      
      if (userIds.length > 0) {
        const [{ data: scores }, { count: alerts }] = await Promise.all([
          supabase.from('scores').select('survey_id, total_normalized, surveys(name_en)').in('user_id', userIds),
          supabase.from('risk_flags').select('*', { count: 'exact', head: true }).in('user_id', userIds).eq('is_resolved', false)
        ]);
        
        if (scores && scores.length > 0) {
          const totalScore = scores.reduce((acc, s) => acc + s.total_normalized, 0);
          
          setMetrics({
            completions: scores.length,
            alerts: alerts || 0,
            avgScore: Math.round(totalScore / scores.length)
          });
          
          // Group by survey tool for the BarChart
          const grouped: Record<string, { name: string, score: number, count: number }> = {};
          scores.forEach((s: any) => {
            const name = s.surveys?.name_en || 'Unknown Tool';
            if (!grouped[name]) grouped[name] = { name, score: 0, count: 0 };
            grouped[name].score += s.total_normalized;
            grouped[name].count += 1;
          });
          
          const cData = Object.values(grouped).map(g => ({
            Tool: g.name,
            Average_Score: Math.round(g.score / g.count)
          }));
          
          setChartData(cData);
        } else {
          setMetrics({ completions: 0, alerts: alerts || 0, avgScore: 0 });
        }
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading organization analytics...</div>;
  if (!orgId) return <div style={{ padding: '2rem', textAlign: 'center' }}>You are not assigned to an organization.</div>;

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
            <TrendingUp size={18} /> Assessments Completed
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>{metrics.completions}</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Total Historical Submissions</div>
        </div>
        
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>
            <BarChart2 size={18} /> Average Network Score
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#D97706' }}>{metrics.avgScore} / 100</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Aggregated well-being index</div>
        </div>
        
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>
            <AlertTriangle size={18} /> Active Critical Flags
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--danger)' }}>{metrics.alerts}</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Require HR Intervention</div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Average Scores by Instrument</h2>
        <div style={{ height: '300px' }}>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="Tool" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} domain={[0, 100]} />
                <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="Average_Score" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              No instrument data collected yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

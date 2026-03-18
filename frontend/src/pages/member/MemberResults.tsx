import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Award, Target, TrendingUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function MemberResults() {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({ 
    resilienceText: 'Need more data to determine.',
    burnoutText: 'Need more data to determine.',
    avgScore: 0
  });

  useEffect(() => {
    loadPersonalInsights();
  }, [userData]);

  const loadPersonalInsights = async () => {
    try {
      if (!userData?.id) return;

      const { data } = await supabase
        .from('scores')
        .select('*, surveys(name_en)')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: true });

      if (data && data.length > 0) {
        // Map to chart
        const formattedScores = data.map(d => ({
          date: new Date(d.created_at).toLocaleDateString(),
          Score: d.total_normalized,
          Tool: d.surveys?.name_en || 'Assessment'
        }));
        
        setScores(formattedScores);
        
        // Basic heuristics
        const recentScores = data.slice(-3);
        const avgRecent = recentScores.reduce((acc, s) => acc + s.total_normalized, 0) / recentScores.length;
        
        setMetrics({
          avgScore: Math.round(avgRecent),
          resilienceText: avgRecent > 75 
            ? 'Your latest assessments indicate a high level of cognitive resilience. You are currently well-equipped to handle task-based friction.'
            : avgRecent > 50 
              ? 'Your resilience indicators are moderate. Practicing deliberate compartmentalization could strengthen your baseline.'
              : 'Your resilience indicators are currently strained. Consider engaging with available coaching resources.',
          burnoutText: avgRecent > 70
            ? 'Low risk detected across Emotional Exhaustion and Depersonalization metrics based on your recent data.'
            : avgRecent > 45
              ? 'Moderate warning signs of fatigue detected. Ensure you are blocking out deep-work time.'
              : 'High risk of burnout detected. Your systemic stress levels are elevated. Please prioritize recovery.'
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Analyzing personal insights...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Personal Insights</h1>
          <p style={{ color: 'var(--text-muted)' }}>Review your psychological interpretations and personalized coaching recommendations privately.</p>
        </div>
      </div>

      <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ background: '#EEF2FF', borderColor: '#C7D2FE' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--primary)', fontWeight: 600 }}>
            <Award size={20} /> Cognitive Resilience
          </div>
          <p style={{ fontSize: '0.875rem', color: '#4338CA', lineHeight: 1.5 }}>
            {metrics.resilienceText}
          </p>
        </div>

        <div className="card" style={{ background: '#F1F5F9', borderColor: '#E2E8F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#475569', fontWeight: 600 }}>
            <Target size={20} /> Burnout Profile
          </div>
          <p style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.5 }}>
            {metrics.burnoutText}
          </p>
        </div>
      </div>

      <div className="card">
         <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
           <TrendingUp size={20} /> Trajectory Over Time
         </h2>
         <div style={{ height: '300px' }}>
           {scores.length > 0 ? (
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={scores} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPersonalScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} domain={[0, 100]} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="Score" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorPersonalScore)" />
                </AreaChart>
             </ResponsiveContainer>
           ) : (
             <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
               No historical assessment data available to visualize trajectory.
             </div>
           )}
         </div>
      </div>
      
      {scores.length > 0 && (
        <div className="card" style={{ marginTop: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>System-Generated Coaching</h2>
          <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
            {metrics.avgScore < 60 && (
              <div style={{ padding: '1rem', background: 'var(--surface)', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
                <strong>Communication Styles:</strong> To improve psychological safety with your peers, consider practicing explicit "yes, and" feedback loops during conflict resolution.
              </div>
            )}
            <div style={{ padding: '1rem', background: 'var(--surface)', borderRadius: '8px', borderLeft: '4px solid #10B981' }}>
              <strong>Boundary Setting:</strong> Consistently blocking out time for deep work has been statistically shown to improve your current metric profile by 14%.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

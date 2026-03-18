import React from 'react';
import { Award, Target, TrendingUp } from 'lucide-react';

export default function MemberResults() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Personal Insights</h1>
          <p style={{ color: 'var(--text-muted)' }}>Review your psychological interpretations and personalized coaching recommendations.</p>
        </div>
      </div>

      <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ background: '#EEF2FF', borderColor: '#C7D2FE' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--primary)', fontWeight: 600 }}>
            <Award size={20} /> Resilience Score
          </div>
          <p style={{ fontSize: '0.875rem', color: '#4338CA', lineHeight: 1.5 }}>
            Your latest assessment indicates a high level of cognitive resilience. You are currently well-equipped to handle task-based friction.
          </p>
        </div>

        <div className="card" style={{ background: '#F1F5F9', borderColor: '#E2E8F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#475569', fontWeight: 600 }}>
            <Target size={20} /> Burnout Profile
          </div>
          <p style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.5 }}>
            Low risk detected across Emotional Exhaustion and Depersonalization metrics based on your previous month's data.
          </p>
        </div>
      </div>

      <div className="card">
         <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
           <TrendingUp size={20} /> Trajectory Over Time
         </h2>
         <div style={{ height: '300px', background: 'var(--surface)', borderRadius: '8px', border: '1px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
           [Personal Wellbeing Chart Loading...]
         </div>
      </div>
      
      <div className="card" style={{ marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>System-Generated Coaching</h2>
        <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
          <div style={{ padding: '1rem', background: 'var(--surface)', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
            <strong>Communication Styles:</strong> To improve psychological safety with your peers, consider practicing explicit "yes, and" feedback loops during conflict resolution.
          </div>
          <div style={{ padding: '1rem', background: 'var(--surface)', borderRadius: '8px', borderLeft: '4px solid #10B981' }}>
            <strong>Stress Management:</strong> Your data showed a slight dip in energy levels. Ensure you are blocking out deep-work time to prevent context-switching fatigue.
          </div>
        </div>
      </div>
    </div>
  );
}

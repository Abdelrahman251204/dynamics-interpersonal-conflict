import React from 'react';
import { Activity, ShieldAlert, FileText, CheckCircle } from 'lucide-react';

export default function HRAnalytics() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Platform Risk Analytics</h1>
          <p style={{ color: 'var(--text-muted)' }}>Deep-dive metrics across all groups and organizations.</p>
        </div>
      </div>

      <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>
            <Activity size={18} /> Most Common Risk Factor
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--danger)' }}>Burnout (Exhaustion)</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Triggered in 42% of flags</div>
        </div>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>
            <ShieldAlert size={18} /> Avg. Intervention Time
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#D97706' }}>3.2 Days</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--success)', marginTop: '0.5rem' }}>-12% from last quarter</div>
        </div>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>
            <FileText size={18} /> Cases Escaping Resolution
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--danger)' }}>4</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Unresolved &gt; 30 Days</div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={20} /> Assessment Efficacy Radar
        </h2>
        <div style={{ height: '350px', background: 'var(--surface)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border)' }}>
          [Advanced Recharts Radar Component Loading...]
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { AlertTriangle, Bell, Clock } from 'lucide-react';

export default function LeaderAlerts() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a full implementation, this queries risk_flags related to groups led by the user
    // For now, we mock the UI load
    setTimeout(() => {
      setAlerts([
        { id: 1, type: 'Stress Spike', group: 'Engineering Backend', level: 'high', message: 'Team burnout indicators rose by 14% over the last 14 days.', time: '2 hours ago' },
        { id: 2, type: 'Conflict Detected', group: 'Marketing Q3', level: 'medium', message: 'Task-based conflict emerging between key members. Consider a realignment sync.', time: '1 day ago' }
      ]);
      setLoading(false);
    }, 800);
  }, []);

  if (loading) return <div>Loading proactive leader alerts...</div>;

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Team Deterioration Alerts</h1>
          <p style={{ color: 'var(--text-muted)' }}>Proactive warnings generated when negative trends are detected in team surveys.</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {alerts.map(alert => (
          <div key={alert.id} style={{ border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '8px', display: 'flex', gap: '1rem' }}>
             <div style={{ 
               background: alert.level === 'high' ? '#FEF2F2' : '#FFFBEB', 
               color: alert.level === 'high' ? 'var(--danger)' : '#D97706',
               padding: '1rem',
               borderRadius: '50%',
               height: 'max-content'
             }}>
               {alert.level === 'high' ? <AlertTriangle size={24} /> : <Bell size={24} />}
             </div>
             <div style={{ flex: 1 }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                 <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{alert.type}</h3>
                 <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                   <Clock size={14} /> {alert.time}
                 </span>
               </div>
               <div style={{ fontWeight: 500, color: 'var(--primary)', marginBottom: '0.5rem' }}>Group: {alert.group}</div>
               <p style={{ color: 'var(--text-main)' }}>{alert.message}</p>
               <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                 <button className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>View Insights</button>
                 <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>Dismiss</button>
               </div>
             </div>
          </div>
        ))}
        {alerts.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No active alerts for your teams. Everything is within healthy operational parameters.
          </div>
        )}
      </div>
    </div>
  );
}

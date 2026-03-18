import React from 'react';
import { Activity, Info } from 'lucide-react';

export default function ConflictMap() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>Dyadic Conflict Intelligence Map</h1>
          <p style={{ color: 'var(--text-muted)' }}>Visualize probable interpersonal friction clusters and team relationship metrics securely.</p>
        </div>
      </div>

      <div className="card" style={{ background: '#FFFBEB', borderColor: '#FEF3C7', marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
         <Info color="#D97706" style={{ flexShrink: 0 }} />
         <div>
           <h3 style={{ color: '#D97706', fontWeight: 600, marginBottom: '0.25rem' }}>Privacy Protected View</h3>
           <p style={{ color: '#92400E', fontSize: '0.875rem', lineHeight: 1.5 }}>
             The conflict map displays aggregated dyadic (pair-level) insights derived from metadata. Raw psychometric answers and direct accusations are intentionally obscured to protect psychological safety.
           </p>
         </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={20} /> Real-Time Network Graph
        </h2>
        <div style={{ 
          height: '500px', 
          background: '#0F172A', 
          borderRadius: '12px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          color: '#94A3B8',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {/* Simulated node connection for UI polish without Recharts complex network plugin */}
          <div style={{ position: 'relative', width: '300px', height: '300px' }}>
            <div style={{ position: 'absolute', top: '20%', left: '50%', width: '40px', height: '40px', background: 'var(--success)', borderRadius: '50%', transform: 'translate(-50%, -50%)', border: '3px solid #1E293B' }}></div>
            <div style={{ position: 'absolute', top: '80%', left: '20%', width: '40px', height: '40px', background: 'var(--danger)', borderRadius: '50%', transform: 'translate(-50%, -50%)', border: '3px solid #1E293B' }}></div>
            <div style={{ position: 'absolute', top: '80%', left: '80%', width: '40px', height: '40px', background: '#D97706', borderRadius: '50%', transform: 'translate(-50%, -50%)', border: '3px solid #1E293B' }}></div>
            
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
               <line x1="50%" y1="20%" x2="20%" y2="80%" stroke="var(--danger)" strokeWidth="2" strokeDasharray="5,5" />
               <line x1="50%" y1="20%" x2="80%" y2="80%" stroke="#1E293B" strokeWidth="2" />
               <line x1="20%" y1="80%" x2="80%" y2="80%" stroke="#D97706" strokeWidth="3" />
            </svg>
          </div>
          <div>[Interactive React Force Graph Generating...]</div>
        </div>

        <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
           <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px' }}>
             <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Critical Friction (<span style={{color: 'var(--danger)'}}>Red</span>)</div>
             <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>High probability of escalated relationship conflict. HR intervention recommended.</p>
           </div>
           <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px' }}>
             <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Emerging Task Conflict (<span style={{color: '#D97706'}}>Yellow</span>)</div>
             <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Moderate divergent opinions on work execution. Generally healthy if managed.</p>
           </div>
           <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px' }}>
             <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Aligned Pair (<span style={{color: 'var(--success)'}}>Green</span>)</div>
             <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Strong trust and psychological safety demonstrated between nodes.</p>
           </div>
        </div>
      </div>
    </div>
  );
}

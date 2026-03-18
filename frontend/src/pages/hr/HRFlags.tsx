import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { AlertTriangle, Clock, Target, Plus, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function HRFlags() {
  const { userData } = useAuth();
  const [flags, setFlags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFlags();
  }, []);

  const loadFlags = async () => {
    try {
      // In full implementation, filter by HR's assigned org.
      // Assuming system context for now:
      const { data } = await supabase
        .from('risk_flags')
        .select('*, users(full_name, email)')
        .eq('is_resolved', false)
        .order('created_at', { ascending: false });
        
      if (data) setFlags(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createCase = async (flagId: string, riskLevel: string) => {
    if (!window.confirm('Create a formal HR case for this flag?')) return;
    try {
      // Create Case
      const { data: newCase, error: caseErr } = await supabase
        .from('case_management')
        .insert([{
          title: `Investigation: \${riskLevel.toUpperCase()} Risk Event`,
          description: `Auto-generated case from Flag ID: \${flagId}`,
          priority: riskLevel === 'critical' || riskLevel === 'high' ? 'high' : 'medium',
          status: 'open',
          assigned_to: userData?.id
        }])
        .select()
        .single();
        
      if (caseErr) throw caseErr;

      // Update Flag
      if (newCase) {
        await supabase
          .from('risk_flags')
          .update({ is_resolved: true }) // Mark resolved because it's now a case
          .eq('id', flagId);
          
        loadFlags();
        alert('Case created successfully');
      }
    } catch (err) {
      alert("Error escalating directly to case");
    }
  };

  if (loading) return <div>Loading Risk Triage...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Risk Triage Center</h1>
          <p style={{ color: 'var(--text-muted)' }}>Review incoming automated risk flags from team surveys and escalate to cases.</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {flags.map(flag => (
          <div key={flag.id} className="card" style={{ display: 'flex', gap: '1.5rem', borderLeft: `4px solid \${flag.risk_level === 'critical' ? 'var(--danger)' : flag.risk_level === 'high' ? '#D97706' : 'var(--primary)'}` }}>
            <div style={{ flex: 1 }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                   <span className={`badge \${flag.risk_level === 'critical' || flag.risk_level === 'high' ? 'badge-high' : 'badge-medium'}`}>
                     {flag.risk_level.toUpperCase()}
                   </span>
                   <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                     <Shield size={16} /> Patient Context: {flag.users?.full_name || 'Anonymous User'}
                   </span>
                 </div>
                 <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                   <Clock size={14} /> {new Date(flag.created_at).toLocaleString()}
                 </span>
               </div>
               
               <div style={{ background: 'var(--surface)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                 <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Triggered Rules</h4>
                 <ul style={{ margin: 0, paddingLeft: '1.2rem', gap: '0.25rem', display: 'flex', flexDirection: 'column' }}>
                   {flag.triggered_rules?.map((rule: any, i: number) => (
                     <li key={i} style={{ fontSize: '0.875rem' }}>
                       <strong>{rule.rule}</strong> (Value: {rule.value?.toFixed(2) || 'N/A'})
                     </li>
                   ))}
                 </ul>
               </div>
               
               <div style={{ display: 'flex', gap: '0.5rem' }}>
                 <button onClick={() => createCase(flag.id, flag.risk_level)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   <Plus size={16} /> Escalate to Case
                 </button>
                 <button className="btn btn-secondary">
                   Dismiss Flag
                 </button>
               </div>
            </div>
          </div>
        ))}
        {flags.length === 0 && (
          <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
             <Target size={48} color="var(--border)" style={{ margin: '0 auto 1rem' }} />
             <h2 style={{ fontSize: '1.25rem', fontWeight: 500 }}>Inbox Zero</h2>
             <p style={{ marginTop: '0.5rem' }}>There are no unreviewed risk flags in the system.</p>
          </div>
        )}
      </div>
    </div>
  );
}

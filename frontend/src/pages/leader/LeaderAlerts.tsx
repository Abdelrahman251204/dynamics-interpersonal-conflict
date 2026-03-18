import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { AlertTriangle, Bell, Clock, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function LeaderAlerts() {
  const { userData } = useAuth();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, [userData]);

  const loadAlerts = async () => {
    try {
      if (!userData?.id) return;

      // 1. Get managed groups
      const { data: managed } = await supabase
        .from('group_memberships')
        .select('group_id, groups(name)')
        .eq('user_id', userData.id);

      if (!managed || managed.length === 0) {
        setLoading(false);
        return;
      }

      const groupMap: Record<string, string> = {};
      managed.forEach((m: any) => groupMap[m.group_id] = m.groups.name);
      const groupIds = Object.keys(groupMap);

      // 2. Get members of these groups
      const { data: members } = await supabase
        .from('group_memberships')
        .select('user_id, group_id, users(full_name)')
        .in('group_id', groupIds);
        
      if (!members || members.length === 0) {
        setLoading(false);
        return;
      }

      const userToGroupMap: Record<string, { groupName: string, userName: string }> = {};
      members.forEach((m: any) => {
        userToGroupMap[m.user_id] = {
          groupName: groupMap[m.group_id] || 'Unknown Group',
          userName: m.users?.full_name || 'Team Member'
        };
      });
      const teamUserIds = Object.keys(userToGroupMap);

      // 3. Get unresolved risk flags
      const { data: flags } = await supabase
        .from('risk_flags')
        .select('*')
        .in('user_id', teamUserIds)
        .eq('is_resolved', false)
        .order('created_at', { ascending: false });

      if (flags) {
        const enhancedFlags = flags.map(f => ({
          ...f,
          context: userToGroupMap[f.user_id]
        }));
        setAlerts(enhancedFlags);
      }
    } catch (err) {
      console.error("Failed to load alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async (flagId: string) => {
    try {
      // Typically, only HR resolves it fully, but a leader bisa might 'acknowledge' it.
      // For this workflow, we'll mark it resolved in DB.
      await supabase.from('risk_flags').update({ is_resolved: true }).eq('id', flagId);
      setAlerts(prev => prev.filter(f => f.id !== flagId));
    } catch (err) {
      console.error("Failed to dismiss alert:", err);
    }
  };

  const formatRelTime = (dateString: string) => {
    const d = new Date(dateString);
    const now = new Date();
    const diffHours = Math.abs(now.getTime() - d.getTime()) / 36e5;
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `\${Math.floor(diffHours)} hours ago`;
    return `\${Math.floor(diffHours / 24)} days ago`;
  };

  if (loading) return <div>Loading proactive leader alerts...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Team Deterioration Alerts</h1>
          <p style={{ color: 'var(--text-muted)' }}>Proactive warnings generated when negative trends are detected in team surveys.</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {alerts.map(alert => {
          const isHigh = alert.risk_level === 'high' || alert.risk_level === 'critical';
          
          return (
            <div key={alert.id} className="card" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', borderTop: `4px solid \${isHigh ? 'var(--danger)' : '#D97706'}` }}>
               <div style={{ 
                 background: isHigh ? '#FEF2F2' : '#FFFBEB', 
                 color: isHigh ? 'var(--danger)' : '#D97706',
                 padding: '1rem',
                 borderRadius: '50%',
                 height: 'max-content'
               }}>
                 {isHigh ? <AlertTriangle size={24} /> : <Bell size={24} />}
               </div>
               
               <div style={{ flex: 1 }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                   <h3 style={{ fontSize: '1.125rem', fontWeight: 600, textTransform: 'capitalize' }}>
                     {alert.risk_level} Risk Detected
                   </h3>
                   <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                     <Clock size={14} /> {formatRelTime(alert.created_at)}
                   </span>
                 </div>
                 
                 <div style={{ fontWeight: 500, color: 'var(--primary)', marginBottom: '0.5rem' }}>
                   Context: {alert.context.groupName}
                 </div>
                 
                 <div style={{ padding: '1rem', background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                   <p style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>
                     <strong>Triggered Rules:</strong> {Array.isArray(alert.triggered_rules) ? alert.triggered_rules.join(', ') : 'Pattern anomaly detected'}
                   </p>
                 </div>
                 
                 <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                   <button className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Initiate Support Protocol</button>
                   <button onClick={() => handleDismiss(alert.id)} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                     <Check size={16} /> Mark as Reviewed
                   </button>
                 </div>
               </div>
            </div>
          );
        })}
        {alerts.length === 0 && (
          <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Check size={48} color="var(--success)" style={{ margin: '0 auto 1rem' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 500, color: 'var(--text-main)', marginBottom: '0.5rem' }}>No active alerts</h2>
            <p>Everything is within healthy operational parameters.</p>
          </div>
        )}
      </div>
    </div>
  );
}

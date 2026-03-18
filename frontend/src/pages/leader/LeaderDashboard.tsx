import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ShieldAlert, Users, Activity, BarChart2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function LeaderDashboard() {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [managedGroups, setManagedGroups] = useState<any[]>([]);

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
        setManagedGroups(memberships.map((m: any) => m.groups));
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
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Overall Psychological Safety</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>82 / 100</div>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ background: '#FEF2F2', padding: '1rem', borderRadius: '12px' }}>
                <ShieldAlert size={32} color="var(--danger)" />
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Active Team Alerts</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>2</div>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ background: '#EEF2FF', padding: '1rem', borderRadius: '12px' }}>
                <Users size={32} color="var(--primary)" />
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Participation Confidence</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>High</div>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart2 size={20} /> Team Trends (Aggregated & Anonymized)
            </h2>
            <div style={{ height: '300px', background: 'var(--surface)', borderRadius: '8px', border: '1px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              [Team Health Recharts Timeline Loading...]
            </div>
          </div>
        </>
      )}
    </div>
  );
}

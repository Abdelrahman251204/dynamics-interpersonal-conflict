import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, BarChart2, ShieldCheck, Activity } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function OrgDashboard() {
  const { userData } = useAuth();
  const [stats, setStats] = useState({ groups: 0, members: 0, surveysActive: 0 });
  const [orgData, setOrgData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrgData();
  }, [userData]);

  const loadOrgData = async () => {
    try {
      // Find what org this admin belongs to
      const { data: membership } = await supabase
        .from('organization_memberships')
        .select('org_id, organizations(*)')
        .eq('user_id', userData?.id)
        .limit(1)
        .single();
        
      if (!membership?.org_id) {
        setLoading(false);
        return;
      }

      setOrgData(membership.organizations);

      const { count: gCount } = await supabase.from('groups').select('*', { count: 'exact', head: true }).eq('org_id', membership.org_id);
      
      // Members where user is in a group associated with this org, or direct org membership
      const { count: mCount } = await supabase.from('organization_memberships').select('*', { count: 'exact', head: true }).eq('org_id', membership.org_id);
      
      const { count: sCount } = await supabase.from('survey_assignments')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', membership.org_id)
        .in('status', ['pending', 'in_progress']);
        
      setStats({
        groups: gCount || 0,
        members: mCount || 0,
        surveysActive: sCount || 0
      });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading Organization insights...</div>;
  if (!orgData) return (
    <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
      <ShieldCheck size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>No Organization Assigned</h2>
      <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>You do not have administrative access to any specific organization yet. Contact a System Admin.</p>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 600 }}>{orgData.name} Overview</h1>
      </div>

      <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ background: '#EEF2FF', padding: '1rem', borderRadius: '12px' }}>
            <Users size={32} color="var(--primary)" />
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Total Members</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.members}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ background: '#F3E8FF', padding: '1rem', borderRadius: '12px' }}>
            <Users size={32} color="#9333EA" />
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Groups</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.groups}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ background: '#ECFDF5', padding: '1rem', borderRadius: '12px' }}>
            <Activity size={32} color="var(--success)" />
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Active Survey Deployments</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.surveysActive}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Recent Organization Activity</h2>
        <p style={{ color: 'var(--text-muted)' }}>Organization-level analytics are gathering data.</p>
      </div>
    </div>
  );
}

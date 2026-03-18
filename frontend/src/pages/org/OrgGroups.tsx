import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function OrgGroups() {
  const { userData } = useAuth();
  const [groups, setGroups] = useState<any[]>([]);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [newGroupName, setNewGroupName] = useState('');

  useEffect(() => {
    loadData();
  }, [userData]);

  const loadData = async () => {
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

      const { data: gData } = await supabase
        .from('groups')
        .select(`
          *,
          group_memberships(count)
        `)
        .eq('org_id', membership.org_id)
        .order('created_at', { ascending: false });
        
      if (gData) setGroups(gData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || !orgId) return;
    try {
      await supabase.from('groups').insert([{ name: newGroupName.trim(), org_id: orgId }]);
      setNewGroupName('');
      loadData();
    } catch (err) {
      alert("Error creating group");
    }
  };

  const deleteGroup = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the group \${name}?`)) return;
    try {
      await supabase.from('groups').delete().eq('id', id);
      loadData();
    } catch (err) {
      alert("Error deleting group");
    }
  };

  if (loading) return <div>Loading groups...</div>;
  if (!orgId) return <div style={{ padding: '2rem' }}>You are not assigned to an organization.</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Organization Groups</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage teams and units within your organization.</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Create New Group
        </h2>
        <form onSubmit={createGroup} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input 
            type="text" 
            className="input" 
            placeholder="New Group Name" 
            value={newGroupName}
            onChange={e => setNewGroupName(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-primary" disabled={!newGroupName.trim()}>
            Create Group
          </button>
        </form>
      </div>
      
      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                <th style={{ padding: '1rem' }}>Group Name</th>
                <th style={{ padding: '1rem' }}>Members Enrolled</th>
                <th style={{ padding: '1rem' }}>Created At</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {groups.map(group => (
                <tr key={group.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ background: '#EEF2FF', padding: '0.5rem', borderRadius: '8px' }}>
                        <Users size={16} color="var(--primary)" />
                      </div>
                      <span style={{ fontWeight: 600 }}>{group.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>{group.group_memberships[0]?.count || 0}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                    {new Date(group.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '0.5rem', color: 'var(--danger)', borderColor: '#FECACA', background: '#FEF2F2' }}
                        onClick={() => deleteGroup(group.id, group.name)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {groups.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No groups created in your organization yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

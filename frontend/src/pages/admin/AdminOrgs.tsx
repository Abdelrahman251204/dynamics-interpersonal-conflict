import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Shield, Plus, Edit2, Trash2 } from 'lucide-react';

export default function AdminOrgs() {
  const [orgs, setOrgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newOrgName, setNewOrgName] = useState('');

  useEffect(() => {
    loadOrgs();
  }, []);

  const loadOrgs = async () => {
    try {
      const { data } = await supabase
        .from('organizations')
        .select(`
          *,
          organization_memberships(count),
          groups(count)
        `)
        .order('created_at', { ascending: false });
      if (data) setOrgs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;
    try {
      await supabase.from('organizations').insert([{ name: newOrgName.trim() }]);
      setNewOrgName('');
      loadOrgs();
    } catch (err) {
      alert("Error creating organization");
    }
  };

  const deleteOrg = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete \${name}? This will cascade delete their groups and survey assignments.`)) return;
    try {
      await supabase.from('organizations').delete().eq('id', id);
      loadOrgs();
    } catch (err) {
      alert("Error deleting organization");
    }
  };

  if (loading) return <div>Loading organizations...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Organizations Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage tenant organizations within the platform.</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Create New Organization
        </h2>
        <form onSubmit={createOrg} style={{ display: 'flex', gap: '1rem' }}>
          <input 
            type="text" 
            className="input" 
            placeholder="Organization Name" 
            value={newOrgName}
            onChange={e => setNewOrgName(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-primary" disabled={!newOrgName.trim()}>
            Create Organization
          </button>
        </form>
      </div>
      
      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                <th style={{ padding: '1rem' }}>Organization Name</th>
                <th style={{ padding: '1rem' }}>Members</th>
                <th style={{ padding: '1rem' }}>Groups</th>
                <th style={{ padding: '1rem' }}>Created</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orgs.map(org => (
                <tr key={org.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ background: '#F3E8FF', padding: '0.5rem', borderRadius: '8px' }}>
                        <Shield size={16} color="#9333EA" />
                      </div>
                      <span style={{ fontWeight: 600 }}>{org.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>{org.organization_memberships[0]?.count || 0}</td>
                  <td style={{ padding: '1rem' }}>{org.groups[0]?.count || 0}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                    {new Date(org.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '0.5rem', color: 'var(--danger)', borderColor: '#FECACA', background: '#FEF2F2' }}
                        onClick={() => deleteOrg(org.id, org.name)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {orgs.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No organizations created yet.
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

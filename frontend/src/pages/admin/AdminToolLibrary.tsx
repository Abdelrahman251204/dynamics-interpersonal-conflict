import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { FileText, Settings, Key, Eye } from 'lucide-react';

export default function AdminToolLibrary() {
  const [tools, setTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTools();
  }, []);

  const loadTools = async () => {
    try {
      const { data } = await supabase
        .from('surveys')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setTools(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading diagnostic tools...</div>;

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Psychometric Tool Library</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage the core clinical and diagnostic assessments available in DIME.</p>
        </div>
      </div>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)' }}>
              <th style={{ padding: '1rem' }}>Tool Name</th>
              <th style={{ padding: '1rem' }}>Category</th>
              <th style={{ padding: '1rem' }}>Data Sensitivity</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem' }}>Scale</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Configuration</th>
            </tr>
          </thead>
          <tbody>
            {tools.map(tool => (
              <tr key={tool.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ background: '#EEF2FF', padding: '0.5rem', borderRadius: '8px' }}>
                      <FileText size={16} color="var(--primary)" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{tool.name_en}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>ID: {tool.tool_id}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '1rem', textTransform: 'capitalize' }}>{tool.category || 'General'}</td>
                <td style={{ padding: '1rem' }}>
                  <span className={`badge \${tool.sensitivity === 'restricted' ? 'badge-high' : tool.sensitivity === 'sensitive' ? 'badge-medium' : 'badge-low'}`}>
                    <Key size={12} style={{ marginRight: '4px' }}/> {tool.sensitivity.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <span className={`badge \${tool.status === 'active' ? 'badge-low' : 'badge-medium'}`}>
                    {tool.status.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  {tool.response_scale_min} to {tool.response_scale_max}
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <button className="btn btn-secondary" style={{ padding: '0.5rem' }} title="View Details">
                    <Settings size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {tools.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No tools found in the library. Run the seed script to populate.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

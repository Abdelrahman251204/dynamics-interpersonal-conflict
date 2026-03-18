import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { FileText, Plus, Users, Shield } from 'lucide-react';

export default function AdminSurveys() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data } = await supabase
        .from('survey_templates')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setTemplates(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading survey configurations...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Survey Programs</h1>
          <p style={{ color: 'var(--text-muted)' }}>Configure deployment packages of tools and their schedules.</p>
        </div>
        <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Create Template
        </button>
      </div>
      
      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                <th style={{ padding: '1rem' }}>Program Name</th>
                <th style={{ padding: '1rem' }}>Target</th>
                <th style={{ padding: '1rem' }}>Cadence</th>
                <th style={{ padding: '1rem' }}>Visibility</th>
                <th style={{ padding: '1rem' }}>Tools Count</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.map(tpl => (
                <tr key={tpl.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>{tpl.name}</td>
                  <td style={{ padding: '1rem' }}>
                    <span className="badge badge-medium" style={{ background: '#F3E8FF', color: '#9333EA', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                       {tpl.target_type === 'organization' ? <Shield size={12}/> : <Users size={12}/>} {tpl.target_type.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textTransform: 'capitalize' }}>{tpl.cadence}</td>
                  <td style={{ padding: '1rem' }}>
                    <span className={`badge \${tpl.visibility_rule === 'anonymous' ? 'badge-low' : 'badge-high'}`}>
                      {tpl.visibility_rule.replace('-', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                    {tpl.tools.length} Instruments
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                      Assign
                    </button>
                  </td>
                </tr>
              ))}
              {templates.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No survey programs defined yet.
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

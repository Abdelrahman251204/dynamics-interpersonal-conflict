import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { FileText, Plus, Users, Shield, X } from 'lucide-react';

export default function AdminSurveys() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [tools, setTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isCreating, setIsCreating] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    tools: [] as string[],
    cadence: 'one-time',
    target_type: 'user',
    visibility_rule: 'identified'
  });

  useEffect(() => {
    loadTemplatesAndTools();
  }, []);

  const loadTemplatesAndTools = async () => {
    try {
      const [tplRes, toolsRes] = await Promise.all([
        supabase.from('survey_templates').select('*').order('created_at', { ascending: false }),
        supabase.from('surveys').select('id, name_en, category').order('name_en')
      ]);
      
      if (tplRes.data) setTemplates(tplRes.data);
      if (toolsRes.data) setTools(toolsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newTemplate.name || newTemplate.tools.length === 0) {
      alert("Name and at least one tool are required.");
      return;
    }
    
    try {
      const { error } = await supabase.from('survey_templates').insert([newTemplate]);
      if (error) throw error;
      
      setIsCreating(false);
      setNewTemplate({ ...newTemplate, name: '', description: '', tools: [] });
      loadTemplatesAndTools();
    } catch (err) {
      console.error(err);
      alert("Failed to create template");
    }
  };

  const toggleTool = (toolId: string) => {
    setNewTemplate(prev => {
      if (prev.tools.includes(toolId)) {
        return { ...prev, tools: prev.tools.filter(t => t !== toolId) };
      } else {
        return { ...prev, tools: [...prev.tools, toolId] };
      }
    });
  };

  if (loading) return <div>Loading survey configurations...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Survey Programs</h1>
          <p style={{ color: 'var(--text-muted)' }}>Configure deployment packages of tools and their schedules.</p>
        </div>
        {!isCreating && (
          <button onClick={() => setIsCreating(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={18} /> Create Template
          </button>
        )}
      </div>
      
      {isCreating && (
        <div className="card" style={{ marginBottom: '2rem', border: '2px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>New Survey Program</h2>
            <button onClick={() => setIsCreating(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={20} color="var(--text-muted)" />
            </button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Program Name</label>
              <input 
                className="input" 
                value={newTemplate.name} 
                onChange={e => setNewTemplate({...newTemplate, name: e.target.value})}
                placeholder="e.g. Q1 Psychological Safety Check"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Description</label>
              <input 
                className="input" 
                value={newTemplate.description} 
                onChange={e => setNewTemplate({...newTemplate, description: e.target.value})}
                placeholder="Optional purpose..."
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Cadence</label>
              <select className="input" value={newTemplate.cadence} onChange={e => setNewTemplate({...newTemplate, cadence: e.target.value})}>
                <option value="one-time">One-time</option>
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
                <option value="onboarding">Onboarding</option>
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Target Type</label>
              <select className="input" value={newTemplate.target_type} onChange={e => setNewTemplate({...newTemplate, target_type: e.target.value})}>
                <option value="user">Specific Users</option>
                <option value="group">Specific Groups</option>
                <option value="organization">Entire Organization</option>
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Visibility Mode</label>
              <select className="input" value={newTemplate.visibility_rule} onChange={e => setNewTemplate({...newTemplate, visibility_rule: e.target.value})}>
                <option value="identified">Identified (Admins & Leaders)</option>
                <option value="anonymous">Strictly Anonymous (Aggregates Only)</option>
                <option value="leader-visible">Leader Only</option>
                <option value="member-only">Member Only</option>
              </select>
            </div>
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Select Psychometric Tools to Include</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.5rem', background: 'var(--surface)', padding: '1rem', borderRadius: '8px', maxHeight: '200px', overflowY: 'auto' }}>
              {tools.map(tool => (
                <label key={tool.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={newTemplate.tools.includes(tool.id)}
                    onChange={() => toggleTool(tool.id)}
                  />
                  <span style={{ fontSize: '0.875rem' }}>{tool.name_en} <span style={{ color: 'var(--text-muted)' }}>({tool.category})</span></span>
                </label>
              ))}
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={handleCreate} className="btn btn-primary">Save Program</button>
          </div>
        </div>
      )}
      
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
                    {tpl.tools?.length || 0} Instruments
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

import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { FileText, Search, Filter, X, Send } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function HRCases() {
  const { userData } = useAuth();
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeCase, setActiveCase] = useState<any>(null);
  const [newNote, setNewNote] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  useEffect(() => {
    loadCases();
  }, [userData]);

  const loadCases = async () => {
    try {
      const { data } = await supabase
        .from('case_management')
        .select(`
          *,
          users!case_management_assigned_to_fkey(full_name)
        `)
        .order('created_at', { ascending: false });
        
      if (data) setCases(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (caseId: string, newStatus: string) => {
    try {
      await supabase.from('case_management').update({ status: newStatus }).eq('id', caseId);
      
      setCases(cases.map(c => c.id === caseId ? { ...c, status: newStatus } : c));
      if (activeCase?.id === caseId) {
        setActiveCase({ ...activeCase, status: newStatus });
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !activeCase) return;
    setSubmittingNote(true);
    try {
      // Append to description or notes. Using description as a safe field if notes doesn't exist.
      const timestamp = new Date().toLocaleString();
      const updatedDesc = (activeCase.description || '') + `\n\n[-- Note by \${userData?.full_name} at \${timestamp} --]\n\${newNote}`;
      
      await supabase.from('case_management').update({ description: updatedDesc }).eq('id', activeCase.id);
      
      setCases(cases.map(c => c.id === activeCase.id ? { ...c, description: updatedDesc } : c));
      setActiveCase({ ...activeCase, description: updatedDesc });
      setNewNote('');
    } catch (err) {
      console.error("Failed to add note", err);
    } finally {
      setSubmittingNote(false);
    }
  };

  if (loading) return <div>Loading Cases...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Case Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage, track, and resolve escalated HR interventions securely.</p>
        </div>
        {!activeCase && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={18} /> Filter
            </button>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="text" className="input" placeholder="Search cases..." style={{ paddingLeft: '2.5rem' }} />
            </div>
          </div>
        )}
      </div>

      {activeCase ? (
        <div className="card" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>{activeCase.title || 'Untitled Assessment'}</h2>
                <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  <span>ID: {activeCase.id}</span>
                  <span>Opened: {new Date(activeCase.created_at).toLocaleString()}</span>
                </div>
              </div>
              <button className="btn btn-secondary" onClick={() => setActiveCase(null)} style={{ padding: '0.5rem' }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ padding: '1.5rem', background: 'var(--surface)', borderRadius: '8px', marginBottom: '2rem', border: '1px solid var(--border)', whiteSpace: 'pre-wrap' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Investigation Log & Notes</h3>
              {activeCase.description || 'No notes have been added to this case yet.'}
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Add securely encrypted note</label>
              <textarea 
                className="input" 
                rows={4} 
                placeholder="Document your findings, meetings, or resolution steps..."
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                style={{ marginBottom: '1rem', resize: 'vertical' }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-primary" onClick={handleAddNote} disabled={submittingNote || !newNote.trim()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Send size={16} /> Append Note
                </button>
              </div>
            </div>
          </div>
          
          <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: '2rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem' }}>Case Details</h3>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Priority Level</div>
              <span className={`badge \${activeCase.priority === 'high' || activeCase.priority === 'critical' ? 'badge-high' : activeCase.priority === 'medium' ? 'badge-medium' : 'badge-low'}`} style={{ textTransform: 'capitalize' }}>
                {activeCase.priority}
              </span>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Status</div>
              <select 
                className="input" 
                value={activeCase.status} 
                onChange={(e) => handleUpdateStatus(activeCase.id, e.target.value)}
              >
                <option value="open">Open</option>
                <option value="in_progress">Investigation Ongoing</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Assigned Analyst</div>
              <div style={{ fontWeight: 500 }}>{activeCase.users?.full_name || 'Unassigned'}</div>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Related Subject(s)</div>
              <div style={{ fontWeight: 500, color: 'var(--primary)' }}>Protected (View Risk Panel)</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  <th style={{ padding: '1rem' }}>Case Identifier</th>
                  <th style={{ padding: '1rem' }}>Priority</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  <th style={{ padding: '1rem' }}>Analyst Lead</th>
                  <th style={{ padding: '1rem' }}>Opened</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cases.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ background: '#F3E8FF', padding: '0.5rem', borderRadius: '8px' }}>
                          <FileText size={16} color="#9333EA" />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{c.title || 'HR Investigation'}</div>
                          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>ID: {c.id.substring(0, 8)}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', textTransform: 'capitalize' }}>
                       <span className={`badge \${c.priority === 'high' || c.priority === 'critical' ? 'badge-high' : c.priority === 'medium' ? 'badge-medium' : 'badge-low'}`}>
                         {c.priority}
                       </span>
                    </td>
                    <td style={{ padding: '1rem', textTransform: 'capitalize' }}>
                      <span className={`badge \${c.status === 'resolved' || c.status === 'closed' ? 'badge-low' : c.status === 'in_progress' ? 'badge-medium' : 'badge-high'}`}>
                        {c.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-main)' }}>
                      {c.users?.full_name || 'Unassigned'}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button className="btn btn-primary" onClick={() => setActiveCase(c)} style={{ padding: '0.5rem 1rem' }}>
                        Open Workspace
                      </button>
                    </td>
                  </tr>
                ))}
                {cases.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No active cases in your queue.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

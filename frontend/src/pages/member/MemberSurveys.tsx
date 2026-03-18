import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ClipboardList, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function MemberSurveys() {
  const { userData } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSurveys();
  }, [userData]);

  const loadSurveys = async () => {
    try {
      if (!userData?.id) return;
      
      const { data } = await supabase
        .from('survey_assignments')
        .select('*, survey_templates(name, tools)')
        .eq('user_id', userData.id)
        .order('due_date', { ascending: true });
        
      if (data) setAssignments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading your assigned surveys...</div>;

  const pending = assignments.filter(a => a.status === 'pending');
  const inProgress = assignments.filter(a => a.status === 'in_progress');
  const completed = assignments.filter(a => a.status === 'completed');

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Active Assessments</h1>
          <p style={{ color: 'var(--text-muted)' }}>Complete your assigned psychometric tools to track personal wellbeing.</p>
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={20} color="var(--primary)" /> Pending & In Progress
        </h2>
        {pending.length === 0 && inProgress.length === 0 ? (
          <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            You have no active survey assignments at this time.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {[...inProgress, ...pending].map(a => (
               <div key={a.id} className="card" style={{ borderTop: `4px solid \${a.status === 'in_progress' ? '#D97706' : 'var(--primary)'}` }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <h3 style={{ fontWeight: 600, fontSize: '1.125rem' }}>{a.survey_templates?.name}</h3>
                    {a.status === 'in_progress' && <span className="badge badge-medium">In Progress</span>}
                 </div>
                 <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                   Due by: {new Date(a.due_date).toLocaleDateString()}
                 </p>
                 <button className="btn btn-primary" style={{ width: '100%' }}>
                   {a.status === 'in_progress' ? 'Resume Assessment' : 'Start Assessment'}
                 </button>
               </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={20} color="var(--success)" /> Completed History
        </h2>
        <div className="card">
          {completed.length === 0 ? (
             <p style={{ color: 'var(--text-muted)' }}>Your completed assignments will appear here.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {completed.map(a => (
                <div key={a.id} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{a.survey_templates?.name}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Finished: {new Date(a.updated_at).toLocaleDateString()}</div>
                  </div>
                  <Link to="/member/results" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                    View Results
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

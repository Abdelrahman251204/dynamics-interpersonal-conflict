import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Activity, Bell, FileText, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function MemberDashboard() {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [recentScores, setRecentScores] = useState<any[]>([]);

  useEffect(() => {
    loadMemberProfile();
  }, [userData]);

  const loadMemberProfile = async () => {
    try {
      if (!userData?.id) return;
      
      const { data: activeSurveys } = await supabase
        .from('survey_assignments')
        .select('*, survey_templates(name)')
        .eq('user_id', userData.id)
        .eq('status', 'pending')
        .order('due_date', { ascending: true })
        .limit(3);
        
      if (activeSurveys) setAssignments(activeSurveys);

      const { data: instances } = await supabase
        .from('survey_instances')
        .select('id, score, created_at, surveys(name_en)')
        .eq('user_id', userData.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(3);
        
      if (instances) setRecentScores(instances);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading your dashboard...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>Welcome Back, {userData?.full_name?.split(' ')[0] || 'User'}</h1>
          <p style={{ color: 'var(--text-muted)' }}>Here is your personal wellbeing and assessment timeline.</p>
        </div>
      </div>

      <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>
            <Bell size={18} color="var(--primary)" /> Action Required
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {assignments.length} Pending
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            {assignments.length > 0 ? 'Surveys await your completion.' : 'You are all caught up!'}
          </div>
          {assignments.length > 0 && (
            <Link to="/member/surveys" className="btn btn-primary" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              Take Pending Surveys
            </Link>
          )}
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>
            <Activity size={18} color="var(--success)" /> Wellbeing Streak
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)' }}>
            3 Weeks
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Consecutive survey completions.
          </div>
        </div>
        
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>
            <FileText size={18} color="#D97706" /> Privacy Status
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)' }}>
            Fully Anonymized
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: 1.5 }}>
            Your raw answers are hidden from your team leader to protect psychological safety.
          </div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={20} /> Recent Assessments
        </h2>
        
        {recentScores.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--surface)', borderRadius: '8px' }}>
            No completed assessments yet. Your history will appear here.
          </div>
        ) : (
           <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             {recentScores.map(score => (
                <div key={score.id} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div>
                     <div style={{ fontWeight: 600 }}>{score.surveys?.name_en}</div>
                     <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{new Date(score.created_at).toLocaleDateString()}</div>
                   </div>
                   <Link to="/member/results" className="btn btn-secondary" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
                     View Insights
                   </Link>
                </div>
             ))}
           </div>
        )}
      </div>
    </div>
  );
}

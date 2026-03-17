import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ShieldAlert, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SurveyInstance {
  id: string;
  survey_id: string;
  status: string;
  expires_at: string;
  surveys: {
    name_en: string;
    description_en: string;
    category: string;
  };
}

interface Score {
  id: string;
  survey_id: string;
  computed_at: string;
  surveys: {
    name_en: string;
  };
}

export default function MemberDashboard() {
  const { user } = useAuth();
  const [pendingSurveys, setPendingSurveys] = useState<SurveyInstance[]>([]);
  const [completedScores, setCompletedScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboard();
    }
  }, [user]);

  const loadDashboard = async () => {
    try {
      // Get assigned surveys that are pending
      const { data: assignments } = await supabase
        .from('survey_instances')
        .select(`
          id, survey_id, status, expires_at,
          surveys (name_en, description_en, category)
        `)
        .eq('assigned_to', user?.id)
        .eq('status', 'in_progress');
        
      if (assignments) {
        setPendingSurveys(assignments as unknown as SurveyInstance[]);
      }

      // Get my recent scores
      const { data: scores } = await supabase
        .from('scores')
        .select(`
          id, survey_id, computed_at,
          surveys (name_en)
        `)
        .eq('user_id', user?.id)
        .order('computed_at', { ascending: false })
        .limit(5);
        
      if (scores) {
        setCompletedScores(scores as unknown as Score[]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '2rem' }}>My Dashboard</h1>

      <div className="dashboard-grid">
        {/* Pending Surveys */}
        <div className="card">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={20} color="var(--warning)" />
            Pending Surveys ({pendingSurveys.length})
          </h2>
          {pendingSurveys.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>You have no pending surveys.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {pendingSurveys.map(item => (
                <div key={item.id} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px', background: '#FAFAFA' }}>
                  <h3 style={{ fontWeight: 600 }}>{item.surveys.name_en}</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    {item.surveys.description_en}
                  </p>
                  <Link to={`/survey/${item.survey_id}`} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                    Start Survey
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={20} color="var(--success)" />
            Recent Activity
          </h2>
          {completedScores.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No completed surveys yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {completedScores.map(score => (
                <div key={score.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <span style={{ fontWeight: 500 }}>{score.surveys.name_en}</span>
                  </div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    {new Date(score.computed_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

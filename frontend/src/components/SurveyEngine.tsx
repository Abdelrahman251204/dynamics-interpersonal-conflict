import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Question {
  id: string;
  item_code: string;
  text_en: string;
  text_ar: string;
  domain_id: string;
  reverse_scored: boolean;
  question_order: number;
  scale_min: number;
  scale_max: number;
}

interface SurveyEngineProps {
  surveyId: string;
}

export default function SurveyEngine({ surveyId }: SurveyEngineProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [surveyName, setSurveyName] = useState('');
  const [instanceId, setInstanceId] = useState('');
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    startSurvey();
  }, [surveyId]);

  const startSurvey = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/survey-start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          survey_id: surveyId,
          team_id: null, // Depending on if it's assigned to a team
          is_anonymous: false
        })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to start survey');
      
      setQuestions(data.questions);
      setSurveyName(data.survey_name);
      setInstanceId(data.instance_id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (qId: string, val: number) => {
    setAnswers(prev => ({ ...prev, [qId]: val }));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError('');
      
      // format answers array
      const ansArray = Object.entries(answers).map(([qId, val]) => ({
        question_id: qId,
        numeric_value: val
      }));
      
      if (ansArray.length < questions.length) {
        throw new Error('Please answer all questions before submitting.');
      }

      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/survey-submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          instance_id: instanceId,
          answers: ansArray
        })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to submit survey');
      
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 3000); // go back to dashboard
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><Loader className="animate-spin" size={32} /></div>;
  
  if (success) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <CheckCircle size={64} color="var(--success)" style={{ margin: '0 auto 1rem' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>Survey Submitted!</h2>
        <p style={{ color: 'var(--text-muted)' }}>Thank you. Your responses have been recorded and are being analyzed by the DIME Engine.</p>
        <p style={{ marginTop: '2rem', fontSize: '0.875rem' }}>Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>{surveyName}</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Please carefully read each statement and select the option that best applies to you.
        </p>
      </div>

      {error && (
        <div style={{ background: '#FEE2E2', color: '#EF4444', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {questions.map((q, idx) => {
          // generate scale arr
          const opts = [];
          for (let i = q.scale_min; i <= q.scale_max; i++) opts.push(i);
          
          return (
            <div key={q.id} className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 500, marginBottom: '1rem' }}>
                <span style={{ color: 'var(--primary)', marginRight: '0.5rem' }}>{idx + 1}.</span>
                {q.text_en}
              </h3>
              
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {opts.map(val => (
                  <button
                    key={val}
                    onClick={() => handleAnswer(q.id, val)}
                    style={{
                      padding: '0.75rem 1.5rem',
                      borderRadius: '8px',
                      border: `2px solid ${answers[q.id] === val ? 'var(--primary)' : 'var(--border)'}`,
                      background: answers[q.id] === val ? '#EEF2FF' : 'white',
                      color: answers[q.id] === val ? 'var(--primary)' : 'var(--text-main)',
                      fontWeight: answers[q.id] === val ? 600 : 400,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      flex: 1,
                      minWidth: '60px'
                    }}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          onClick={handleSubmit} 
          className="btn btn-primary" 
          disabled={submitting || Object.keys(answers).length < questions.length}
          style={{ padding: '1rem 3rem', fontSize: '1.125rem' }}
        >
          {submitting ? 'Submitting...' : 'Complete & Submit'}
        </button>
      </div>
    </div>
  );
}

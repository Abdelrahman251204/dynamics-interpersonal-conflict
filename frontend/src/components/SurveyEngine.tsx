import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Question {
  id: string;
  survey_id: string;
  item_code: string;
  text_en: string;
  text_ar: string;
  domain_id: string;
  reverse_scored: boolean;
  question_order: number;
  scale_min: number;
  scale_max: number;
}

interface Tool {
  id: string;
  name_en: string;
  response_scale_min: number;
  response_scale_max: number;
  questions: Question[];
}

interface SurveyEngineProps {
  surveyId: string; // This is actually the assignment ID from MemberSurveys
}

export default function SurveyEngine({ surveyId }: SurveyEngineProps) {
  const { userData } = useAuth();
  const navigate = useNavigate();
  
  const [tools, setTools] = useState<Tool[]>([]);
  const [currentToolIndex, setCurrentToolIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  
  const [assignment, setAssignment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadSurveyData();
  }, [surveyId]);

  const loadSurveyData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // 1. Get assignment
      const { data: assignData, error: assignErr } = await supabase
        .from('survey_assignments')
        .select('*, survey_templates(name, tools)')
        .eq('id', surveyId)
        .single();
        
      if (assignErr) throw assignErr;
      setAssignment(assignData);

      // 2. Load Tools and Questions
      const toolIds = assignData.survey_templates.tools;
      const loadedTools: Tool[] = [];
      
      for (const tId of toolIds) {
        const { data: toolData } = await supabase
          .from('surveys')
          .select('*')
          .eq('id', tId)
          .single();
          
        if (toolData) {
          const { data: qData } = await supabase
            .from('questions')
            .select('*')
            .eq('survey_id', tId)
            .order('question_order', { ascending: true });
            
          loadedTools.push({
            ...toolData,
            questions: qData || []
          });
        }
      }
      
      setTools(loadedTools);
    } catch (err: any) {
      setError(err.message || 'Failed to load assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (qId: string, val: number) => {
    setAnswers(prev => ({ ...prev, [qId]: val }));
  };

  const canAdvance = () => {
    if (!tools[currentToolIndex]) return false;
    const currentQuestions = tools[currentToolIndex].questions;
    return currentQuestions.every(q => answers[q.id] !== undefined);
  };

  const handleNext = () => {
    if (currentToolIndex < tools.length - 1) {
      setCurrentToolIndex(prev => prev + 1);
      window.scrollTo(0, 0);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError('');

      if (!userData?.id || !assignment) throw new Error("Missing assignment constraints.");
      
      // 1. Create a tracking Instance
      const { data: instance, error: instanceErr } = await supabase
        .from('survey_instances')
        .insert([{
          survey_id: tools[0].id, // Defaulting to primarily tracking the first tool for relations
          assigned_by: assignment.assigned_by,
          title: assignment.survey_templates.name,
          status: 'completed'
        }])
        .select()
        .single();
        
      if (instanceErr) throw instanceErr;

      // 2. Score calculation & Responses insert
      const responsesToInsert = [];
      
      for (const tool of tools) {
        let totalRaw = 0;
        let maxPossible = tool.questions.length * tool.response_scale_max;
        
        for (const q of tool.questions) {
          const rawVal = answers[q.id];
          const calculatedVal = q.reverse_scored 
            ? (tool.response_scale_max + tool.response_scale_min - rawVal) 
            : rawVal;
            
          totalRaw += calculatedVal;
          
          responsesToInsert.push({
            instance_id: instance.id,
            user_id: userData.id,
            question_id: q.id,
            numeric_value: rawVal
          });
        }
        
        const normalized = (totalRaw / maxPossible) * 100;
        
        await supabase.from('scores').insert([{
           instance_id: instance.id,
           user_id: userData.id,
           survey_id: tool.id,
           total_raw: totalRaw,
           total_normalized: normalized,
           risk_level: normalized > 75 ? 'critical' : normalized > 50 ? 'high' : 'low'
        }]);
      }
      
      // Insert all responses
      await supabase.from('responses').insert(responsesToInsert);
      
      // 3. Mark Assignment Complete
      await supabase
        .from('survey_assignments')
        .update({ status: 'completed' })
        .eq('id', assignment.id);
        
      setSuccess(true);
      setTimeout(() => navigate('/member/dashboard'), 3000); // go back
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to submit responses');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><Loader className="animate-spin" size={32} /></div>;
  if (!assignment || tools.length === 0) return <div>Could not initialize survey session.</div>;
  
  if (success) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <CheckCircle size={64} color="var(--success)" style={{ margin: '0 auto 1rem' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>Assessment Completed!</h2>
        <p style={{ color: 'var(--text-muted)' }}>Thank you. Your results have been securely encrypted and stored.</p>
        <p style={{ marginTop: '2rem', fontSize: '0.875rem' }}>Redirecting to dashboard...</p>
      </div>
    );
  }

  const currentTool = tools[currentToolIndex];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>{assignment.survey_templates.name}</h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>
            Part {currentToolIndex + 1} of {tools.length}: <strong>{currentTool.name_en}</strong>
          </p>
        </div>
      </div>

      {error && (
        <div style={{ background: '#FEE2E2', color: '#EF4444', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {currentTool.questions.map((q, idx) => {
          const opts = [];
          for (let i = currentTool.response_scale_min || 1; i <= (currentTool.response_scale_max || 5); i++) opts.push(i);
          
          return (
            <div key={q.id} className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 500, marginBottom: '1rem' }}>
                <span style={{ color: 'var(--primary)', marginRight: '0.5rem' }}>{idx + 1}.</span>
                {q.text_en}
              </h3>
              
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {opts.map(val => (
                  <button
                    key={val}
                    onClick={() => handleAnswer(q.id, val)}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      border: `2px solid \${answers[q.id] === val ? 'var(--primary)' : 'var(--border)'}`,
                      background: answers[q.id] === val ? '#EEF2FF' : 'white',
                      color: answers[q.id] === val ? 'var(--primary)' : 'var(--text-main)',
                      fontWeight: answers[q.id] === val ? 600 : 400,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      flex: 1,
                      minWidth: '40px'
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

      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
        <button 
          onClick={handleNext} 
          className="btn btn-primary" 
          disabled={!canAdvance() || submitting}
          style={{ padding: '1rem 3rem', fontSize: '1.125rem' }}
        >
          {submitting ? 'Processing...' : (currentToolIndex < tools.length - 1 ? 'Next Section' : 'Submit Assessment')}
        </button>
      </div>
    </div>
  );
}

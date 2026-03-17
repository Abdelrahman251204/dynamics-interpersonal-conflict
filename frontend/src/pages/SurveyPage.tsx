import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import SurveyEngine from '../components/SurveyEngine';

export default function SurveyPage() {
  const { id } = useParams();

  if (!id) return <Navigate to="/dashboard" replace />;

  return (
    <div style={{ paddingTop: '1rem', paddingBottom: '4rem' }}>
      <SurveyEngine surveyId={id} />
    </div>
  );
}

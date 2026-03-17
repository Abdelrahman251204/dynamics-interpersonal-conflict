# Architecture Overview

## Database Layer
- Supabase PostgreSQL
- **Data Entities**: users, teams, team_members, surveys, survey_domains, questions, survey_instances, responses, scores, domain_scores, risk_flags, team_metrics, dyadic_relations, notifications, audit_logs.
- **Row Level Security (RLS)** is strictly enforced to protect sensitive health data.

## Processing Layer (Edge Functions)
All business logic is isolated in stateless Edge Functions:
1. `survey-start`: Instantiates surveys
2. `survey-submit`: Ingests responses
3. `scoring-engine`: Normalizes and scores tools
4. `risk-engine`: Evaluates thresholds and flags anomalies
5. `analytics-engine`: Aggregates team metrics
6. `notifications`: Routes alerts

## Frontend App
- React + Vite SPA.
- Implements dynamic Survey Engine capable of parsing JSON/DB driven questionnaires.
- Uses `React.lazy` for routing efficiency.

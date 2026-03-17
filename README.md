# DIME – Team Dynamics & Psychological Monitoring System

## Overview
DIME is a comprehensive, production-ready system to monitor team dynamics, psychological safety, individual mental state, digital stress, and burnout. 

It provides structured psychometric evaluations through an engine that features dynamic survey generation, automated clinical scoring, risk flagging, and trend analytics.

## Tech Stack
- **Database**: Supabase (PostgreSQL with RLS)
- **Backend / APIs**: Supabase Edge Functions (Deno / TypeScript)
- **Frontend**: React + Vite (TypeScript, Modern Glassmorphism CSS)
- **Auth**: Supabase Auth

## Features
- Complete RLS policies separating Team Members, Team Leaders, and HR Analysts/Admins.
- 14 pre-loaded psychometric scales (PHQ-9, DASS-21, MBI Burnout, Big Five, ICS, Trust, etc.).
- Robust Risk Engine that calculates configurable thresholds and auto-flags critical cases.
- Comprehensive team analytics separating clinical data (private) from aggregated team health data.

## Deployment Details
All code sits in the respective directories:
- `/frontend` - The React Vite application.
- `/db` - SQL migrations and psychometric data seeds.
- `/scripts` - Automation scripts.
- `/docs` - Architecture and API guides.
- `/tests` - Scoring engine stubs.

## Getting Started Locally
1. cd `frontend`
2. copy `.env.example` to `.env` and fill with Supabase credentials
3. `npm install`
4. `npm run dev`

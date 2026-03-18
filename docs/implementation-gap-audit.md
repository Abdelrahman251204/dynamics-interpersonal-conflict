# DIME Implementation Gap Audit

## Overview
This document serves as the ground-truth audit for the DIME (Team Dynamics & Psychological Monitoring System) transition from a compiled UI structure to a fully wired, production-ready application.

## 1. Auth & Access Workflow
- **Status:** PARTIAL
- **Working:** Registration, login, role redirection, `AuthContext` impersonation state.
- **Missing:** The actual creation of an `access_request` row upon user signup needs to be strictly enforced (or confirmed) inside the authentication flow.

## 2. Admin Universal Access
- **Status:** PARTIAL
- **Working:** The UI for `/admin/*` exists. The impersonation switcher works in the React context. Admin Access Requests table works.
- **Missing:**
  - `AdminUsers.tsx` needs full CRUD (specifically suspending/reactivating).
  - `AdminOrgs.tsx` has basic create/delete, but needs to gracefully handle related data.
  - `AdminGroups.tsx` has basic create, but lacks member assignment.
  - `AdminSurveys.tsx` and `AdminToolLibrary.tsx` are largely UI/Read-only stubs.

## 3. Organization Management
- **Status:** PLACEHOLDER / PARTIAL
- **Working:** `OrgDashboard` aggregates basic org stats. `OrgGroups` shows groups.
- **Missing:**
  - `OrgMembers` is read-only. Org Admins cannot currently invite/add existing users to their org natively.
  - `OrgSurveys` and `OrgAnalytics` are purely visual (mock Recharts or placeholders).

## 4. Group Leader Analytics & Conflict Map
- **Status:** PLACEHOLDER
- **Working:** `LeaderDashboard` loads assigned groups.
- **Missing:**
  - Actual Team Health calculations and Risk distributions.
  - `ConflictMap.tsx` is completely mocked (static HTML/CSS nodes). Missing dyadic relational metadata aggregation from Supabase.
  - `LeaderAlerts.tsx` uses a static `setTimeout` mock array.

## 5. HR Case Management
- **Status:** PARTIAL
- **Working:** `HRFlags` reads from `risk_flags`. Case escalation works basically. `HRCases` reads from `case_management`.
- **Missing:** Case detail view, internal notes array, handler reassignment, and resolution workflows are missing.

## 6. Member Survey Experience
- **Status:** PLACEHOLDER
- **Working:** `MemberDashboard` reads assigned surveys.
- **Missing:**
  - Actual Survey taking flow (`/member/surveys/:id`).
  - Scoring execution triggers.
  - `MemberResults.tsx` is completely hardcoded mock data.

## 7. Survey System Foundation
- **Status:** PLACEHOLDER
- **Working:** The 14 tools represent standard rows in `surveys`.
- **Missing:**
  - An interactive Survey Engine that parses tool schemas, collects 1-5 scale responses, calculates reverse scores, computes domain buckets, and saves to `survey_instances`.

## 8. Database Security (RLS)
- **Status:** PARTIAL
- **Working:** Basic segregation logic is in `schema.sql`.
- **Missing:** Complex dyadic relationships, robust impersonation bypass handling for `system_admin`, and strictly scoped inserts/updates for Org Admins vs Leaders.

---
**Next Actions:**
Proceed to rewrite the specific pages and edge functions to connect to real data schemas, implementing actual Recharts rendering, interactive forms, and Supabase mutations.

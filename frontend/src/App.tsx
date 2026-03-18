import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import RoleLayout from './components/layout/RoleLayout';

// Auth Pages
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const PendingApproval = React.lazy(() => import('./pages/PendingApproval'));
const Rejected = React.lazy(() => import('./pages/Rejected'));
const Suspended = React.lazy(() => import('./pages/Suspended'));

// Shared
const SurveyPage = React.lazy(() => import('./pages/SurveyPage'));

// Admin
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const AdminAccessRequests = React.lazy(() => import('./pages/admin/AdminAccessRequests'));
const AdminUsers = React.lazy(() => import('./pages/admin/AdminUsers'));
const AdminOrgs = React.lazy(() => import('./pages/admin/AdminOrgs'));
const AdminGroups = React.lazy(() => import('./pages/admin/AdminGroups'));
const AdminSurveys = React.lazy(() => import('./pages/admin/AdminSurveys'));
const AdminToolLibrary = React.lazy(() => import('./pages/admin/AdminToolLibrary'));
const AdminAnalytics = React.lazy(() => import('./pages/admin/AdminAnalytics'));
const AdminRiskFlags = React.lazy(() => import('./pages/admin/AdminRiskFlags'));
const AdminAuditLogs = React.lazy(() => import('./pages/admin/AdminAuditLogs'));
const AdminSettings = React.lazy(() => import('./pages/admin/AdminSettings'));

// Org
const OrgDashboard = React.lazy(() => import('./pages/org/OrgDashboard'));
const OrgProfile = React.lazy(() => import('./pages/org/OrgProfile'));
const OrgGroups = React.lazy(() => import('./pages/org/OrgGroups'));
const OrgMembers = React.lazy(() => import('./pages/org/OrgMembers'));
const OrgSurveys = React.lazy(() => import('./pages/org/OrgSurveys'));
const OrgAnalytics = React.lazy(() => import('./pages/org/OrgAnalytics'));
const OrgReports = React.lazy(() => import('./pages/org/OrgReports'));

// Leader
const LeaderDashboard = React.lazy(() => import('./pages/leader/LeaderDashboard'));
const LeaderTeam = React.lazy(() => import('./pages/leader/LeaderTeam'));
const LeaderSurveys = React.lazy(() => import('./pages/leader/LeaderSurveys'));
const LeaderAnalytics = React.lazy(() => import('./pages/leader/LeaderAnalytics'));
const ConflictMap = React.lazy(() => import('./pages/leader/ConflictMap'));
const LeaderAlerts = React.lazy(() => import('./pages/leader/LeaderAlerts'));
const LeaderRecommendations = React.lazy(() => import('./pages/leader/LeaderRecommendations'));

// Member
const MemberDashboard = React.lazy(() => import('./pages/member/MemberDashboard'));
const MemberSurveys = React.lazy(() => import('./pages/member/MemberSurveys'));
const MemberSurveyHistory = React.lazy(() => import('./pages/member/MemberSurveyHistory'));
const MemberResults = React.lazy(() => import('./pages/member/MemberResults'));
const MemberTrends = React.lazy(() => import('./pages/member/MemberTrends'));
const MemberProfile = React.lazy(() => import('./pages/member/MemberProfile'));
const MemberNotifications = React.lazy(() => import('./pages/member/MemberNotifications'));
const MemberPrivacy = React.lazy(() => import('./pages/member/MemberPrivacy'));

// HR
const HRDashboard = React.lazy(() => import('./pages/hr/HRDashboard'));
const HRFlags = React.lazy(() => import('./pages/hr/HRFlags'));
const HRCases = React.lazy(() => import('./pages/hr/HRCases'));
const HRInterventions = React.lazy(() => import('./pages/hr/HRInterventions'));
const HRReports = React.lazy(() => import('./pages/hr/HRReports'));

const StatusRoute = ({ children, allowedStatuses }: { children: React.ReactNode, allowedStatuses: string[] }) => {
  const { user, userData, isLoading } = useAuth();
  if (isLoading) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem' }}>Loading DIME System...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!userData) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem' }}>Loading Profile...</div>;
  
  if (!allowedStatuses.includes(userData.status)) {
     if (userData.status === 'pending') return <Navigate to="/pending" replace />;
     if (userData.status === 'rejected') return <Navigate to="/rejected" replace />;
     if (userData.status === 'suspended') return <Navigate to="/suspended" replace />;
     
     // Route to correct base layout depending on role
     if (userData.role === 'system_admin') return <Navigate to="/admin/dashboard" replace />;
     if (userData.role === 'organization_admin') return <Navigate to="/org/dashboard" replace />;
     if (userData.role === 'leader') return <Navigate to="/leader/dashboard" replace />;
     if (userData.role === 'hr_analyst') return <Navigate to="/hr/dashboard" replace />;
     return <Navigate to="/member/dashboard" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter basename="/dynamics-interpersonal-conflict">
      <React.Suspense fallback={<div style={{ textAlign: 'center', padding: '4rem' }}>Loading application...</div>}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/pending" element={<StatusRoute allowedStatuses={['pending']}><PendingApproval /></StatusRoute>} />
          <Route path="/rejected" element={<StatusRoute allowedStatuses={['rejected']}><Rejected /></StatusRoute>} />
          <Route path="/suspended" element={<StatusRoute allowedStatuses={['suspended']}><Suspended /></StatusRoute>} />

          {/* SYSTEM ADMIN ROUTES */}
          <Route path="/admin" element={<RoleLayout allowedRoles={['system_admin']} />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="access-requests" element={<AdminAccessRequests />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="organizations" element={<AdminOrgs />} />
            <Route path="groups" element={<AdminGroups />} />
            <Route path="surveys" element={<AdminSurveys />} />
            <Route path="tool-library" element={<AdminToolLibrary />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="risk-flags" element={<AdminRiskFlags />} />
            <Route path="audit-logs" element={<AdminAuditLogs />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* ORGANIZATION ADMIN ROUTES */}
          <Route path="/org" element={<RoleLayout allowedRoles={['organization_admin']} />}>
            <Route index element={<Navigate to="/org/dashboard" replace />} />
            <Route path="dashboard" element={<OrgDashboard />} />
            <Route path="profile" element={<OrgProfile />} />
            <Route path="groups" element={<OrgGroups />} />
            <Route path="members" element={<OrgMembers />} />
            <Route path="surveys" element={<OrgSurveys />} />
            <Route path="analytics" element={<OrgAnalytics />} />
            <Route path="reports" element={<OrgReports />} />
          </Route>

          {/* GROUP LEADER ROUTES */}
          <Route path="/leader" element={<RoleLayout allowedRoles={['leader']} />}>
            <Route index element={<Navigate to="/leader/dashboard" replace />} />
            <Route path="dashboard" element={<LeaderDashboard />} />
            <Route path="team" element={<LeaderTeam />} />
            <Route path="surveys" element={<LeaderSurveys />} />
            <Route path="analytics" element={<LeaderAnalytics />} />
            <Route path="conflict-map" element={<ConflictMap />} />
            <Route path="alerts" element={<LeaderAlerts />} />
            <Route path="recommendations" element={<LeaderRecommendations />} />
          </Route>

          {/* MEMBER ROUTES */}
          <Route path="/member" element={<RoleLayout allowedRoles={['member']} />}>
            <Route index element={<Navigate to="/member/dashboard" replace />} />
            <Route path="dashboard" element={<MemberDashboard />} />
            <Route path="surveys" element={<MemberSurveys />} />
            <Route path="survey-history" element={<MemberSurveyHistory />} />
            <Route path="results" element={<MemberResults />} />
            <Route path="trends" element={<MemberTrends />} />
            <Route path="profile" element={<MemberProfile />} />
            <Route path="notifications" element={<MemberNotifications />} />
            <Route path="privacy" element={<MemberPrivacy />} />
          </Route>

          {/* HR ANALYST ROUTES */}
          <Route path="/hr" element={<RoleLayout allowedRoles={['hr_analyst']} />}>
            <Route index element={<Navigate to="/hr/dashboard" replace />} />
            <Route path="dashboard" element={<HRDashboard />} />
            <Route path="flags" element={<HRFlags />} />
            <Route path="cases" element={<HRCases />} />
            <Route path="interventions" element={<HRInterventions />} />
            <Route path="reports" element={<HRReports />} />
          </Route>

          <Route path="/survey/:id" element={<SurveyPage />} />

          {/* Base Redirect */}
          <Route path="/" element={<StatusRoute allowedStatuses={['approved']}><div>Redirecting...</div></StatusRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </React.Suspense>
    </BrowserRouter>
  );
}

export default App;

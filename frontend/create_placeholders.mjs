import fs from 'fs';
import path from 'path';

const pages = [
  'admin/AdminDashboard.tsx',
  'admin/AdminAccessRequests.tsx',
  'admin/AdminUsers.tsx',
  'admin/AdminOrgs.tsx',
  'admin/AdminGroups.tsx',
  'admin/AdminSurveys.tsx',
  'admin/AdminToolLibrary.tsx',
  'admin/AdminAnalytics.tsx',
  'admin/AdminRiskFlags.tsx',
  'admin/AdminAuditLogs.tsx',
  'admin/AdminSettings.tsx',
  
  'org/OrgDashboard.tsx',
  'org/OrgProfile.tsx',
  'org/OrgGroups.tsx',
  'org/OrgMembers.tsx',
  'org/OrgSurveys.tsx',
  'org/OrgAnalytics.tsx',
  'org/OrgReports.tsx',
  
  'leader/LeaderDashboard.tsx',
  'leader/LeaderTeam.tsx',
  'leader/LeaderSurveys.tsx',
  'leader/LeaderAnalytics.tsx',
  'leader/ConflictMap.tsx',
  'leader/LeaderAlerts.tsx',
  'leader/LeaderRecommendations.tsx',
  
  'member/MemberDashboard.tsx',
  'member/MemberSurveys.tsx',
  'member/MemberSurveyHistory.tsx',
  'member/MemberResults.tsx',
  'member/MemberTrends.tsx',
  'member/MemberProfile.tsx',
  'member/MemberNotifications.tsx',
  'member/MemberPrivacy.tsx',
  
  'hr/HRDashboard.tsx',
  'hr/HRFlags.tsx',
  'hr/HRCases.tsx',
  'hr/HRInterventions.tsx',
  'hr/HRReports.tsx'
];

const basePath = path.join(process.cwd(), 'src', 'pages');

for (const page of pages) {
  const fullPath = path.join(basePath, page);
  const componentName = path.basename(page, '.tsx');
  const dirPath = path.dirname(fullPath);
  
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  
  if (!fs.existsSync(fullPath)) {
    fs.writeFileSync(fullPath, `import React from 'react';\n\nexport default function ${componentName}() {\n  return (\n    <div className="card">\n      <h1 style={{fontSize: '1.5rem', fontWeight: 600}}>${componentName}</h1>\n      <p style={{color: 'var(--text-muted)', marginTop: '1rem'}}>This module is currently under construction.</p>\n    </div>\n  );\n}\n`);
    console.log(`Created ${page}`);
  }
}

// Ensure the old pages are moved or kept
console.log('Done creating placeholders.');

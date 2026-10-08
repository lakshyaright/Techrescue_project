import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { DataProvider } from './context/DataContext';

// Layouts
import { PublicLayout } from './components/layout/PublicLayout';
import { PortalLayout } from './components/layout/PortalLayout';

// Public Pages
import { Home } from './pages/public/Home';
import { Features } from './pages/public/Features';
import { HowItWorks } from './pages/public/HowItWorks';
import { Pricing } from './pages/public/Pricing';
import { Testimonials } from './pages/public/Testimonials';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Signup } from './pages/auth/Signup';
import { ForgotPassword } from './pages/auth/ForgotPassword';

// Client Pages
import { ClientDashboard } from './pages/client/ClientDashboard';
import { RaiseQuery } from './pages/client/RaiseQuery';
import { QueryDetails } from './pages/client/QueryDetails';
import { QueryHistory } from './pages/client/QueryHistory';
import { RecentActivity } from './pages/client/RecentActivity';
import { AlignExperts } from './pages/client/AlignExperts';
import { FieldEngineers } from './pages/client/FieldEngineers';
import { ClientMessages } from './pages/client/ClientMessages';
import { ClientPayments } from './pages/client/ClientPayments';
import { ClientProfile } from './pages/client/ClientProfile';

// Expert Pages
import { ExpertDashboard } from './pages/expert/ExpertDashboard';
import { ExpertJobs } from './pages/expert/ExpertJobs';
import { ExpertEarnings } from './pages/expert/ExpertEarnings';
import { ExpertProfile } from './pages/expert/ExpertProfile';

// Engineer Pages
import { EngineerDashboard } from './pages/engineer/EngineerDashboard';
import { EngineerJobs } from './pages/engineer/EngineerJobs';
import { EngineerMap } from './pages/engineer/EngineerMap';
import { EngineerEarnings } from './pages/engineer/EngineerEarnings';
import { EngineerProfile } from './pages/engineer/EngineerProfile';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminQueries } from './pages/admin/AdminQueries';
import { AdminPayments } from './pages/admin/AdminPayments';
import { AdminReports } from './pages/admin/AdminReports';
import { AdminAuditLogs } from './pages/admin/AdminAuditLogs';
import { AdminSettings } from './pages/admin/AdminSettings';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <DataProvider>
            <Routes>
              {/* Public Website */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/features" element={<Features />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/testimonials" element={<Testimonials />} />
                <Route path="/auth/login" element={<Login />} />
                <Route path="/auth/signup" element={<Signup />} />
                <Route path="/auth/forgot-password" element={<ForgotPassword />} />
              </Route>

              {/* Portal Workspace (Client, Expert, Engineer, Admin) */}
              <Route element={<PortalLayout />}>
                {/* Client Routes */}
                <Route path="/client/dashboard" element={<ClientDashboard />} />
                <Route path="/client/raise-query" element={<RaiseQuery />} />
                <Route path="/client/query/:id" element={<QueryDetails />} />
                <Route path="/client/history" element={<QueryHistory />} />
                <Route path="/client/activity" element={<RecentActivity />} />
                <Route path="/client/experts" element={<AlignExperts />} />
                <Route path="/client/engineers" element={<FieldEngineers />} />
                <Route path="/client/messages" element={<ClientMessages />} />
                <Route path="/client/payments" element={<ClientPayments />} />
                <Route path="/client/profile" element={<ClientProfile />} />

                {/* Expert Routes */}
                <Route path="/expert/dashboard" element={<ExpertDashboard />} />
                <Route path="/expert/jobs" element={<ExpertJobs />} />
                <Route path="/expert/messages" element={<ClientMessages />} />
                <Route path="/expert/earnings" element={<ExpertEarnings />} />
                <Route path="/expert/profile" element={<ExpertProfile />} />

                {/* Field Engineer Routes */}
                <Route path="/engineer/dashboard" element={<EngineerDashboard />} />
                <Route path="/engineer/jobs" element={<EngineerJobs />} />
                <Route path="/engineer/map" element={<EngineerMap />} />
                <Route path="/engineer/messages" element={<ClientMessages />} />
                <Route path="/engineer/earnings" element={<EngineerEarnings />} />
                <Route path="/engineer/profile" element={<EngineerProfile />} />

                {/* Admin Routes */}
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/queries" element={<AdminQueries />} />
                <Route path="/admin/payments" element={<AdminPayments />} />
                <Route path="/admin/reports" element={<AdminReports />} />
                <Route path="/admin/audit" element={<AdminAuditLogs />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </DataProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

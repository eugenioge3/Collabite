import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import DashboardRedirect from './pages/DashboardRedirect';
import InfluencerDashboard from './pages/influencer/Dashboard';
import InfluencerProfile from './pages/influencer/Profile';
import InfluencerApplications from './pages/influencer/Applications';
import BusinessDashboard from './pages/business/Dashboard';
import BusinessProfile from './pages/business/Profile';
import BusinessCampaigns from './pages/business/Campaigns';
import CreateCampaign from './pages/business/CreateCampaign';
import EditCampaign from './pages/business/EditCampaign';
import CampaignDetail from './pages/business/CampaignDetail';
import InfluencerRankingsPrivate from './pages/business/InfluencerRankings';
import CampaignsPublic from './pages/Campaigns';
import CampaignPublicDetail from './pages/CampaignDetail';
import Rankings from './pages/Rankings';
import VerifySocial from './pages/VerifySocial';
import AdminVerifications from './pages/AdminVerifications';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/campaigns" element={<CampaignsPublic />} />
            <Route path="/campaigns/:id" element={<CampaignPublicDetail />} />
            <Route path="/rankings" element={<Rankings />} />

            {/* Auth redirect */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardRedirect />
                </ProtectedRoute>
              }
            />

            {/* Influencer */}
            <Route
              path="/dashboard/influencer"
              element={<ProtectedRoute role="influencer"><InfluencerDashboard /></ProtectedRoute>}
            />
            <Route
              path="/dashboard/influencer/profile"
              element={<ProtectedRoute role="influencer"><InfluencerProfile /></ProtectedRoute>}
            />
            <Route
              path="/dashboard/influencer/applications"
              element={<ProtectedRoute role="influencer"><InfluencerApplications /></ProtectedRoute>}
            />
            <Route
              path="/dashboard/influencer/verify"
              element={<ProtectedRoute role="influencer"><VerifySocial /></ProtectedRoute>}
            />

            {/* Business */}
            <Route
              path="/dashboard/business"
              element={<ProtectedRoute role="business"><BusinessDashboard /></ProtectedRoute>}
            />
            <Route
              path="/dashboard/business/profile"
              element={<ProtectedRoute role="business"><BusinessProfile /></ProtectedRoute>}
            />
            <Route
              path="/dashboard/business/campaigns"
              element={<ProtectedRoute role="business"><BusinessCampaigns /></ProtectedRoute>}
            />
            <Route
              path="/dashboard/business/campaigns/new"
              element={<ProtectedRoute role="business"><CreateCampaign /></ProtectedRoute>}
            />
            <Route
              path="/dashboard/business/campaigns/:id/edit"
              element={<ProtectedRoute role="business"><EditCampaign /></ProtectedRoute>}
            />
            <Route
              path="/dashboard/business/campaigns/:id"
              element={<ProtectedRoute role="business"><CampaignDetail /></ProtectedRoute>}
            />
            <Route
              path="/dashboard/business/rankings"
              element={<ProtectedRoute role="business"><InfluencerRankingsPrivate /></ProtectedRoute>}
            />
            <Route
              path="/dashboard/business/verify"
              element={<ProtectedRoute role="business"><VerifySocial /></ProtectedRoute>}
            />

            {/* Internal ops */}
            <Route
              path="/ops/verifications"
              element={<AdminVerifications />}
            />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

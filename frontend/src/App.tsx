import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardRedirect from './pages/DashboardRedirect';
import InfluencerDashboard from './pages/influencer/Dashboard';
import InfluencerProfile from './pages/influencer/Profile';
import InfluencerApplications from './pages/influencer/Applications';
import BusinessDashboard from './pages/business/Dashboard';
import BusinessProfile from './pages/business/Profile';
import BusinessCampaigns from './pages/business/Campaigns';
import CreateCampaign from './pages/business/CreateCampaign';
import CampaignDetail from './pages/business/CampaignDetail';
import CampaignsPublic from './pages/Campaigns';
import CampaignPublicDetail from './pages/CampaignDetail';
import Rankings from './pages/Rankings';

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
              element={<ProtectedRoute requiredRole="influencer"><InfluencerDashboard /></ProtectedRoute>}
            />
            <Route
              path="/dashboard/influencer/profile"
              element={<ProtectedRoute requiredRole="influencer"><InfluencerProfile /></ProtectedRoute>}
            />
            <Route
              path="/dashboard/influencer/applications"
              element={<ProtectedRoute requiredRole="influencer"><InfluencerApplications /></ProtectedRoute>}
            />

            {/* Business */}
            <Route
              path="/dashboard/business"
              element={<ProtectedRoute requiredRole="business"><BusinessDashboard /></ProtectedRoute>}
            />
            <Route
              path="/dashboard/business/profile"
              element={<ProtectedRoute requiredRole="business"><BusinessProfile /></ProtectedRoute>}
            />
            <Route
              path="/dashboard/business/campaigns"
              element={<ProtectedRoute requiredRole="business"><BusinessCampaigns /></ProtectedRoute>}
            />
            <Route
              path="/dashboard/business/campaigns/new"
              element={<ProtectedRoute requiredRole="business"><CreateCampaign /></ProtectedRoute>}
            />
            <Route
              path="/dashboard/business/campaigns/:id"
              element={<ProtectedRoute requiredRole="business"><CampaignDetail /></ProtectedRoute>}
            />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

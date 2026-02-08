import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GalaxyBackground from './components/three/GalaxyBackground';
import EarthWaves from './components/three/EarthWaves';
import GooeyNavbar from './components/layout/GooeyNavbar';
import VoiceFloatingButton from './components/layout/VoiceFloatingButton';
import OfflineIndicator from './components/features/OfflineIndicator';
import ErrorBoundary from './components/ErrorBoundary';
import LandingPage from './pages/LandingPage';
import ModernLandingPage from './pages/ModernLandingPage';
import EnhancedLandingPage from './pages/EnhancedLandingPage';
import ModernFeatures from './pages/ModernFeatures';
import AuthPage from './pages/AuthPage';
import FaceAuth from './pages/FaceAuth';
import FarmerDashboard from './pages/FarmerDashboard';
import ModernFarmerDashboard from './pages/ModernFarmerDashboard';
import EquipmentAnalyzer from './pages/EquipmentAnalyzer';
import MarkMyLand from './components/MarkMyLand/MarkMyLand';
import CropHealthDashboard from './components/CropHealth/Dashboard';
import CropHealthModern from './pages/CropHealthModern';
import InsuranceForm from './components/CropHealth/InsuranceForm';
import FarmDashboard from './components/Feature3/FarmDashboard';
import TrustReport from './components/Feature3/TrustReport';
import CropRecommendation from './components/features/CropRecommendation/CropRecommendation';
import FarmerNews from './components/features/DisasterNews/DisasterNews';
import SchemesPage from './pages/SchemesPage';
import Marketplace from './pages/Marketplace';
import ModernMarketplace from './pages/ModernMarketplace';
import FarmerInventory from './pages/FarmerInventory';
import ModernInventory from './pages/ModernInventory';
import AddBatch from './pages/AddBatch';
import ProductTransparency from './pages/ProductTransparency';
import ClaimApplication from './pages/ClaimApplication';
import FarmerProfile from './pages/FarmerProfile';
import ModernProfile from './pages/ModernProfile';
import ProtectedRoute from './components/ProtectedRoute';

// Admin Imports
import AdminLayout from './admin/layout/AdminLayout';
import AdminDashboard from './admin/pages/AdminDashboard';
import Claims from './admin/pages/Claims';
import ClaimDetail from './admin/pages/ClaimDetail';
import FieldAssignments from './admin/pages/FieldAssignments';
import Broadcast from './admin/pages/Broadcast';
import AdminSchemes from './admin/pages/AdminSchemes';
import AdminReports from './admin/pages/AdminReports';

import { useThemeStore } from './store/themeStore';
import PageIntroHandler from './components/layout/PageIntroHandler';

function App() {
  const theme = useThemeStore((state) => state.theme);

  React.useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <ErrorBoundary>
      <Router>
        <PageIntroHandler />
        <main className={`relative min-h-screen font-sans transition-colors duration-500`}>
          {/* Global Background - Removed for Gov Theme */}
          {/* <ErrorBoundary>
            <GalaxyBackground />
          </ErrorBoundary> */}

          {/* Global Navigation */}
          <ErrorBoundary>
            <GooeyNavbar />
          </ErrorBoundary>

          <OfflineIndicator />

      {/* Routes */}
      <Routes>
        <Route path="/" element={<ErrorBoundary><LandingPage /></ErrorBoundary>} />
        <Route path="/enhanced" element={<ErrorBoundary><EnhancedLandingPage /></ErrorBoundary>} />
        <Route path="/modern" element={<ErrorBoundary><ModernLandingPage /></ErrorBoundary>} />
        <Route path="/landing" element={<ErrorBoundary><LandingPage /></ErrorBoundary>} />
        {/* Authentication */}
        <Route path="/auth-face" element={<ErrorBoundary><FaceAuth /></ErrorBoundary>} />
        <Route path="/auth" element={<ErrorBoundary><AuthPage /></ErrorBoundary>} />

        {/* Protected Routes - Farmer/User scope */}
        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['farmer', 'user']}><ErrorBoundary><FarmerDashboard /></ErrorBoundary></ProtectedRoute>} />
        <Route path="/dashboard-modern" element={<ProtectedRoute allowedRoles={['farmer', 'user']}><ErrorBoundary><ModernFarmerDashboard /></ErrorBoundary></ProtectedRoute>} />
        <Route path="/equipment" element={<ProtectedRoute allowedRoles={['farmer', 'user']}><ErrorBoundary><EquipmentAnalyzer /></ErrorBoundary></ProtectedRoute>} />
        <Route path="/mark-my-land" element={<ProtectedRoute allowedRoles={['farmer', 'user']}><ErrorBoundary><MarkMyLand /></ErrorBoundary></ProtectedRoute>} />
        <Route path="/crop-health" element={<ProtectedRoute allowedRoles={['farmer', 'user']}><ErrorBoundary><CropHealthDashboard /></ErrorBoundary></ProtectedRoute>} />
        <Route path="/crop-health-modern" element={<ProtectedRoute allowedRoles={['farmer', 'user']}><ErrorBoundary><CropHealthModern /></ErrorBoundary></ProtectedRoute>} />
        <Route path="/insurance-claim" element={<ProtectedRoute allowedRoles={['farmer', 'user']}><ErrorBoundary><InsuranceForm /></ErrorBoundary></ProtectedRoute>} />
        <Route path="/apply-claim" element={<ProtectedRoute allowedRoles={['farmer', 'user']}><ErrorBoundary><ClaimApplication /></ErrorBoundary></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute allowedRoles={['farmer', 'user']}><ErrorBoundary><FarmerProfile /></ErrorBoundary></ProtectedRoute>} />
        <Route path="/profile-modern" element={<ProtectedRoute allowedRoles={['farmer', 'user']}><ErrorBoundary><ModernProfile /></ErrorBoundary></ProtectedRoute>} />



        {/* Feature 3: Autonomous Farm */}
        <Route path="/autonomous-farm" element={<ProtectedRoute allowedRoles={['farmer', 'user', 'admin']}><ErrorBoundary><FarmDashboard /></ErrorBoundary></ProtectedRoute>} />
        <Route path="/trust-report/:batchId" element={<ErrorBoundary><TrustReport /></ErrorBoundary>} />

        {/* Feature 4: Smart Crop Recommender */}
        <Route path="/crop-recommendation" element={<ProtectedRoute allowedRoles={['farmer', 'user', 'admin']}><ErrorBoundary><CropRecommendation /></ErrorBoundary></ProtectedRoute>} />
        <Route path="/disaster-news" element={<ProtectedRoute allowedRoles={['farmer', 'user', 'admin']}><ErrorBoundary><FarmerNews /></ErrorBoundary></ProtectedRoute>} />

        {/* Feature 4: Schemes Agent */}
        <Route path="/schemes-assistant" element={<ProtectedRoute allowedRoles={['farmer', 'user', 'admin']}><ErrorBoundary><SchemesPage /></ErrorBoundary></ProtectedRoute>} />

        {/* Feature 6: Improved Inventory & Marketplace System */}
        <Route path="/inventory" element={<ProtectedRoute allowedRoles={['farmer', 'user', 'admin']}><ErrorBoundary><FarmerInventory /></ErrorBoundary></ProtectedRoute>} />
        <Route path="/inventory-modern" element={<ProtectedRoute allowedRoles={['farmer', 'user', 'admin']}><ErrorBoundary><ModernInventory /></ErrorBoundary></ProtectedRoute>} />
        <Route path="/add-batch" element={<ProtectedRoute allowedRoles={['farmer', 'user', 'admin']}><ErrorBoundary><AddBatch /></ErrorBoundary></ProtectedRoute>} />
        <Route path="/marketplace" element={<ErrorBoundary><Marketplace /></ErrorBoundary>} />
        <Route path="/marketplace-modern" element={<ErrorBoundary><ModernMarketplace /></ErrorBoundary>} />
        <Route path="/product-transparency/:batchId" element={<ErrorBoundary><ProductTransparency /></ErrorBoundary>} />

        {/* Admin Routes - Strict Restricted scope */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="claims" element={<Claims />} />
          <Route path="claims/:id" element={<ClaimDetail />} />
          <Route path="assignments" element={<FieldAssignments />} />
          <Route path="broadcasts" element={<Broadcast />} />
          <Route path="schemes" element={<AdminSchemes />} />
          <Route path="reports" element={<AdminReports />} />
        </Route>

        {/* Placeholder routes */}
        {/* Python Backend & Feature 5 Placeholders */}
        <Route path="/features" element={<div className="pt-32 text-center text-2xl">Features Coming Soon</div>} />
        <Route path="/features-modern" element={<ErrorBoundary><ModernFeatures /></ErrorBoundary>} />

            {/* Teammate Showcase Route */}
            <Route path="/showcase/waves" element={
              <ErrorBoundary>
                <div className="w-full h-screen relative">
                  <div className="absolute top-24 left-0 w-full text-center z-10 pointer-events-none">
                    <h1 className="text-4xl font-bold text-white drop-shadow-lg">Original Waves Design</h1>
                    <p className="text-gray-300">For Team Review</p>
                  </div>
                  <EarthWaves mode="hero" />
                </div>
              </ErrorBoundary>
            } />
          </Routes>

          {/* Global Voice Assistant */}
          <ErrorBoundary>
            <VoiceFloatingButton />
          </ErrorBoundary>
        </main>
      </Router>
    </ErrorBoundary>
  );
}

export default App;

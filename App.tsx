
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PlannerProvider } from './contexts/PlannerContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import Mascot from './components/Mascot';
import DataConsentBanner from './components/DataConsentBanner';

// Pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import TouristSpotsPage from './pages/TouristSpotsPage';
import VisitorInfoPage from './pages/VisitorInfoPage';
import BlogPage from './pages/BlogPage';
import EventsPage from './pages/EventsPage';
import AdminPage from './pages/AdminPage';
import EmergencyPage from './pages/EmergencyPage';
import NormsPage from './pages/NormsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';

const AppContent: React.FC = () => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      {!isAdminPage && <Header />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/tourist-spots" element={<TouristSpotsPage />} />
          <Route path="/visitor-info" element={<VisitorInfoPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/emergency" element={<EmergencyPage />} />
          <Route path="/norms" element={<NormsPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
        </Routes>
      </main>
      {!isAdminPage && <Footer />}
      {!isAdminPage && <Chatbot />}
      {!isAdminPage && <Mascot />}
      {!isAdminPage && <DataConsentBanner />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <PlannerProvider>
        <Router>
          <AppContent />
        </Router>
      </PlannerProvider>
    </AuthProvider>
  );
};

export default App;

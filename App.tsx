
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PlannerProvider } from './contexts/PlannerContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import DataConsentBanner from './components/DataConsentBanner';

// Pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import TouristSpotsPage from './pages/TouristSpotsPage';
import VisitorInfoPage from './pages/VisitorInfoPage';
import BlogPage from './pages/BlogPage';
import AdminPage from './pages/AdminPage';
import EmergencyPage from './pages/EmergencyPage';
import NormsPage from './pages/NormsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <PlannerProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/tourist-spots" element={<TouristSpotsPage />} />
                <Route path="/visitor-info" element={<VisitorInfoPage />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/emergency" element={<EmergencyPage />} />
                <Route path="/norms" element={<NormsPage />} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
              </Routes>
            </main>
            <Footer />
            <Chatbot />
            <DataConsentBanner />
          </div>
        </Router>
      </PlannerProvider>
    </AuthProvider>
  );
};

export default App;

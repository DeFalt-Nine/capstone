
import React from 'react';
import { HashRouter, Route, Routes, useLocation } from 'react-router-dom';

import Header from './components/Header';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import DataConsentBanner from './components/DataConsentBanner';

import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import TouristSpotsPage from './pages/TouristSpotsPage';
import VisitorInfoPage from './pages/VisitorInfoPage';
import BlogPage from './pages/BlogPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import AdminPage from './pages/AdminPage'; // Import AdminPage

import { AuthProvider } from './contexts/AuthContext';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
          <AppContent />
      </HashRouter>
    </AuthProvider>
  );
};

const AppContent: React.FC = () => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen">
      {!isAdminPage && <Header />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/tourist-spots" element={<TouristSpotsPage />} />
          <Route path="/visitor-info" element={<VisitorInfoPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>
      {!isAdminPage && <Footer />}
      {!isAdminPage && <Chatbot />}
      {!isAdminPage && <DataConsentBanner />}
    </div>
  );
};

export default App;


import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const DataConsentBanner: React.FC = () => {
  // We track if the user has made a choice (or if we should just treat it as 'no choice yet')
  // Initializing based on localStorage ensures we know the status immediately.
  const [hasMadeChoice, setHasMadeChoice] = useState(() => {
    return !!localStorage.getItem('dataConsentStatus');
  });
  
  const location = useLocation();

  const handleConsent = (consent: 'accepted' | 'declined') => {
    localStorage.setItem('dataConsentStatus', consent);
    setHasMadeChoice(true);
  };

  // Determine visibility:
  // 1. If user has already chosen, never show.
  // 2. If user is on Privacy Policy page, hide it temporarily so they can read.
  const isPrivacyPage = location.pathname === '/privacy-policy';
  const shouldShow = !hasMadeChoice && !isPrivacyPage;

  // Handle body scroll locking
  useEffect(() => {
    if (shouldShow) {
      document.body.style.overflow = 'hidden'; // Lock scroll
    } else {
      document.body.style.overflow = 'auto'; // Unlock scroll
    }

    // Cleanup to ensure scroll is always restored if component unmounts
    return () => {
        document.body.style.overflow = 'auto';
    };
  }, [shouldShow]);

  if (!shouldShow) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 md:p-8 text-center animate-slide-up border border-slate-200">
        <div className="mb-4">
            <div className="w-16 h-16 bg-lt-yellow/20 rounded-full flex items-center justify-center mx-auto">
                <i className="fas fa-cookie-bite text-3xl text-lt-orange"></i>
            </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-3">Your Privacy Matters</h2>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          We use anonymized data from your interactions to improve our services and identify popular attractions. This helps us make the website better for everyone. By clicking "Accept", you agree to our data practices. Learn more in our{' '}
          <Link to="/privacy-policy" className="font-bold text-lt-orange hover:underline hover:text-lt-red transition-colors">
            Privacy Policy
          </Link>.
        </p>
        <div className="flex flex-col sm:flex-row-reverse items-center justify-center gap-3">
          <button
            onClick={() => handleConsent('accepted')}
            className="w-full sm:w-auto px-6 py-3 text-sm font-bold text-slate-900 bg-lt-yellow border border-transparent rounded-xl shadow-md hover:bg-lt-orange hover:text-white focus:outline-none focus:ring-4 focus:ring-lt-yellow/50 transition-all transform hover:-translate-y-0.5"
          >
            Accept
          </button>
          <button
            onClick={() => handleConsent('declined')}
            className="w-full sm:w-auto px-6 py-3 text-sm font-medium text-slate-600 bg-slate-100 border border-slate-200 rounded-xl hover:bg-slate-200 focus:outline-none focus:ring-4 focus:ring-slate-200 transition-all"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataConsentBanner;


import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { subscribeToNewsletter } from '../services/apiService';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubscribe = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email) return;
      
      setStatus('loading');
      try {
          await subscribeToNewsletter(email);
          setStatus('success');
          setEmail('');
          setTimeout(() => setStatus('idle'), 3000);
      } catch (err) {
          setStatus('error');
          setTimeout(() => setStatus('idle'), 3000);
      }
  };

  return (
    <footer className="bg-lt-blue text-white border-t border-white/10">
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="footer-col">
            <div className="flex items-center gap-3 mb-4">
              <img 
                src="/Limitless La Trinidad.svg" 
                alt="Limitless La Trinidad Logo" 
                className="w-20 h-20 object-contain brightness-0 invert"
              />
              <span className="text-xl font-bold">Limitless La Trinidad</span>
            </div>
            <p className="text-white/90 text-sm mb-4">
              Discover the strawberry capital of the Philippines. Experience mountain beauty, rich culture, and warm hospitality.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-white/80 hover:text-lt-yellow transition-colors"><i className="fab fa-facebook fa-lg"></i></a>
              <a href="#" className="text-white/80 hover:text-lt-yellow transition-colors"><i className="fab fa-instagram fa-lg"></i></a>
              <a href="#" className="text-white/80 hover:text-lt-yellow transition-colors"><i className="fab fa-twitter fa-lg"></i></a>
            </div>
          </div>

          <div className="footer-col">
            <h3 className="text-lg font-semibold mb-4 text-lt-yellow">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-white/80 hover:text-white hover:underline transition-colors text-sm hover:pl-1 transition-all">Home</Link></li>
              <li><Link to="/about" className="text-white/80 hover:text-white hover:underline transition-colors text-sm hover:pl-1 transition-all">About Us</Link></li>
              <li><Link to="/tourist-spots" className="text-white/80 hover:text-white hover:underline transition-colors text-sm hover:pl-1 transition-all">Tourist Spots</Link></li>
              <li><Link to="/visitor-info" className="text-white/80 hover:text-white hover:underline transition-colors text-sm hover:pl-1 transition-all">Visitor Info</Link></li>
              <li><Link to="/blog" className="text-white/80 hover:text-white hover:underline transition-colors text-sm hover:pl-1 transition-all">Blog</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h3 className="text-lg font-semibold mb-4 text-lt-yellow">Newsletter</h3>
            <p className="text-sm text-white/80 mb-4">Get the latest updates on festivals and travel tips.</p>
            <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="flex">
                    <input 
                        type="email" 
                        placeholder="Your email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={status === 'loading' || status === 'success'}
                        className="w-full px-3 py-2 rounded-l-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-lt-yellow"
                    />
                    <button 
                        type="submit" 
                        disabled={status === 'loading' || status === 'success'}
                        className="bg-lt-yellow text-slate-900 px-4 py-2 rounded-r-lg font-bold hover:bg-lt-orange hover:text-white transition-colors disabled:opacity-70"
                    >
                        {status === 'loading' ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-paper-plane"></i>}
                    </button>
                </div>
                {status === 'success' && <p className="text-xs text-green-300 font-bold"><i className="fas fa-check mr-1"></i> Subscribed!</p>}
                {status === 'error' && <p className="text-xs text-red-300 font-bold"><i className="fas fa-times mr-1"></i> Failed. Try again.</p>}
            </form>
          </div>

          <div className="footer-col">
            <h3 className="text-lg font-semibold mb-4 text-lt-yellow">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-white/80 hover:text-white hover:underline transition-colors">Travel Guide (PDF)</a></li>
              <li><a href="#" className="text-white/80 hover:text-white hover:underline transition-colors">Accommodation</a></li>
              <li><Link to="/visitor-info" className="text-white/80 hover:text-white hover:underline transition-colors">Emergency Numbers</Link></li>
              <li><Link to="/privacy-policy" className="text-white/80 hover:text-white hover:underline transition-colors text-sm">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8 text-center text-sm text-white/70">
          <p>© {currentYear} Limitless La Trinidad. Made with <i className="fas fa-heart text-lt-red mx-1"></i> for promoting sustainable tourism.</p>
          <div className="mt-2 text-xs opacity-80 flex justify-center gap-4">
            <p>Disclaimer: This is a tourism information website.</p>
            <Link to="/admin" className="opacity-50 hover:opacity-100 hover:text-lt-yellow transition-opacity">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

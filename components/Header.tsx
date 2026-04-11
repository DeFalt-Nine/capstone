
import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { NAV_LINKS } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import UserDashboardModal from './UserDashboardModal';

const Header: React.FC = () => {
  const { user, signOut, getDisplayName } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const location = useLocation();
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menu when location changes
  useEffect(() => {
    // This is handled by NavLink clicks now to avoid cascading renders
  }, [location.pathname]);

  const baseHeaderClass = "fixed top-0 left-0 right-0 z-50 transition-all duration-300";
  // Light mode scrolled state
  const scrolledHeaderClass = "bg-white/90 backdrop-blur-md shadow-md border-b border-slate-200 text-slate-800";
  // Top state (transparent on home, white on others)
  const topHeaderClass = location.pathname === '/' 
    ? "bg-transparent text-white" 
    : "bg-white shadow-sm text-slate-800 border-b border-slate-100";

  const headerClass = isScrolled || location.pathname !== '/' ? `${baseHeaderClass} ${scrolledHeaderClass}` : `${baseHeaderClass} ${topHeaderClass}`;

  const navLinkClass = ({ isActive }: { isActive: boolean }) => {
    const isHomeTop = location.pathname === '/' && !isScrolled;
    
    return `px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
      isActive
        ? 'bg-lt-yellow text-slate-900 shadow-md shadow-lt-yellow/30'
        : isHomeTop 
            ? 'hover:bg-white/20 hover:text-white text-white/90' 
            : 'hover:bg-slate-100 hover:text-lt-orange text-slate-600'
    }`;
  };
    
  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200 ${
      isActive
        ? 'bg-lt-yellow text-slate-900 shadow-sm'
        : 'text-slate-600 hover:bg-slate-100 hover:text-lt-orange'
    }`;


  return (
    <header className={headerClass}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <NavLink to="/" className="flex-shrink-0 flex items-center gap-3 group">
              <i className={`fas fa-mountain text-3xl transition-colors drop-shadow-sm ${location.pathname === '/' && !isScrolled ? 'text-lt-yellow' : 'text-lt-blue'}`}></i>
              <div>
                 <h1 className={`text-xl font-bold tracking-tight transition-colors ${location.pathname === '/' && !isScrolled ? 'text-white group-hover:text-lt-yellow' : 'text-slate-800 group-hover:text-lt-orange'}`}>Visit La Trinidad</h1>
                 <p className={`text-xs font-light font-semibold ${location.pathname === '/' && !isScrolled ? 'text-white/80' : 'text-lt-blue'}`}>Benguet, Philippines</p>
              </div>
            </NavLink>
          </div>
          
          <nav className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              {NAV_LINKS.map((link) => (
                <NavLink key={link.name} to={link.path} className={navLinkClass}>
                  {link.name}
                </NavLink>
              ))}

              {/* User Profile */}
              {user ? (
                <div className="relative ml-4" ref={profileRef}>
                  <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 p-1 rounded-full hover:bg-black/5 transition-all"
                  >
                    <img 
                      src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(getDisplayName())}`} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full border border-white/20 shadow-sm"
                    />
                    <i className={`fas fa-chevron-down text-[10px] transition-transform ${isProfileOpen ? 'rotate-180' : ''}`}></i>
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 animate-fade-in z-[60]">
                      <div className="px-4 py-3 border-b border-slate-50">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Signed in as</p>
                        <p className="text-sm font-bold text-slate-800 truncate">{getDisplayName()}</p>
                        <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                      </div>
                      
                      <button 
                        onClick={() => {
                          setIsDashboardOpen(true);
                          setIsProfileOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-lt-orange flex items-center gap-3 transition-colors"
                      >
                        <i className="fas fa-th-large w-4"></i> My Dashboard
                      </button>
                      
                      <button 
                        onClick={() => {
                          signOut();
                          setIsProfileOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-lt-red hover:bg-red-50 flex items-center gap-3 transition-colors"
                      >
                        <i className="fas fa-sign-out-alt w-4"></i> Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button 
                  onClick={() => {
                    // We can't easily trigger the login modal from here without passing props or using a global state
                    // But we can redirect to a page that has it or just show a message
                    // For now, let's just show the login button if they are on a page that needs it
                  }}
                  className="hidden"
                >
                  Login
                </button>
              )}
            </div>
          </nav>
          
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`inline-flex items-center justify-center p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-lt-yellow ${location.pathname === '/' && !isScrolled ? 'text-white hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'} text-2xl`}></i>
            </button>
          </div>
        </div>
      </div>
      
      {isMenuOpen && (
        <nav className="md:hidden bg-white border-t border-slate-100 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {user && (
              <div className="px-4 py-3 mb-2 bg-slate-50 rounded-lg flex items-center gap-3">
                <img 
                  src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(getDisplayName())}`} 
                  alt="" 
                  className="w-10 h-10 rounded-full border border-slate-200"
                />
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-slate-800 truncate">{getDisplayName()}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
              </div>
            )}
            {NAV_LINKS.map((link) => (
              <NavLink key={link.name} to={link.path} className={mobileNavLinkClass} onClick={() => setIsMenuOpen(false)}>
                {link.name}
              </NavLink>
            ))}
            {user && (
              <>
                <button 
                  onClick={() => {
                    setIsDashboardOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-base font-medium text-slate-600 hover:bg-slate-100 flex items-center gap-3"
                >
                  <i className="fas fa-th-large"></i> My Dashboard
                </button>
                <button 
                  onClick={() => {
                    signOut();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-base font-medium text-lt-red hover:bg-red-50 flex items-center gap-3"
                >
                  <i className="fas fa-sign-out-alt"></i> Logout
                </button>
              </>
            )}
          </div>
        </nav>
      )}

      {isDashboardOpen && <UserDashboardModal onClose={() => setIsDashboardOpen(false)} />}
    </header>
  );
};

export default Header;

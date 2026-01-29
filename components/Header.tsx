
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { NAV_LINKS } from '../constants';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

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
            <div className="ml-10 flex items-baseline space-x-4">
              {NAV_LINKS.map((link) => (
                <NavLink key={link.name} to={link.path} className={navLinkClass}>
                  {link.name}
                </NavLink>
              ))}
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
            {NAV_LINKS.map((link) => (
              <NavLink key={link.name} to={link.path} className={mobileNavLinkClass}>
                {link.name}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;

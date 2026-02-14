import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import logo from '../Assets/logo.png';
import { useAuth } from '../context/AuthContext';

const navLinkClass = ({ isActive }) =>
  `font-sans text-sm font-semibold px-3 py-2 border-b-[3px] transition-colors block ${
    isActive
      ? 'text-[#6E43B9] border-[#6E43B9]'
      : 'text-[#6C737F] border-transparent hover:text-[#6E43B9]'
  }`;

const SCROLL_UP_THRESHOLD = 10;
const TOP_THRESHOLD = 80;

const Header = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = useCallback(() => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    if (!clientId || !window.google) {
      console.error('Google client not loaded or REACT_APP_GOOGLE_CLIENT_ID missing');
      return;
    }

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response) => {
        try {
          await loginWithGoogle(response.credential);
          navigate('/dashboard/all-reviewers');
        } catch (err) {
          console.error('Google login failed:', err);
        }
      },
    });

    // Use popup mode
    window.google.accounts.id.prompt();
  }, [loginWithGoogle, navigate]);

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY ?? window.pageYOffset;
      if (current <= TOP_THRESHOLD) {
        setHeaderVisible(true);
      } else if (current < lastScrollY.current - SCROLL_UP_THRESHOLD) {
        setHeaderVisible(true);
      } else if (current > lastScrollY.current) {
        setHeaderVisible(false);
      }
      lastScrollY.current = current;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-100 transition-transform duration-300 ease-out ${
          headerVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-3 py-2 sm:px-6 md:py-0 lg:px-8">
          <div className="flex justify-between items-center h-14 md:h-[104px]">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img src={logo} alt="Reviewly" width={150} height={56} className="h-9 w-auto max-w-[110px] object-contain md:h-[56px] md:w-[150px] md:max-w-none" />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <NavLink to="/pricing" className={navLinkClass}>Pricing</NavLink>
              <NavLink to="/faq" className={navLinkClass}>FAQ</NavLink>
              <NavLink to="/contact" className={navLinkClass}>Contact Us</NavLink>
            </nav>

            {/* Desktop Login + Mobile Burger */}
            <div className="flex items-center gap-4">
              <button onClick={handleGoogleLogin} className="hidden md:flex items-center justify-center space-x-2 w-[157px] h-[52px] border-2 border-[#6137A8] rounded-lg hover:border-purple-700 transition-colors">
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="text-base font-medium tracking-[0.5px] text-[#6137A8]" style={{ fontFamily: 'Roboto, sans-serif' }}>Login</span>
              </button>

              {/* Burger button - mobile only */}
              <button
                type="button"
                aria-label="Open menu"
                onClick={() => setDrawerOpen(true)}
                className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Backdrop - mobile drawer overlay (outside header so drawer is always visible) */}
      <div
        role="presentation"
        onClick={() => setDrawerOpen(false)}
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ease-out md:hidden ${
          drawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      {/* Drawer - slides in from right; solid opaque background so not transparent on mobile */}
      <div
        className={`fixed top-0 right-0 h-full w-[280px] max-w-[85vw] z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-out md:hidden ${
          drawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ backgroundColor: '#ffffff' }}
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className="flex justify-between items-center h-14 px-6 border-b border-gray-100 bg-white">
          <span className="text-lg font-semibold text-gray-900">Menu</span>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex flex-col p-6 gap-1 bg-white">
          <NavLink to="/pricing" className={navLinkClass} onClick={() => setDrawerOpen(false)}>Pricing</NavLink>
          <NavLink to="/faq" className={navLinkClass} onClick={() => setDrawerOpen(false)}>FAQ</NavLink>
          <NavLink to="/contact" className={navLinkClass} onClick={() => setDrawerOpen(false)}>Contact Us</NavLink>
        </nav>
        <div className="p-6 mt-auto border-t border-gray-100 bg-white">
          <button onClick={handleGoogleLogin} className="flex items-center justify-center space-x-2 w-full h-[52px] border-2 border-[#6137A8] rounded-lg hover:border-purple-700 transition-colors">
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span className="text-base font-medium tracking-[0.5px] text-[#6137A8]" style={{ fontFamily: 'Roboto, sans-serif' }}>Login</span>
          </button>
        </div>
      </div>

      {/* Spacer so content doesn't jump when header is fixed */}
      <div className="h-[72px] md:h-[104px] w-full" aria-hidden="true" />
    </>
  );
};

export default Header;

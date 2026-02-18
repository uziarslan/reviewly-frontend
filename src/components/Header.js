import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import GoogleAuthButton from './GoogleAuthButton';
import logo from '../Assets/logo.png';

const navLinkClass = ({ isActive }) =>
  `font-sans text-sm font-semibold px-3 py-2 border-b-[3px] transition-colors block ${isActive
    ? 'text-[#6E43B9] border-[#6E43B9]'
    : 'text-[#6C737F] border-transparent hover:text-[#6E43B9]'
  }`;

const SCROLL_UP_THRESHOLD = 10;
const TOP_THRESHOLD = 80;

const Header = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);

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
        className={`fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-100 transition-transform duration-300 ease-out ${headerVisible ? 'translate-y-0' : '-translate-y-full'
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

            {/* Desktop Login: Google button in wrapper with our styling only */}
            <GoogleAuthButton
              variant="withGoogleIcon"
              label="Login"
              redirectTo="/dashboard/all-reviewers"
              className="hidden md:flex items-center justify-center space-x-2 w-[157px] h-[52px] bg-white border-2 border-[#6137A8] rounded-lg hover:border-purple-700 transition-colors"
            />

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
      </header>

      {/* Backdrop - mobile drawer overlay (outside header so drawer is always visible) */}
      <div
        role="presentation"
        onClick={() => setDrawerOpen(false)}
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ease-out md:hidden ${drawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        aria-hidden="true"
      />

      {/* Drawer - slides in from right; solid opaque background so not transparent on mobile */}
      <div
        className={`fixed top-0 right-0 h-full w-[280px] max-w-[85vw] z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-out md:hidden ${drawerOpen ? 'translate-x-0' : 'translate-x-full'
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
        <div className="p-6 mt-auto border-t border-gray-100 bg-white flex justify-center w-full">
          <GoogleAuthButton
            variant="withGoogleIcon"
            label="Login"
            redirectTo="/dashboard/all-reviewers"
            className="flex items-center justify-center space-x-2 w-full h-[52px] bg-white border-2 border-[#6137A8] rounded-lg hover:border-purple-700 transition-colors"
          />
        </div>
      </div>

      {/* Spacer so content doesn't jump when header is fixed */}
      <div className="h-[72px] md:h-[104px] w-full" aria-hidden="true" />
    </>
  );
};

export default Header;

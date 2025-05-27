/**
 * @file Header component
 * @description Main navigation header with responsive design and authentication
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart2, Menu, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import UserMenu from './UserMenu';
import { ROUTES } from '../lib/constants';

interface NavLinkProps {
  to: string;
  label: string;
  isScrolled: boolean;
  onClick?: () => void;
  showNotification?: boolean;
}

/**
 * Navigation link component for consistent styling
 */
const NavLink: React.FC<NavLinkProps> = ({ to, label, isScrolled, onClick, showNotification }) => (
  <Link
    to={to}
    className={`font-medium transition-colors duration-300 ${
      isScrolled
        ? 'text-gray-600 hover:text-indigo-700'
        : 'text-gray-700 hover:text-indigo-600'
    } ${showNotification ? 'flex items-center' : ''}`}
    onClick={onClick}
  >
    <span>{label}</span>
    {showNotification && (
      <span className="ml-1 flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-indigo-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
      </span>
    )}
  </Link>
);

/**
 * Main header component with responsive navigation
 */
const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /**
   * Handle Google sign in via Supabase Auth
   */
  const handleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}${ROUTES.DASHBOARD}`,
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-sm shadow-sm py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center space-x-2 text-blue-900 font-bold text-xl"
          >
            <BarChart2 className="h-7 w-7 text-indigo-600" strokeWidth={2.5} />
            <span
              className={`transition-colors duration-300 ${
                isScrolled ? 'text-gray-900' : 'text-gray-800'
              }`}
            >
              SmartInvest Scout
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 items-center">
            <NavLink to={ROUTES.ABOUT} label="About" isScrolled={isScrolled} />
            <NavLink to={ROUTES.FEATURES} label="Features" isScrolled={isScrolled} />
            <NavLink to={ROUTES.PRICING} label="Pricing" isScrolled={isScrolled} />
            {user && (
              <NavLink 
                to={ROUTES.ALERTS} 
                label="Alerts" 
                isScrolled={isScrolled} 
                showNotification={true} 
              />
            )}
            {user ? (
              <div className="flex items-center space-x-4">
                <UserMenu />
              </div>
            ) : (
              <button
                onClick={handleSignIn}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium transition-colors duration-300 flex items-center space-x-2"
              >
                <span>Sign in with Google</span>
              </button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700 focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg mt-3 py-4 px-4 absolute w-full">
          <nav className="flex flex-col space-y-4">
            <NavLink 
              to={ROUTES.ABOUT} 
              label="About" 
              isScrolled={true} 
              onClick={() => setMobileMenuOpen(false)} 
            />
            <NavLink 
              to={ROUTES.FEATURES} 
              label="Features" 
              isScrolled={true} 
              onClick={() => setMobileMenuOpen(false)} 
            />
            <NavLink 
              to={ROUTES.PRICING} 
              label="Pricing" 
              isScrolled={true} 
              onClick={() => setMobileMenuOpen(false)} 
            />
            {user ? (
              <>
                <UserMenu />
              </>
            ) : (
              <button
                onClick={() => {
                  handleSignIn();
                  setMobileMenuOpen(false);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-300 flex items-center justify-center space-x-2"
              >
                <span>Sign in with Google</span>
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;

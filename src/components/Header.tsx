import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BarChart2, Menu, X } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import UserMenu from "./UserMenu";

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-sm shadow-sm py-3"
          : "bg-transparent py-5"
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
                isScrolled ? "text-gray-900" : "text-gray-800"
              }`}
            >
              SmartInvest Scout
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 items-center">
            <Link
              to="#"
              className={`font-medium transition-colors duration-300 ${
                isScrolled
                  ? "text-gray-600 hover:text-indigo-700"
                  : "text-gray-700 hover:text-indigo-600"
              }`}
            >
              About
            </Link>
            <Link
              to="#"
              className={`font-medium transition-colors duration-300 ${
                isScrolled
                  ? "text-gray-600 hover:text-indigo-700"
                  : "text-gray-700 hover:text-indigo-600"
              }`}
            >
              Features
            </Link>
            <Link
              to="#"
              className={`font-medium transition-colors duration-300 ${
                isScrolled
                  ? "text-gray-600 hover:text-indigo-700"
                  : "text-gray-700 hover:text-indigo-600"
              }`}
            >
              Pricing
            </Link>
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
            <Link
              to="#"
              className="font-medium text-gray-700 hover:text-indigo-600 transition-colors duration-300"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              to="#"
              className="font-medium text-gray-700 hover:text-indigo-600 transition-colors duration-300"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              to="#"
              className="font-medium text-gray-700 hover:text-indigo-600 transition-colors duration-300"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
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
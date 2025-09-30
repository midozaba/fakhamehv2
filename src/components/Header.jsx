import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useTranslation } from "../utils/translations";
import logo from '../assets/FakhamehLogo.png';
import logoText from '../assets/fakhamehtext.png';

const Header = ({ language, setLanguage, currency, setCurrency }) => {
  const location = useLocation();
  const currentPage = location.pathname;
  const t = useTranslation(language);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    /* Header Container */
    <header className="bg-white shadow-lg sticky top-0 z-40">
      {/* Content Container */}
      <div className="container mx-auto px-4 py-2">
        {/* Grid Layout */}
        <div className="flex items-center justify-between gap-4">
          {/* Logo Section */}
          <Link to="/" className="flex items-center space-x-4 cursor-pointer">
            {/* Logo */}
            <div className=" justify-end p-3 rounded-lg">
              <img
                src={logo}
                alt="Al Fakhama Logo"
                className="w-10 h-10 object-contain"
              />
            </div>
            {/* Brand Text */}
            <div>
              <img
                src={logoText}
                alt="Al Fakhama Text"
                className="h-10 object-contain"
              />
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-6 justify-start pr-3">
            {/* Home Button */}
            <Link
              to="/"
              className={`px-4 py-2 text-sm rounded transition-all duration-300 ease-in-out justify-self-center ${
                currentPage === "/"
                  ? "bg-blue-900 text-white"
                  : "text-gray-700 hover:bg-blue-900/10 hover:text-blue-900"
              }`}
            >
              {t("home")}
            </Link>
            {/* Cars Button */}
            <Link
              to="/cars"
              className={`px-4 py-2 text-sm rounded transition-all duration-300 ease-in-out ${
                currentPage === "/cars"
                  ? "bg-blue-900 text-white"
                  : "text-gray-700 hover:bg-blue-900/10 hover:text-blue-900"
              }`}
            >
              {t("cars")}
            </Link>
            {/* TOS Button */}
            <Link
              to="/terms"
              className={`px-4 py-2 text-sm rounded transition-all duration-300 ease-in-out justify-self-center ${
                currentPage === "/terms"
                  ? "bg-blue-900 text-white"
                  : "text-gray-700 hover:bg-blue-900/10 hover:text-blue-900"
              }`}
            >
              {t("terms of service")}
            </Link>
            {/* About us Button */}
            <Link
              to="/about"
              className={`px-4 py-2 text-sm rounded transition-all duration-300 ease-in-out justify-self-center ${
                currentPage === "/about"
                  ? "bg-blue-900 text-white"
                  : "text-gray-700 hover:bg-blue-900/10 hover:text-blue-900"
              }`}
            >
              {t("about us")}
            </Link>
            {/* Contact us Button */}
            <Link
              to="/contact"
              className={`px-4 py-2 text-sm rounded transition-all duration-300 ease-in-out justify-self-center ${
                currentPage === "/contact"
                  ? "bg-blue-900 text-white"
                  : "text-gray-700 hover:bg-blue-900/10 hover:text-blue-900"
              }`}
            >
              {t("contact us")}
            </Link>
          </nav>

          {/* Language and Currency Toggle + Mobile Menu Button */}
          <div className="flex items-center gap-2">
            {/* Desktop Only - Currency and Language Buttons */}
            <button
              onClick={() => setCurrency(currency === "JOD" ? "USD" : "JOD")}
              className="hidden md:block bg-gradient-to-r from-green-600 to-green-800 text-white px-1.5 py-1 text-xs rounded hover:opacity-90 transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95"
            >
              {currency}
            </button>
            <button
              onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
              className="hidden md:block bg-gradient-to-r from-slate-400 to-blue-900 text-white px-1.5 py-1 text-xs rounded hover:opacity-90 transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95"
            >
              {language === "ar" ? "English" : "العربية"}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-blue-900 transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t pt-4">
            <div className="flex flex-col space-y-2">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2 text-sm rounded transition-all duration-300 ease-in-out text-left ${
                  currentPage === "/"
                    ? "bg-blue-900 text-white"
                    : "text-gray-700 hover:bg-blue-900/10 hover:text-blue-900"
                }`}
              >
                {t("home")}
              </Link>
              <Link
                to="/cars"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2 text-sm rounded transition-all duration-300 ease-in-out text-left ${
                  currentPage === "/cars"
                    ? "bg-blue-900 text-white"
                    : "text-gray-700 hover:bg-blue-900/10 hover:text-blue-900"
                }`}
              >
                {t("cars")}
              </Link>
              <Link
                to="/terms"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2 text-sm rounded transition-all duration-300 ease-in-out text-left ${
                  currentPage === "/terms"
                    ? "bg-blue-900 text-white"
                    : "text-gray-700 hover:bg-blue-900/10 hover:text-blue-900"
                }`}
              >
                {t("terms of service")}
              </Link>
              <Link
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2 text-sm rounded transition-all duration-300 ease-in-out text-left ${
                  currentPage === "/about"
                    ? "bg-blue-900 text-white"
                    : "text-gray-700 hover:bg-blue-900/10 hover:text-blue-900"
                }`}
              >
                {t("about us")}
              </Link>
              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2 text-sm rounded transition-all duration-300 ease-in-out text-left ${
                  currentPage === "/contact"
                    ? "bg-blue-900 text-white"
                    : "text-gray-700 hover:bg-blue-900/10 hover:text-blue-900"
                }`}
              >
                {t("contact us")}
              </Link>

              {/* Divider */}
              <div className="border-t my-2"></div>

              {/* Currency and Language Buttons for Mobile */}
              <div className="flex gap-2 px-4">
                <button
                  onClick={() => setCurrency(currency === "JOD" ? "USD" : "JOD")}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-800 text-white px-4 py-2 text-sm rounded hover:opacity-90 transition-all duration-300 ease-in-out"
                >
                  {currency}
                </button>
                <button
                  onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
                  className="flex-1 bg-gradient-to-r from-slate-400 to-blue-900 text-white px-4 py-2 text-sm rounded hover:opacity-90 transition-all duration-300 ease-in-out"
                >
                  {language === "ar" ? "English" : "العربية"}
                </button>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;

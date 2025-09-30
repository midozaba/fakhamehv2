import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { useTranslation } from "../utils/translations";

const Header = ({ language, setLanguage, currentPage, setCurrentPage, currency, setCurrency }) => {
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
          <div className="flex items-center space-x-4 cursor-pointer" onClick={() => setCurrentPage("home")}>
            {/* Logo */}
            <div className=" justify-end p-3 rounded-lg">
              <img
                src="/src/assets/FakhamehLogo.png"
                alt="Al Fakhama Logo"
                className="w-10 h-10 object-contain"
              />
            </div>
            {/* Brand Text */}
            <div>
              <img
                src="/src/assets/fakhamehtext.png"
                alt="Al Fakhama Text"
                className="h-10 object-contain"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-6 justify-start pr-3">
            {/* Home Button */}
            <button
              onClick={() => setCurrentPage("home")}
              className={`px-2 py-1 text-xs rounded transition-all duration-300 ease-in-out justify-self-center ${
                currentPage === "home"
                  ? "bg-blue-900 text-white"
                  : "text-gray-700 hover:bg-blue-900/10 hover:text-blue-900"
              }`}
            >
              {t("home")}
            </button>
            {/* Cars Button */}
            <button
              onClick={() => setCurrentPage("cars")}
              className={`px-2 py-1 text-xs rounded transition-all duration-300 ease-in-out ${
                currentPage === "cars"
                  ? "bg-blue-900 text-white"
                  : "text-gray-700 hover:bg-blue-900/10 hover:text-blue-900"
              }`}
            >
              {t("cars")}
            </button>
            {/* TOS Button */}
            <button
              onClick={() => setCurrentPage("TOS")}
              className={`px-2 py-1 text-xs rounded transition-all duration-300 ease-in-out justify-self-center ${
                currentPage === "TOS"
                  ? "bg-blue-900 text-white"
                  : "text-gray-700 hover:bg-blue-900/10 hover:text-blue-900"
              }`}
            >
              {t("terms of service")}
            </button>
            {/* About us Button */}
            <button
              onClick={() => setCurrentPage("about-us")}
              className={`px-2 py-1 text-xs rounded transition-all duration-300 ease-in-out justify-self-center ${
                currentPage === "about-us"
                  ? "bg-blue-900 text-white"
                  : "text-gray-700 hover:bg-blue-900/10 hover:text-blue-900"
              }`}
            >
              {t("about us")}
            </button>
            {/* Contact us Button */}
            <button
              onClick={() => setCurrentPage("contact-us")}
              className={`px-2 py-1 text-xs rounded transition-all duration-300 ease-in-out justify-self-center ${
                currentPage === "contact-us"
                  ? "bg-blue-900 text-white"
                  : "text-gray-700 hover:bg-blue-900/10 hover:text-blue-900"
              }`}
            >
              {t("contact us")}
            </button>
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
              <button
                onClick={() => {
                  setCurrentPage("home");
                  setMobileMenuOpen(false);
                }}
                className={`px-4 py-2 text-sm rounded transition-all duration-300 ease-in-out text-left ${
                  currentPage === "home"
                    ? "bg-blue-900 text-white"
                    : "text-gray-700 hover:bg-blue-900/10 hover:text-blue-900"
                }`}
              >
                {t("home")}
              </button>
              <button
                onClick={() => {
                  setCurrentPage("cars");
                  setMobileMenuOpen(false);
                }}
                className={`px-4 py-2 text-sm rounded transition-all duration-300 ease-in-out text-left ${
                  currentPage === "cars"
                    ? "bg-blue-900 text-white"
                    : "text-gray-700 hover:bg-blue-900/10 hover:text-blue-900"
                }`}
              >
                {t("cars")}
              </button>
              <button
                onClick={() => {
                  setCurrentPage("TOS");
                  setMobileMenuOpen(false);
                }}
                className={`px-4 py-2 text-sm rounded transition-all duration-300 ease-in-out text-left ${
                  currentPage === "TOS"
                    ? "bg-blue-900 text-white"
                    : "text-gray-700 hover:bg-blue-900/10 hover:text-blue-900"
                }`}
              >
                {t("terms of service")}
              </button>
              <button
                onClick={() => {
                  setCurrentPage("about-us");
                  setMobileMenuOpen(false);
                }}
                className={`px-4 py-2 text-sm rounded transition-all duration-300 ease-in-out text-left ${
                  currentPage === "about-us"
                    ? "bg-blue-900 text-white"
                    : "text-gray-700 hover:bg-blue-900/10 hover:text-blue-900"
                }`}
              >
                {t("about us")}
              </button>
              <button
                onClick={() => {
                  setCurrentPage("contact-us");
                  setMobileMenuOpen(false);
                }}
                className={`px-4 py-2 text-sm rounded transition-all duration-300 ease-in-out text-left ${
                  currentPage === "contact-us"
                    ? "bg-blue-900 text-white"
                    : "text-gray-700 hover:bg-blue-900/10 hover:text-blue-900"
                }`}
              >
                {t("contact us")}
              </button>

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

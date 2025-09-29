import React from "react";
import { useTranslation } from "../utils/translations";

const Header = ({ language, setLanguage, currentPage, setCurrentPage }) => {
  const t = useTranslation(language);

  return (
    /* Header Container */
    <header className="bg-white shadow-lg sticky top-0 z-40">
      {/* Content Container */}
      <div className="container mx-auto px-4 py-2">
        {/* Grid Layout */}
        <div className="grid grid-cols-[minmax(200px,auto)_1fr_auto] items-center gap-4">
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
          </nav>

          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
            className="bg-gradient-to-r from-slate-400 to-blue-900 text-white px-1.5 py-1 text-xs rounded hover:opacity-90 transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 justify-self-end"
          >
            {language === "ar" ? "English" : "العربية"}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

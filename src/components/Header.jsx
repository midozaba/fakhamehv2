import React from 'react';
import { Car } from 'lucide-react';
import { useTranslation } from '../utils/translations';

const Header = ({ language, setLanguage, currentPage, setCurrentPage }) => {
  const t = useTranslation(language);

  return (
    <header className="bg-white shadow-lg sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-slate-400 to-blue-900 p-3 rounded-lg">
              <Car className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-blue-900">AL FAKHAMA</h1>
              <p className="text-slate-600 text-sm">car rental</p>
            </div>
          </div>

          <nav className="hidden md:flex space-x-6">
            <button
              onClick={() => setCurrentPage('home')}
              className={`px-4 py-2 rounded-lg transition-all ${currentPage === 'home' ? 'bg-blue-900 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              {t('home')}
            </button>
            <button
              onClick={() => setCurrentPage('cars')}
              className={`px-4 py-2 rounded-lg transition-all ${currentPage === 'cars' ? 'bg-blue-900 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              {t('cars')}
            </button>
          </nav>

          <button
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="bg-gradient-to-r from-slate-400 to-blue-900 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all"
          >
            {language === 'ar' ? 'English' : 'العربية'}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
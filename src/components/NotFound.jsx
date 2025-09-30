import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../utils/translations';

const NotFound = ({ language }) => {
  const t = useTranslation(language);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-blue-900">404</h1>
        <p className="text-2xl font-semibold text-gray-800 mt-4">
          {language === 'ar' ? 'الصفحة غير موجودة' : 'Page Not Found'}
        </p>
        <p className="text-gray-600 mt-2 mb-8">
          {language === 'ar'
            ? 'عذراً، الصفحة التي تبحث عنها غير موجودة.'
            : "Sorry, the page you're looking for doesn't exist."}
        </p>
        <Link
          to="/"
          className="inline-block bg-gradient-to-r from-blue-600 to-blue-800 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-blue-900 transition-all font-semibold shadow-lg"
        >
          {language === 'ar' ? 'العودة للرئيسية' : 'Go Back Home'}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
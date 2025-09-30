import React from 'react';

const AboutUs = ({ language }) => {
  return (
    <div className={`${language === 'ar' ? 'rtl' : 'ltr'} min-h-screen flex items-center justify-center py-16`}>
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          {language === 'ar' ? 'من نحن' : 'About Us'}
        </h1>
        <div className="w-24 h-1 bg-blue-900 mx-auto mb-8"></div>
        <p className="text-xl text-gray-500">
          {language === 'ar' ? 'قريباً...' : 'Coming Soon...'}
        </p>
      </div>
    </div>
  );
};

export default AboutUs;
import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  // Language state
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('language');
    if (saved) return saved;

    const browserLang = navigator.language || navigator.userLanguage;
    return browserLang.startsWith('ar') ? 'ar' : 'en';
  });

  // Currency state
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('currency') || 'JOD';
  });

  // Selected car state
  const [selectedCar, setSelectedCar] = useState(null);

  // Booking data state
  const [bookingData, setBookingData] = useState({
    pickupDate: "",
    returnDate: "",
    days: 1,
    insurance: "basic",
    additionalServices: [],
    customerInfo: {
      name: "",
      email: "",
      phone: "",
      license: "",
      street: "",
      city: "",
      area: "",
      postalCode: "",
      country: "",
      idDocument: null,
      passportDocument: null,
    },
  });

  // Search filters state
  const [searchFilters, setSearchFilters] = useState({
    category: "all",
    priceRange: "all",
  });

  // Transition state for smooth language changes
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Submitting state for forms
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Persist language to localStorage
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // Persist currency to localStorage
  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  // Smooth language change handler
  const handleLanguageChange = (newLanguage) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setLanguage(newLanguage);
      setIsTransitioning(false);
    }, 150);
  };

  const value = {
    // Language & Currency
    language,
    setLanguage,
    handleLanguageChange,
    currency,
    setCurrency,
    isTransitioning,

    // Car & Booking
    selectedCar,
    setSelectedCar,
    bookingData,
    setBookingData,

    // Search
    searchFilters,
    setSearchFilters,

    // Form states
    isSubmitting,
    setIsSubmitting,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

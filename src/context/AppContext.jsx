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

  // Authentication state
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || null;
  });

  // Selected car state
  const [selectedCar, setSelectedCar] = useState(null);

  // Booking data state
  const [bookingData, setBookingData] = useState({
    pickupDate: "",
    returnDate: "",
    pickupLocation: "",
    returnLocation: "",
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

  // Authentication functions
  const login = (authToken, userData) => {
    setToken(authToken);
    setUser(userData);
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const isAuthenticated = () => {
    return token !== null && user !== null;
  };

  const value = {
    // Language & Currency
    language,
    setLanguage,
    handleLanguageChange,
    currency,
    setCurrency,
    isTransitioning,

    // Authentication
    user,
    token,
    login,
    logout,
    isAuthenticated,

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

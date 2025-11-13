import ReactGA from 'react-ga4';

// Configuration
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';
const isProduction = import.meta.env.PROD;
const isDevelopment = import.meta.env.DEV;

// Initialize Google Analytics
export const initGA = () => {
  if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') {
    if (isDevelopment) {
      console.warn('[Analytics] GA Measurement ID not configured. Set VITE_GA_MEASUREMENT_ID in .env');
    }
    return;
  }

  try {
    ReactGA.initialize(GA_MEASUREMENT_ID, {
      gaOptions: {
        send_page_view: false, // We'll send page views manually
      },
      gtagOptions: {
        debug_mode: isDevelopment,
      },
    });

    if (isDevelopment) {
      console.log('[Analytics] Google Analytics initialized:', GA_MEASUREMENT_ID);
    }
  } catch (error) {
    console.error('[Analytics] Failed to initialize:', error);
  }
};

// Check if analytics is enabled
const isEnabled = () => {
  return isProduction && GA_MEASUREMENT_ID && GA_MEASUREMENT_ID !== 'G-XXXXXXXXXX';
};

// ========================================
// PAGE TRACKING
// ========================================

/**
 * Track page view
 * @param {string} path - Page path
 * @param {string} title - Page title
 */
export const trackPageView = (path, title) => {
  if (!isEnabled()) {
    if (isDevelopment) {
      console.log('[Analytics] Page View:', { path, title });
    }
    return;
  }

  try {
    ReactGA.send({ hitType: 'pageview', page: path, title });
  } catch (error) {
    console.error('[Analytics] Page view error:', error);
  }
};

// ========================================
// BOOKING FUNNEL TRACKING
// ========================================

/**
 * Track booking funnel steps
 */
export const trackBookingFunnel = {
  // Step 1: User views car details
  viewCarDetails: (carData) => {
    if (!isEnabled()) {
      if (isDevelopment) {
        console.log('[Analytics] Booking Funnel - View Car:', carData);
      }
      return;
    }

    ReactGA.event({
      category: 'Booking Funnel',
      action: 'View Car Details',
      label: `${carData.car_barnd} ${carData.car_type}`,
      value: parseFloat(carData.price_per_day),
    });
  },

  // Step 2: User clicks "Book Now"
  clickBookNow: (carData) => {
    if (!isEnabled()) {
      if (isDevelopment) {
        console.log('[Analytics] Booking Funnel - Click Book Now:', carData);
      }
      return;
    }

    ReactGA.event({
      category: 'Booking Funnel',
      action: 'Click Book Now',
      label: `${carData.car_barnd} ${carData.car_type}`,
      value: parseFloat(carData.price_per_day),
    });
  },

  // Step 3: User selects dates
  selectDates: (days, pickupDate, returnDate) => {
    if (!isEnabled()) {
      if (isDevelopment) {
        console.log('[Analytics] Booking Funnel - Select Dates:', { days, pickupDate, returnDate });
      }
      return;
    }

    ReactGA.event({
      category: 'Booking Funnel',
      action: 'Select Dates',
      label: `${days} days`,
      value: days,
    });
  },

  // Step 4: User selects insurance
  selectInsurance: (insuranceType, price) => {
    if (!isEnabled()) {
      if (isDevelopment) {
        console.log('[Analytics] Booking Funnel - Select Insurance:', { insuranceType, price });
      }
      return;
    }

    ReactGA.event({
      category: 'Booking Funnel',
      action: 'Select Insurance',
      label: insuranceType,
      value: price,
    });
  },

  // Step 5: User adds additional services
  addService: (serviceName, price) => {
    if (!isEnabled()) {
      if (isDevelopment) {
        console.log('[Analytics] Booking Funnel - Add Service:', { serviceName, price });
      }
      return;
    }

    ReactGA.event({
      category: 'Booking Funnel',
      action: 'Add Additional Service',
      label: serviceName,
      value: price,
    });
  },

  // Step 6: User fills customer info
  fillCustomerInfo: () => {
    if (!isEnabled()) {
      if (isDevelopment) {
        console.log('[Analytics] Booking Funnel - Fill Customer Info');
      }
      return;
    }

    ReactGA.event({
      category: 'Booking Funnel',
      action: 'Fill Customer Info',
    });
  },

  // Step 7: User uploads documents
  uploadDocuments: () => {
    if (!isEnabled()) {
      if (isDevelopment) {
        console.log('[Analytics] Booking Funnel - Upload Documents');
      }
      return;
    }

    ReactGA.event({
      category: 'Booking Funnel',
      action: 'Upload Documents',
    });
  },

  // Step 8: User submits booking
  submitBooking: (totalPrice, carType, days) => {
    if (!isEnabled()) {
      if (isDevelopment) {
        console.log('[Analytics] Booking Funnel - Submit:', { totalPrice, carType, days });
      }
      return;
    }

    ReactGA.event({
      category: 'Booking Funnel',
      action: 'Submit Booking',
      label: carType,
      value: totalPrice,
    });
  },

  // Step 9: Booking success
  bookingSuccess: (totalPrice, carType, bookingId, days = 1) => {
    if (!isEnabled()) {
      if (isDevelopment) {
        console.log('[Analytics] Booking Funnel - Success:', { totalPrice, carType, bookingId, days });
      }
      return;
    }

    ReactGA.event({
      category: 'Booking Funnel',
      action: 'Booking Confirmed',
      label: `${carType} - ${bookingId}`,
      value: totalPrice,
    });

    // Also send as conversion
    ReactGA.event('purchase', {
      transaction_id: bookingId,
      value: totalPrice,
      currency: 'JOD',
      items: [{
        item_id: carType,
        item_name: carType,
        price: totalPrice,
        quantity: days,
      }]
    });
  },

  // Booking failed
  bookingFailed: (error) => {
    if (!isEnabled()) {
      if (isDevelopment) {
        console.log('[Analytics] Booking Funnel - Failed:', error);
      }
      return;
    }

    ReactGA.event({
      category: 'Booking Funnel',
      action: 'Booking Failed',
      label: error,
    });
  },
};

// ========================================
// CAR SEARCH TRACKING
// ========================================

/**
 * Track car searches and filters
 */
export const trackCarSearch = {
  // User searches/filters cars
  filterCars: (filterType, filterValue) => {
    if (!isEnabled()) {
      if (isDevelopment) {
        console.log('[Analytics] Car Search - Filter:', { filterType, filterValue });
      }
      return;
    }

    ReactGA.event({
      category: 'Car Search',
      action: 'Apply Filter',
      label: `${filterType}: ${filterValue}`,
    });
  },

  // User views car card
  viewCar: (carBrand, carType) => {
    if (!isEnabled()) {
      if (isDevelopment) {
        console.log('[Analytics] Car Search - View Car:', { carBrand, carType });
      }
      return;
    }

    ReactGA.event({
      category: 'Car Search',
      action: 'View Car Card',
      label: `${carBrand} ${carType}`,
    });
  },

  // User changes currency
  changeCurrency: (currency) => {
    if (!isEnabled()) {
      if (isDevelopment) {
        console.log('[Analytics] Car Search - Change Currency:', currency);
      }
      return;
    }

    ReactGA.event({
      category: 'Car Search',
      action: 'Change Currency',
      label: currency,
    });
  },
};

// ========================================
// CONTACT FORM TRACKING
// ========================================

/**
 * Track contact form interactions
 */
export const trackContactForm = {
  // User starts filling form
  startForm: () => {
    if (!isEnabled()) {
      if (isDevelopment) {
        console.log('[Analytics] Contact Form - Start');
      }
      return;
    }

    ReactGA.event({
      category: 'Contact Form',
      action: 'Start Form',
    });
  },

  // User submits form
  submitForm: (subject) => {
    if (!isEnabled()) {
      if (isDevelopment) {
        console.log('[Analytics] Contact Form - Submit:', subject);
      }
      return;
    }

    ReactGA.event({
      category: 'Contact Form',
      action: 'Submit Form',
      label: subject,
    });
  },

  // Form submission success
  submitSuccess: () => {
    if (!isEnabled()) {
      if (isDevelopment) {
        console.log('[Analytics] Contact Form - Success');
      }
      return;
    }

    ReactGA.event({
      category: 'Contact Form',
      action: 'Form Submitted Successfully',
    });
  },

  // Form submission failed
  submitFailed: (error) => {
    if (!isEnabled()) {
      if (isDevelopment) {
        console.log('[Analytics] Contact Form - Failed:', error);
      }
      return;
    }

    ReactGA.event({
      category: 'Contact Form',
      action: 'Form Submission Failed',
      label: error,
    });
  },
};

// ========================================
// BUTTON CLICK TRACKING
// ========================================

/**
 * Track button clicks
 */
export const trackButtonClick = (buttonName, location, additionalData = {}) => {
  if (!isEnabled()) {
    if (isDevelopment) {
      console.log('[Analytics] Button Click:', { buttonName, location, ...additionalData });
    }
    return;
  }

  ReactGA.event({
    category: 'Button Click',
    action: buttonName,
    label: location,
    ...additionalData,
  });
};

// ========================================
// SOCIAL MEDIA TRACKING
// ========================================

/**
 * Track social media clicks
 */
export const trackSocialClick = (platform, location) => {
  if (!isEnabled()) {
    if (isDevelopment) {
      console.log('[Analytics] Social Click:', { platform, location });
    }
    return;
  }

  ReactGA.event({
    category: 'Social Media',
    action: 'Click',
    label: `${platform} - ${location}`,
  });
};

// ========================================
// ERROR TRACKING
// ========================================

/**
 * Track errors
 */
export const trackError = (errorType, errorMessage, location) => {
  if (!isEnabled()) {
    if (isDevelopment) {
      console.log('[Analytics] Error:', { errorType, errorMessage, location });
    }
    return;
  }

  ReactGA.event({
    category: 'Error',
    action: errorType,
    label: `${location}: ${errorMessage}`,
  });
};

// ========================================
// LANGUAGE/THEME TRACKING
// ========================================

/**
 * Track language change
 */
export const trackLanguageChange = (newLanguage) => {
  if (!isEnabled()) {
    if (isDevelopment) {
      console.log('[Analytics] Language Change:', newLanguage);
    }
    return;
  }

  ReactGA.event({
    category: 'User Preferences',
    action: 'Change Language',
    label: newLanguage,
  });
};

// ========================================
// TIMING TRACKING
// ========================================

/**
 * Track timing events
 */
export const trackTiming = (category, variable, value, label) => {
  if (!isEnabled()) {
    if (isDevelopment) {
      console.log('[Analytics] Timing:', { category, variable, value, label });
    }
    return;
  }

  ReactGA.event({
    category: 'Timing',
    action: variable,
    label: `${category} - ${label}`,
    value: Math.round(value),
  });
};

export default {
  initGA,
  trackPageView,
  trackBookingFunnel,
  trackCarSearch,
  trackContactForm,
  trackButtonClick,
  trackSocialClick,
  trackError,
  trackLanguageChange,
  trackTiming,
};

/**
 * API Helper utilities with retry mechanism and network error detection
 */

/**
 * Check if error is a network error
 */
export const isNetworkError = (error) => {
  return (
    !navigator.onLine ||
    error.message === 'Failed to fetch' ||
    error.message === 'Network request failed' ||
    error.name === 'NetworkError' ||
    (error.response && error.response.status >= 500)
  );
};

/**
 * Delay function for retry mechanism
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch with retry mechanism
 * @param {string} url - API endpoint
 * @param {object} options - Fetch options
 * @param {number} retries - Number of retry attempts (default: 3)
 * @param {number} retryDelay - Delay between retries in ms (default: 1000)
 */
export const fetchWithRetry = async (url, options = {}, retries = 3, retryDelay = 1000) => {
  let lastError;

  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(url, options);

      // If response is not ok, throw error
      if (!response.ok) {
        const error = new Error(`HTTP error! status: ${response.status}`);
        error.response = response;
        throw error;
      }

      return response;
    } catch (error) {
      lastError = error;

      // Don't retry on client errors (4xx)
      if (error.response && error.response.status >= 400 && error.response.status < 500) {
        throw error;
      }

      // If it's the last retry, throw the error
      if (i === retries) {
        throw error;
      }

      // Wait before retrying
      await delay(retryDelay * (i + 1)); // Exponential backoff
    }
  }

  throw lastError;
};

/**
 * Helper to handle API errors and return user-friendly messages
 */
export const getErrorMessage = (error, language = 'en') => {
  const messages = {
    en: {
      network: 'Network error. Please check your connection and try again.',
      server: 'Server error. Please try again later.',
      notFound: 'Resource not found.',
      unauthorized: 'Unauthorized. Please login again.',
      forbidden: 'You don\'t have permission to access this resource.',
      default: 'Something went wrong. Please try again.'
    },
    ar: {
      network: 'خطأ في الاتصال. يرجى التحقق من الاتصال والمحاولة مرة أخرى.',
      server: 'خطأ في الخادم. يرجى المحاولة لاحقاً.',
      notFound: 'المورد غير موجود.',
      unauthorized: 'غير مصرح. يرجى تسجيل الدخول مرة أخرى.',
      forbidden: 'ليس لديك إذن للوصول إلى هذا المورد.',
      default: 'حدث خطأ ما. يرجى المحاولة مرة أخرى.'
    }
  };

  const lang = messages[language] || messages.en;

  if (isNetworkError(error)) {
    return lang.network;
  }

  if (error.response) {
    const status = error.response.status;
    if (status === 404) return lang.notFound;
    if (status === 401) return lang.unauthorized;
    if (status === 403) return lang.forbidden;
    if (status >= 500) return lang.server;
  }

  return lang.default;
};

/**
 * Network status listener
 */
export const addNetworkListener = (callback) => {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};

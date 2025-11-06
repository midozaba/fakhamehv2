import axios from 'axios';

// API Base URL - uses environment variable (REQUIRED in production)
const BASE_URL = import.meta.env.VITE_API_URL || (() => {
  console.warn('VITE_API_URL not set! Using window.location for API calls.');
  return `${window.location.protocol}//${window.location.hostname}:3001/api`;
})();

// Request timeout (10 seconds)
const TIMEOUT = 10000;

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = new Map();

// Create axios instance
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  withCredentials: true, // Include cookies in requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add timestamp to request
    config.metadata = { startTime: new Date() };

    // Add Authorization header if token exists in sessionStorage
    const token = sessionStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // If sending FormData, remove Content-Type header so axios sets it automatically with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Calculate request duration
    const duration = new Date() - response.config.metadata.startTime;

    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Response] ${response.config.method.toUpperCase()} ${response.config.url} (${duration}ms)`);
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[API Error] ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`, error.message);
    }

    // Don't retry requests with Turnstile tokens (they're single-use)
    const hasFormData = originalRequest.data instanceof FormData;
    const isTurnstileEndpoint = originalRequest.url?.includes('/bookings') ||
                                originalRequest.url?.includes('/contact') ||
                                originalRequest.url?.includes('/reviews/submit');

    // Retry logic for network errors and 5xx errors (but not for Turnstile-protected endpoints)
    if (
      originalRequest &&
      !originalRequest._retry &&
      !isTurnstileEndpoint &&
      (!error.response || error.response.status >= 500)
    ) {
      originalRequest._retry = true;
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

      // Maximum 3 retries
      if (originalRequest._retryCount <= 3) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, originalRequest._retryCount - 1) * 1000;

        if (process.env.NODE_ENV === 'development') {
          console.log(`[API Retry] Attempt ${originalRequest._retryCount}/3 after ${delay}ms`);
        }

        await new Promise(resolve => setTimeout(resolve, delay));
        return apiClient(originalRequest);
      }
    }

    // Handle specific error cases
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timeout - please try again';
    } else if (!error.response) {
      error.message = 'Network error - please check your connection';
    } else if (error.response.status === 404) {
      error.message = 'Resource not found';
    } else if (error.response.status === 401) {
      error.message = 'Unauthorized - please login again';
    } else if (error.response.status === 403) {
      error.message = 'Access denied';
    } else if (error.response.status >= 500) {
      error.message = 'Server error - please try again later';
    }

    return Promise.reject(error);
  }
);

// Response unwrapper - handles various response formats from backend
const unwrapResponse = (response, fallback = null) => {
  // Handle axios response object
  const rawData = response.data || response;

  // If it's already an array, return it
  if (Array.isArray(rawData)) {
    return rawData;
  }

  // If it has a 'data' property, unwrap it
  if (rawData && typeof rawData === 'object' && 'data' in rawData) {
    return rawData.data;
  }

  // If it has a 'stats' property (for admin stats), unwrap it
  if (rawData && typeof rawData === 'object' && 'stats' in rawData) {
    return rawData.stats;
  }

  // Return the raw data or fallback
  return rawData || fallback;
};

// Cache helper functions
const getCacheKey = (url, params) => {
  return `${url}?${JSON.stringify(params || {})}`;
};

const getCachedData = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Cache Hit] ${key}`);
    }
    return cached.data;
  }
  cache.delete(key);
  return null;
};

const setCachedData = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

const clearCache = (pattern) => {
  if (pattern) {
    // Clear specific cache entries matching pattern
    for (const key of cache.keys()) {
      if (key.includes(pattern)) {
        cache.delete(key);
      }
    }
  } else {
    // Clear all cache
    cache.clear();
  }
};

// API Service
const api = {
  // Cars API
  cars: {
    getAll: async (params = {}) => {
      const cacheKey = getCacheKey('/cars', params);
      const cached = getCachedData(cacheKey);
      if (cached) return cached;

      const response = await apiClient.get('/cars', { params });
      const data = unwrapResponse(response, []);
      setCachedData(cacheKey, data);
      return data;
    },

    getById: async (id) => {
      const cacheKey = getCacheKey(`/cars/${id}`);
      const cached = getCachedData(cacheKey);
      if (cached) return cached;

      const response = await apiClient.get(`/cars/${id}`);
      const data = unwrapResponse(response);
      setCachedData(cacheKey, data);
      return data;
    },

    create: async (carData) => {
      // For FormData, let axios set the Content-Type automatically (with boundary)
      const response = await apiClient.post('/cars', carData);
      clearCache('/cars');
      return unwrapResponse(response);
    },

    update: async (id, carData) => {
      // For FormData, let axios set the Content-Type automatically (with boundary)
      const response = await apiClient.put(`/cars/${id}`, carData);
      clearCache('/cars');
      return unwrapResponse(response);
    },

    delete: async (id) => {
      const response = await apiClient.delete(`/cars/${id}`);
      clearCache('/cars');
      return unwrapResponse(response);
    },
  },

  // Bookings API
  bookings: {
    getAll: async () => {
      const response = await apiClient.get('/bookings');
      return unwrapResponse(response, []);
    },

    getById: async (id) => {
      const response = await apiClient.get(`/bookings/${id}`);
      return unwrapResponse(response);
    },

    create: async (formData) => {
      // For FormData, let axios set the Content-Type automatically (with boundary)
      const response = await apiClient.post('/bookings', formData);
      return unwrapResponse(response);
    },

    updateStatus: async (id, status) => {
      const response = await apiClient.patch(`/bookings/${id}/status`, { status });
      return unwrapResponse(response);
    },

    delete: async (id) => {
      const response = await apiClient.delete(`/bookings/${id}`);
      return unwrapResponse(response);
    },
  },

  // Contact API
  contact: {
    send: async (contactData) => {
      const response = await apiClient.post('/contact', contactData);
      return unwrapResponse(response);
    },

    getMessages: async () => {
      const response = await apiClient.get('/contact-messages');
      return unwrapResponse(response, []);
    },

    updateStatus: async (id, status) => {
      const response = await apiClient.patch(`/contact-messages/${id}/status`, { status });
      return unwrapResponse(response);
    },
  },

  // Reviews API
  reviews: {
    getAll: async () => {
      const response = await apiClient.get('/reviews');
      return unwrapResponse(response, []);
    },

    getAllAdmin: async () => {
      const response = await apiClient.get('/admin/reviews');
      return unwrapResponse(response, []);
    },

    submit: async (reviewData) => {
      const response = await apiClient.post('/reviews/submit', reviewData);
      return unwrapResponse(response);
    },

    create: async (reviewData) => {
      const response = await apiClient.post('/reviews', reviewData);
      return unwrapResponse(response);
    },

    update: async (id, reviewData) => {
      const response = await apiClient.put(`/reviews/${id}`, reviewData);
      return unwrapResponse(response);
    },

    delete: async (id) => {
      const response = await apiClient.delete(`/reviews/${id}`);
      return unwrapResponse(response);
    },
  },

  // Admin API
  admin: {
    getStats: async () => {
      const response = await apiClient.get('/admin/stats');
      return unwrapResponse(response);
    },

    login: async (credentials) => {
      const response = await apiClient.post('/admin/login', credentials);
      return unwrapResponse(response);
    },

    verify: async () => {
      const response = await apiClient.get('/admin/verify');
      return unwrapResponse(response);
    },

    logout: async () => {
      const response = await apiClient.post('/admin/logout');
      return unwrapResponse(response);
    },
  },

  // Utility methods
  clearCache,

  // Direct access to axios instance for custom requests
  client: apiClient,
};

// Expose clearCache to window for admin panel
if (typeof window !== 'undefined') {
  window.apiClearCache = clearCache;
}

export default api;

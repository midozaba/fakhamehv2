# API Integration Documentation

## ✅ Complete Implementation

### Installed Packages:
- **axios** v1.6.0+ - Promise-based HTTP client with advanced features

### Created Files:

#### **1. Centralized API Service** (`src/services/api.js`)
Main API client with comprehensive error handling, retry logic, and caching.

**Features:**
- ✅ Axios-based HTTP client
- ✅ Request/Response interceptors
- ✅ Automatic retry with exponential backoff (up to 3 attempts)
- ✅ 10-second request timeout
- ✅ 5-minute response caching
- ✅ Network error detection
- ✅ User-friendly error messages
- ✅ Development logging
- ✅ Cache management

#### **2. Admin API Service** (`src/services/adminApi.js`)
Refactored to use centralized API client instead of raw fetch calls.

### API Service Structure:

```javascript
import api from '../services/api';

// Cars API
api.cars.getAll(params)      // Get all cars (cached)
api.cars.getById(id)          // Get single car (cached)
api.cars.create(carData)      // Create new car (clears cache)
api.cars.update(id, carData)  // Update car (clears cache)
api.cars.delete(id)           // Delete car (clears cache)

// Bookings API
api.bookings.getAll()         // Get all bookings
api.bookings.getById(id)      // Get single booking
api.bookings.create(formData) // Create booking (multipart/form-data)
api.bookings.updateStatus(id, status) // Update booking status
api.bookings.delete(id)       // Delete booking

// Contact API
api.contact.send(contactData) // Send contact message

// Admin API
api.admin.getStats()          // Get dashboard statistics
api.admin.login(credentials)  // Admin login

// Utility Methods
api.clearCache(pattern)       // Clear specific or all cache
api.client                    // Direct axios instance access
```

### Key Features Implemented:

#### 🔄 **Automatic Retry Logic**
- Retries failed requests up to 3 times
- Exponential backoff: 1s, 2s, 4s
- Only retries network errors and 5xx server errors
- Skips retry for 4xx client errors

```javascript
// Automatic retry - no code changes needed!
const cars = await api.cars.getAll();
// Will retry 3 times with exponential backoff if it fails
```

#### 📦 **Response Caching**
- 5-minute cache duration for GET requests
- Automatic cache invalidation on mutations (POST, PUT, DELETE)
- Cache keys based on URL + parameters
- Memory-based cache storage

```javascript
// First call - fetches from server
const cars1 = await api.cars.getAll();

// Second call within 5 minutes - returns cached data
const cars2 = await api.cars.getAll();

// Manual cache clearing
api.clearCache('/cars'); // Clear specific endpoint
api.clearCache();        // Clear all cache
```

#### ⏱️ **Request Timeout**
- 10-second timeout for all requests
- Prevents hanging requests
- Returns user-friendly timeout error

#### 🔍 **Request/Response Interceptors**

**Request Interceptor:**
- Adds timestamp for duration tracking
- Logs requests in development mode
- Can add authentication headers (future)

**Response Interceptor:**
- Calculates request duration
- Logs responses in development mode
- Handles retry logic automatically
- Transforms error messages to user-friendly format

#### ⚠️ **Enhanced Error Handling**
Provides clear, user-friendly error messages:

| Error Type | Message |
|------------|---------|
| Timeout | "Request timeout - please try again" |
| Network Error | "Network error - please check your connection" |
| 404 Not Found | "Resource not found" |
| 401 Unauthorized | "Unauthorized - please login again" |
| 403 Forbidden | "Access denied" |
| 5xx Server Error | "Server error - please try again later" |

```javascript
try {
  await api.cars.getById(999);
} catch (error) {
  // error.message is already user-friendly
  console.log(error.message); // "Resource not found"
}
```

#### 📝 **Development Logging**
Automatic console logging in development:
```
[API Request] GET /api/cars
[API Response] GET /api/cars (234ms)
[Cache Hit] /api/cars
[API Retry] Attempt 2/3 after 2000ms
[API Error] GET /api/cars/999 Resource not found
```

### Refactored Components:

#### **1. HomePage.jsx**
```javascript
// Before
const response = await fetchWithRetry('/api/cars');
const data = await response.json();

// After
const data = await api.cars.getAll();
// Automatic retry + caching included!
```

#### **2. CarsPage.jsx**
```javascript
// Before
const data = await fetchCars();

// After
const data = await api.cars.getAll();
// Automatic retry + caching included!
```

#### **3. ContactUs.jsx**
```javascript
// Before
const response = await fetch('http://localhost:3001/api/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formData)
});

// After
await api.contact.send(formData);
// Automatic retry + error handling included!
```

#### **4. App.jsx (Booking)**
```javascript
// Before
const response = await fetch('http://localhost:3001/api/bookings', {
  method: 'POST',
  body: formData
});

// After
await api.bookings.create(formData);
// Automatic retry + error handling included!
```

#### **5. AdminPage.jsx**
Already using adminApi.js, which now uses centralized API client.

### Configuration:

**Base URL:** `http://localhost:3001/api`
**Timeout:** 10 seconds (10,000ms)
**Cache Duration:** 5 minutes (300,000ms)
**Max Retries:** 3 attempts
**Retry Delay:** Exponential backoff (1s, 2s, 4s)

### Usage Examples:

#### **Basic GET Request:**
```javascript
import api from '../services/api';

// Simple request
const cars = await api.cars.getAll();

// With parameters
const cars = await api.cars.getAll({ brand: 'Toyota' });

// Single resource
const car = await api.cars.getById(123);
```

#### **POST Request:**
```javascript
// JSON data
const newCar = await api.cars.create({
  car_barnd: 'Toyota',
  car_type: 'Camry',
  price_per_day: 25
});

// FormData (file uploads)
const formData = new FormData();
formData.append('bookingData', JSON.stringify(data));
formData.append('idDocument', file);

const booking = await api.bookings.create(formData);
```

#### **PUT/PATCH Request:**
```javascript
// Update resource
const updated = await api.cars.update(123, {
  price_per_day: 30
});

// Update status
const booking = await api.bookings.updateStatus(456, 'confirmed');
```

#### **DELETE Request:**
```javascript
await api.cars.delete(123);
```

#### **Error Handling:**
```javascript
try {
  const cars = await api.cars.getAll();
} catch (error) {
  // Error already has user-friendly message
  toast.error(error.message);

  // Check error type
  if (error.response?.status === 404) {
    // Handle not found
  }
}
```

#### **Cache Management:**
```javascript
// Clear specific endpoint cache
api.clearCache('/cars');

// Clear all cache
api.clearCache();

// Cache is auto-cleared on mutations
await api.cars.create(newCar); // Clears /cars cache automatically
```

#### **Custom Requests:**
```javascript
// Use axios instance directly for custom requests
const response = await api.client.get('/custom-endpoint', {
  params: { foo: 'bar' },
  headers: { 'X-Custom': 'value' }
});
```

### Benefits:

✅ **DRY Code** - No repeated fetch/retry/error handling logic
✅ **Type Safety** - Centralized API definitions
✅ **Better Performance** - Response caching reduces server load
✅ **Reliability** - Automatic retry on failures
✅ **User Experience** - User-friendly error messages
✅ **Debugging** - Development logging for troubleshooting
✅ **Maintainability** - Single place to update API configuration
✅ **Scalability** - Easy to add new endpoints

### Advanced Features:

#### **Adding Authentication:**
```javascript
// Add to request interceptor in api.js
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);
```

#### **Response Transformation:**
```javascript
// Add to response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Transform data format
    if (response.data.data) {
      response.data = response.data.data;
    }
    return response;
  }
);
```

#### **Request Cancellation:**
```javascript
const controller = new AbortController();

api.client.get('/api/cars', {
  signal: controller.signal
});

// Cancel request
controller.abort();
```

### Testing:

**Test Retry Logic:**
1. Stop the backend server
2. Try to fetch data - will see retry attempts in console
3. After 3 failed attempts, error is shown to user

**Test Caching:**
1. Open DevTools Network tab
2. Call `api.cars.getAll()` - see network request
3. Call `api.cars.getAll()` again - no network request (cached)
4. Wait 5 minutes - cache expires
5. Call again - see new network request

**Test Timeout:**
1. Add artificial delay in backend (e.g., `await new Promise(r => setTimeout(r, 15000))`)
2. Try to fetch - will timeout after 10 seconds
3. Shows "Request timeout" error message

### Future Enhancements:

- [ ] Add request deduplication (prevent duplicate concurrent requests)
- [ ] Add pagination helpers
- [ ] Add request queue for offline support
- [ ] Add response compression
- [ ] Add request/response encryption
- [ ] Add API versioning support
- [ ] Add rate limiting
- [ ] Add request mocking for tests
- [ ] Add GraphQL support
- [ ] Add WebSocket integration

### Migration Notes:

All components have been migrated from:
- Raw `fetch()` calls → `api.client` or specific `api.*` methods
- Manual retry logic → Automatic retry
- Manual error handling → Centralized error handling
- Manual caching → Automatic caching

No breaking changes to component functionality - all existing features work the same but with improved reliability and performance.

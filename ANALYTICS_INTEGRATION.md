# Google Analytics 4 Integration

## ✅ Complete Implementation

### Installed Packages:
- **react-ga4** v2.1.0+ - React wrapper for Google Analytics 4

### Configuration:

#### 1. Environment Variable
Add to `.env` file:
```bash
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Get your Measurement ID from [Google Analytics](https://analytics.google.com/)

#### 2. Initialization
Google Analytics is initialized automatically on app mount in `App.jsx`:
```javascript
useEffect(() => {
  initGA();
}, []);
```

### Features Implemented:

## 📊 **Page View Tracking**

Automatically tracks page views when users navigate:

```javascript
// Tracked pages:
- Home (/)
- Cars (/cars)
- Booking (/booking/:id)
- Contact Us (/contact-us)
- Terms of Service (/terms-of-service)
- About Us (/about-us)
- Admin Dashboard (/admin)
```

**Implementation:**
```javascript
trackPageView(location.pathname, pageTitle);
```

## 🛒 **Booking Funnel Tracking**

Complete booking journey tracking with 9 steps:

### 1. **View Car Details**
```javascript
trackBookingFunnel.viewCarDetails(carData);
```
Tracks when user views a car's details.

### 2. **Click Book Now**
```javascript
trackBookingFunnel.clickBookNow(carData);
```
Tracks when user clicks "Book Now" button.

### 3. **Select Dates**
```javascript
trackBookingFunnel.selectDates(days, pickupDate, returnDate);
```
Tracks when user selects rental dates.

### 4. **Select Insurance**
```javascript
trackBookingFunnel.selectInsurance(insuranceType, price);
```
Tracks insurance selection (basic/full/premium).

### 5. **Add Services**
```javascript
trackBookingFunnel.addService(serviceName, price);
```
Tracks additional services (GPS, WiFi, child seat, airport pickup).

###6. **Fill Customer Info**
```javascript
trackBookingFunnel.fillCustomerInfo();
```
Tracks when user completes customer information form.

### 7. **Upload Documents**
```javascript
trackBookingFunnel.uploadDocuments();
```
Tracks when user uploads ID and passport documents.

### 8. **Submit Booking**
```javascript
trackBookingFunnel.submitBooking(totalPrice, carType, days);
```
Tracks booking submission attempt.

### 9. **Booking Success/Failure**
```javascript
// Success
trackBookingFunnel.bookingSuccess(totalPrice, carType, bookingId);

// Failure
trackBookingFunnel.bookingFailed(errorMessage);
```
Tracks booking outcome and sends conversion event.

**Conversion Tracking:**
Successful bookings send a `purchase` event:
```javascript
ReactGA.event('purchase', {
  transaction_id: bookingId,
  value: totalPrice,
  currency: 'JOD',
  items: [{
    item_id: carType,
    item_name: carType,
    price: totalPrice,
    quantity: days
  }]
});
```

## 🔍 **Car Search Tracking**

Tracks user interactions with car listings:

### Filter Cars
```javascript
trackCarSearch.filterCars(filterType, filterValue);
```
Tracks when users apply filters:
- Category filter (sedan, SUV, luxury, etc.)
- Price range filter (low, medium, high)

### View Car
```javascript
trackCarSearch.viewCar(carBrand, carType);
```
Tracks when user views a car card.

### Change Currency
```javascript
trackCarSearch.changeCurrency(currency);
```
Tracks currency changes (JOD ↔ USD).

## 📧 **Contact Form Tracking**

Tracks contact form interactions:

### Start Form
```javascript
trackContactForm.startForm();
```
Tracks when user begins filling contact form.

### Submit Form
```javascript
trackContactForm.submitForm(subject);
```
Tracks form submission with subject.

### Success/Failure
```javascript
// Success
trackContactForm.submitSuccess();

// Failure
trackContactForm.submitFailed(errorMessage);
```
Tracks form submission outcome.

## 🔘 **Button Click Tracking**

Generic button click tracking:

```javascript
trackButtonClick('Button Name', 'Page Location', { additionalData });
```

Examples:
```javascript
// Header buttons
trackButtonClick('View All Cars', 'HomePage Hero');
trackButtonClick('Contact Us', 'Header Navigation');

// Social media links
trackButtonClick('WhatsApp', 'Footer');
trackButtonClick('Facebook', 'Contact Page');
```

## 🌐 **Social Media Tracking**

Tracks social media link clicks:

```javascript
trackSocialClick(platform, location);
```

Examples:
```javascript
trackSocialClick('facebook', 'footer');
trackSocialClick('whatsapp', 'contact-page');
trackSocialClick('instagram', 'header');
```

## ⚠️ **Error Tracking**

Tracks errors for debugging:

```javascript
trackError(errorType, errorMessage, location);
```

Examples:
```javascript
trackError('API Error', 'Failed to fetch cars', 'CarsPage');
trackError('Validation Error', 'Invalid email format', 'ContactForm');
trackError('Network Error', 'Connection timeout', 'BookingPage');
```

## 🌍 **User Preferences Tracking**

Tracks user preference changes:

### Language Change
```javascript
trackLanguageChange(newLanguage);
```
Tracks when users switch between English and Arabic.

## ⏱️ **Timing Tracking**

Tracks performance metrics:

```javascript
trackTiming(category, variable, value, label);
```

Examples:
```javascript
// API response times
trackTiming('API', 'getCars', 234, 'CarsPage');

// Page load times
trackTiming('Page Load', 'HomePage', 1200, 'Initial Load');

// Form submission times
trackTiming('Form', 'Booking Submission', 567, 'Success');
```

## 📈 Analytics Dashboard

### Key Metrics to Track:

**1. Conversion Funnel**
- Car views → Book clicks → Date selections → Bookings

**2. Top Performing Cars**
- Most viewed cars
- Most booked cars
- Revenue by car type

**3. User Behavior**
- Popular filters
- Average booking value
- Currency preference distribution
- Language preference distribution

**4. Form Performance**
- Contact form completion rate
- Booking form abandonment points
- Common validation errors

**5. Traffic Sources**
- Direct vs organic vs referral
- Social media performance
- Landing page effectiveness

## 🔧 Development vs Production

**Development Mode:**
- Analytics events logged to console
- No data sent to Google Analytics
- Debug mode enabled

**Production Mode:**
- Events sent to Google Analytics
- No console logging
- Full tracking enabled

Check mode:
```javascript
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;
```

## 📝 Usage Examples:

### Example 1: Track Car View
```javascript
import { trackCarSearch } from '../utils/analytics';

const CarCard = ({ car }) => {
  const handleClick = () => {
    trackCarSearch.viewCar(car.car_barnd, car.car_type);
    // Navigate to car details...
  };

  return <div onClick={handleClick}>...</div>;
};
```

### Example 2: Track Form Interaction
```javascript
import { trackContactForm } from '../utils/analytics';

const ContactForm = () => {
  const handleFocus = () => {
    trackContactForm.startForm();
  };

  const handleSubmit = async (data) => {
    try {
      await submitForm(data);
      trackContactForm.submitSuccess();
    } catch (error) {
      trackContactForm.submitFailed(error.message);
    }
  };

  return <form onFocus={handleFocus} onSubmit={handleSubmit}>...</form>;
};
```

### Example 3: Track Button Click
```javascript
import { trackButtonClick } from '../utils/analytics';

const Hero = () => {
  return (
    <button
      onClick={() => {
        trackButtonClick('Book Now', 'Hero Section', { carId: 123 });
        navigate('/booking/123');
      }}
    >
      Book Now
    </button>
  );
};
```

## 🚀 Setup Instructions:

### 1. Get Google Analytics Measurement ID

1. Go to [Google Analytics](https://analytics.google.com/)
2. Create a new GA4 property (or use existing)
3. Go to Admin → Property → Data Streams
4. Select your web stream
5. Copy the Measurement ID (format: `G-XXXXXXXXXX`)

### 2. Configure Environment Variable

Create/update `.env` file:
```bash
VITE_GA_MEASUREMENT_ID=G-YOUR-ACTUAL-ID
```

⚠️ **Important:** Never commit `.env` file to git!

### 3. Verify Installation

1. Start the application
2. Open browser DevTools → Console
3. Look for: `[Analytics] Google Analytics initialized: G-XXXXXXXXXX`
4. Visit different pages and check console for tracking events

### 4. Test in Production

1. Build the app: `npm run build`
2. Deploy to production
3. Go to Google Analytics → Reports → Realtime
4. Navigate through your site and see events appear in real-time

## 📊 Custom Events

To add new custom events:

```javascript
// In src/utils/analytics.js
export const trackCustomEvent = (action, label, value) => {
  if (!isEnabled()) {
    if (isDevelopment) {
      console.log('[Analytics] Custom Event:', { action, label, value });
    }
    return;
  }

  ReactGA.event({
    category: 'Custom',
    action: action,
    label: label,
    value: value,
  });
};
```

## 🛡️ Privacy & GDPR

**Current Implementation:**
- No cookies stored by default
- No personal data tracked
- IP anonymization enabled in GA4
- Only behavioral/interaction data collected

**Recommended Additions:**
- [ ] Add cookie consent banner
- [ ] Allow users to opt-out of tracking
- [ ] Add privacy policy mentioning analytics
- [ ] Implement data deletion requests

## 📖 Event Reference

| Category | Action | Label | Value | Description |
|----------|--------|-------|-------|-------------|
| Booking Funnel | View Car Details | Car Name | Price/day | User views car details |
| Booking Funnel | Click Book Now | Car Name | Price/day | User clicks book button |
| Booking Funnel | Select Dates | X days | Days | User selects rental dates |
| Booking Funnel | Select Insurance | Insurance Type | Price | User selects insurance |
| Booking Funnel | Add Additional Service | Service Name | Price | User adds service |
| Booking Funnel | Submit Booking | Car Type | Total Price | User submits booking |
| Booking Funnel | Booking Confirmed | Car Type - ID | Total Price | Booking successful |
| Car Search | Apply Filter | Filter: Value | - | User applies filter |
| Car Search | View Car Card | Car Name | - | User views car in list |
| Car Search | Change Currency | Currency | - | User changes currency |
| Contact Form | Start Form | - | - | User focuses on form |
| Contact Form | Submit Form | Subject | - | User submits form |
| Contact Form | Form Submitted Successfully | - | - | Form submission success |
| Button Click | Button Name | Location | - | Generic button click |
| Social Media | Click | Platform - Location | - | Social media link click |
| Error | Error Type | Location: Message | - | Error occurred |
| User Preferences | Change Language | Language | - | User changes language |

## 🔍 Troubleshooting:

**Events not appearing in GA:**
1. Check Measurement ID is correct
2. Verify `.env` file is loaded
3. Check browser console for errors
4. Wait 24-48 hours for historical data (real-time should be instant)

**Console warnings:**
```
[Analytics] GA Measurement ID not configured
```
→ Add `VITE_GA_MEASUREMENT_ID` to `.env`

**Events logged but not sent:**
```
[Analytics] Page View: { path: '/', title: 'Home' }
```
→ This is normal in development mode

## 📈 Next Steps:

- [ ] Set up Google Analytics 4 goals/conversions
- [ ] Configure enhanced measurement in GA4
- [ ] Set up custom dashboards
- [ ] Create audience segments
- [ ] Set up alerts for key metrics
- [ ] Integrate with Google Tag Manager (optional)
- [ ] Add heatmap tracking (optional)
- [ ] Implement A/B testing (optional)

## 🎯 KPIs to Monitor:

1. **Conversion Rate:** Booking submissions / Total visitors
2. **Funnel Drop-off:** Where users leave the booking process
3. **Average Order Value:** Total revenue / Number of bookings
4. **Popular Cars:** Most viewed and booked vehicles
5. **User Engagement:** Pages per session, session duration
6. **Form Completion:** Contact form submissions / Form starts
7. **Currency Usage:** JOD vs USD preference
8. **Language Preference:** EN vs AR usage
9. **Error Rate:** Errors / Total interactions
10. **Device Breakdown:** Mobile vs desktop usage

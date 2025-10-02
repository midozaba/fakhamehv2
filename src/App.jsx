import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./index.css";
import { useTranslation } from "./utils/translations";
import { AppProvider, useApp } from "./context/AppContext";
import api from "./services/api";
import { initGA, trackPageView, trackBookingFunnel } from "./utils/analytics";
import Header from "./components/Header";
import HomePage from "./components/HomePage";
import CarsPage from "./components/CarsPage";
import BookingPage from "./components/BookingPage";
import ContactUs from "./components/ContactUs";
import TermsOfService from "./components/TermsOfService";
import AboutUs from "./components/AboutUs";
import AdminPage from "./components/AdminPage";
import NotFound from "./components/NotFound";
import Footer from "./components/Footer";
import ChatBot from "./components/ChatBot";

// Main App Layout Component (needs to be inside Router and AppProvider)
const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    language,
    handleLanguageChange,
    currency,
    setCurrency,
    selectedCar,
    setSelectedCar,
    bookingData,
    setBookingData,
    searchFilters,
    setSearchFilters,
    isTransitioning,
    setIsSubmitting
  } = useApp();

  const t = useTranslation(language);

  // Scroll to top on route change and track page views
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Track page view in Google Analytics
    const pageTitle = {
      '/': 'Home',
      '/cars': 'Cars',
      '/booking': 'Booking',
      '/contact-us': 'Contact Us',
      '/terms-of-service': 'Terms of Service',
      '/about-us': 'About Us',
      '/admin': 'Admin Dashboard'
    }[location.pathname] || 'Page';

    trackPageView(location.pathname, pageTitle);
  }, [location.pathname]);

  const handleBookingSubmit = async () => {
    const { name, email, phone, license, street, city, country, area, postalCode, idDocument, passportDocument } = bookingData.customerInfo;

    // Validate using Yup schema
    try {
      const { getBookingSchema } = await import('./utils/validationSchemas');
      const schema = getBookingSchema(language);

      // Prepare data for validation
      const dataToValidate = {
        name,
        email,
        phone,
        license,
        street,
        city,
        area: area || '',
        postalCode: postalCode || '',
        country,
        pickupDate: bookingData.pickupDate,
        returnDate: bookingData.returnDate,
        insurance: bookingData.insurance,
        idDocument,
        passportDocument
      };

      await schema.validate(dataToValidate, { abortEarly: false });
    } catch (validationError) {
      // Import toast for error display
      const { toast } = await import('react-toastify');

      if (validationError.inner && validationError.inner.length > 0) {
        // Show first error
        toast.error(validationError.inner[0].message, { autoClose: 5000 });
      } else {
        toast.error(validationError.message, { autoClose: 5000 });
      }
      return;
    }

    try {
      setIsSubmitting(true);

      // Import toast dynamically
      const { toast } = await import('react-toastify');

      // Prepare form data
      const formData = new FormData();

      // Calculate pricing
      const { calculatePrice } = await import('./utils/carHelpers');
      const pricing = calculatePrice(selectedCar, bookingData);

      const bookingPayload = {
        car: selectedCar,
        pickupDate: bookingData.pickupDate,
        returnDate: bookingData.returnDate,
        days: bookingData.days,
        insurance: bookingData.insurance,
        additionalServices: bookingData.additionalServices,
        customerInfo: {
          name,
          email,
          phone,
          license,
          street,
          city,
          area: bookingData.customerInfo.area || '',
          postalCode: bookingData.customerInfo.postalCode || '',
          country
        },
        pricing
      };

      formData.append('bookingData', JSON.stringify(bookingPayload));
      formData.append('idDocument', idDocument);
      formData.append('passportDocument', passportDocument);

      // Show loading toast
      toast.info(language === 'ar' ? 'جاري إرسال الحجز...' : 'Submitting booking...', {
        autoClose: false,
        toastId: 'booking-loading'
      });

      // Track booking submission
      trackBookingFunnel.submitBooking(
        pricing.total,
        `${selectedCar.car_barnd} ${selectedCar.car_type}`,
        bookingData.days
      );

      // Submit using API service (with automatic retry)
      const result = await api.bookings.create(formData);

      // Close loading toast
      toast.dismiss('booking-loading');

      // Track booking success
      const bookingId = result?.id || Date.now();
      trackBookingFunnel.bookingSuccess(
        pricing.total,
        `${selectedCar.car_barnd} ${selectedCar.car_type}`,
        bookingId
      );

      toast.success(language === 'ar'
        ? 'تم إرسال الحجز بنجاح! سنتواصل معك قريباً.'
        : 'Booking submitted successfully! We will contact you shortly.', {
        autoClose: 5000
      });

      // Reset and navigate
      setTimeout(() => {
        navigate("/");
        setSelectedCar(null);
        setBookingData({
          pickupDate: "",
          returnDate: "",
          days: 1,
          insurance: "",
          additionalServices: [],
          customerInfo: {
            name: "",
            email: "",
            phone: "",
            license: "",
          },
        });
      }, 2000);
    } catch (error) {
      const { toast } = await import('react-toastify');
      toast.dismiss('booking-loading');

      // Track booking failure
      trackBookingFunnel.bookingFailed(error.message);

      toast.error(language === 'ar'
        ? `خطأ في الاتصال: ${error.message}`
        : `Connection error: ${error.message}`, {
        autoClose: 5000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-gray-50"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      {location.pathname !== '/admin' && <Header />}

      <main className="relative overflow-hidden">
        <div
          className={`transition-all duration-300 ease-in-out ${
            isTransitioning
              ? 'opacity-0 transform translate-y-4'
              : 'opacity-100 transform translate-y-0'
          }`}
        >
          <Routes>
            <Route
              path="/"
              element={<HomePage />}
            />
            <Route
              path="/cars"
              element={<CarsPage />}
            />
            <Route
              path="/booking/:carId?"
              element={<BookingPage handleBookingSubmit={handleBookingSubmit} />}
            />
            <Route
              path="/contact-us"
              element={<ContactUs />}
            />
            <Route
              path="/terms-of-service"
              element={<TermsOfService />}
            />
            <Route
              path="/about-us"
              element={<AboutUs />}
            />
            <Route
              path="/admin"
              element={<AdminPage />}
            />
            <Route
              path="*"
              element={<NotFound />}
            />
          </Routes>
        </div>
      </main>

      {location.pathname !== '/admin' && <Footer />}
      {location.pathname !== '/admin' && <ChatBot />}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={language === 'ar'}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

const App = () => {
  // Initialize Google Analytics on app mount
  useEffect(() => {
    initGA();
  }, []);

  return (
    <HelmetProvider>
      <Router>
        <AppProvider>
          <AppLayout />
        </AppProvider>
      </Router>
    </HelmetProvider>
  );
};

export default App;

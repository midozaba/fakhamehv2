import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./index.css";
import { useTranslation } from "./utils/translations";
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

// Detect browser language
const getBrowserLanguage = () => {
  const browserLang = navigator.language || navigator.userLanguage;
  if (browserLang.startsWith('ar')) {
    return 'ar';
  }
  return 'en';
};

// Main App Layout Component (needs to be inside Router)
const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [language, setLanguage] = useState(getBrowserLanguage());
  const [currency, setCurrency] = useState("JOD");
  const [selectedCar, setSelectedCar] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    category: "all",
    priceRange: "all",
  });
  const [bookingData, setBookingData] = useState({
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

  const t = useTranslation(language);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  // Smooth language change handler
  const handleLanguageChange = (newLanguage) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setLanguage(newLanguage);
      setIsTransitioning(false);
    }, 150);
  };

  const handleBookingSubmit = async () => {
    const { name, email, phone, license, street, city, country, idDocument, passportDocument } = bookingData.customerInfo;

    // Validate required fields
    if (
      !name ||
      !email ||
      !phone ||
      !license ||
      !street ||
      !city ||
      !country ||
      !bookingData.pickupDate ||
      !bookingData.returnDate ||
      !bookingData.insurance
    ) {
      alert(t("fillAllFields"));
      return;
    }

    // Validate documents
    if (!idDocument || !passportDocument) {
      alert(language === 'ar' ? 'يرجى تحميل المستندات المطلوبة' : 'Please upload required documents');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert(language === 'ar' ? 'البريد الإلكتروني غير صالح' : 'Invalid email format');
      return;
    }

    // Validate dates
    const pickupDate = new Date(bookingData.pickupDate);
    const returnDate = new Date(bookingData.returnDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (pickupDate < today) {
      alert(language === 'ar' ? 'تاريخ الاستلام لا يمكن أن يكون في الماضي' : 'Pickup date cannot be in the past');
      return;
    }

    if (returnDate <= pickupDate) {
      alert(language === 'ar' ? 'تاريخ الإرجاع يجب أن يكون بعد تاريخ الاستلام' : 'Return date must be after pickup date');
      return;
    }

    try {
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

      // Submit to backend
      const response = await fetch('http://localhost:3001/api/bookings', {
        method: 'POST',
        body: formData
      });

      // Close loading toast
      toast.dismiss('booking-loading');

      if (response.ok) {
        const result = await response.json();
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
      } else {
        const error = await response.json();
        toast.error(language === 'ar'
          ? `فشل إرسال الحجز: ${error.error || 'خطأ غير معروف'}`
          : `Failed to submit booking: ${error.error || 'Unknown error'}`, {
          autoClose: 5000
        });
      }
    } catch (error) {
      const { toast } = await import('react-toastify');
      toast.dismiss('booking-loading');
      toast.error(language === 'ar'
        ? `خطأ في الاتصال: ${error.message}`
        : `Connection error: ${error.message}`, {
        autoClose: 5000
      });
    }
  };

  return (
    <div
      className="min-h-screen bg-gray-50"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <Header
        language={language}
        setLanguage={handleLanguageChange}
        currency={currency}
        setCurrency={setCurrency}
      />

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
              element={
                <HomePage
                  language={language}
                  setSelectedCar={setSelectedCar}
                  currency={currency}
                />
              }
            />
            <Route
              path="/cars"
              element={
                <CarsPage
                  language={language}
                  searchFilters={searchFilters}
                  setSearchFilters={setSearchFilters}
                  setSelectedCar={setSelectedCar}
                  currency={currency}
                />
              }
            />
            <Route
              path="/booking/:carId?"
              element={
                <BookingPage
                  language={language}
                  selectedCar={selectedCar}
                  bookingData={bookingData}
                  setBookingData={setBookingData}
                  handleBookingSubmit={handleBookingSubmit}
                  currency={currency}
                />
              }
            />
            <Route
              path="/contact-us"
              element={<ContactUs language={language} />}
            />
            <Route
              path="/terms-of-service"
              element={<TermsOfService language={language} />}
            />
            <Route
              path="/about-us"
              element={<AboutUs language={language} />}
            />
            <Route
              path="/admin"
              element={<AdminPage language={language} />}
            />
            <Route
              path="*"
              element={<NotFound language={language} />}
            />
          </Routes>
        </div>
      </main>

      <Footer language={language} />
      <ChatBot language={language} />
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
  return (
    <Router>
      <AppLayout />
    </Router>
  );
};

export default App;

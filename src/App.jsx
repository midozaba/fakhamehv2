import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";
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

  const handleBookingSubmit = () => {
    const { name, email, phone, license } = bookingData.customerInfo;
    if (
      !name ||
      !email ||
      !phone ||
      !license ||
      !bookingData.pickupDate ||
      !bookingData.returnDate
    ) {
      alert(t("fillAllFields"));
      return;
    }

    console.log("Booking Data:", {
      car: selectedCar,
      booking: bookingData,
    });

    alert(t("bookingSuccess"));
    navigate("/");
    setSelectedCar(null);
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
              path="/contact"
              element={<ContactUs language={language} />}
            />
            <Route
              path="/terms"
              element={<TermsOfService language={language} />}
            />
            <Route
              path="/about"
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

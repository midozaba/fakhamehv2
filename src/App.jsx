import React, { useState } from "react";
import "./index.css";
import { useTranslation } from "./utils/translations";
import Header from "./components/Header";
import HomePage from "./components/HomePage";
import CarsPage from "./components/CarsPage";
import BookingPage from "./components/BookingPage";
import ContactUs from "./components/ContactUs";
import Footer from "./components/Footer";
import ChatBot from "./components/ChatBot";

const App = () => {
  const [language, setLanguage] = useState("ar");
  const [currentPage, setCurrentPage] = useState("home");
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

  // Smooth page transition handler
  const handlePageChange = (newPage) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentPage(newPage);
      setIsTransitioning(false);
      // Scroll to top after page change
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 150); // Half of transition duration
  };

  // Smooth language change handler
  const handleLanguageChange = (newLanguage) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setLanguage(newLanguage);
      setIsTransitioning(false);
       window.scrollTo({ top: 0, behavior: 'smooth' });
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
    handlePageChange("home");
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
        currentPage={currentPage}
        setCurrentPage={handlePageChange}
      />

      <main className="relative overflow-hidden">
        <div
          className={`transition-all duration-300 ease-in-out ${
            isTransitioning
              ? 'opacity-0 transform translate-y-4'
              : 'opacity-100 transform translate-y-0'
          }`}
        >
          {currentPage === "home" && (
            <HomePage
              language={language}
              setCurrentPage={handlePageChange}
              setSelectedCar={setSelectedCar}
            />
          )}
          {currentPage === "cars" && (
            <CarsPage
              language={language}
              searchFilters={searchFilters}
              setSearchFilters={setSearchFilters}
              setSelectedCar={setSelectedCar}
              setCurrentPage={handlePageChange}
            />
          )}
          {currentPage === "booking" && selectedCar && (
            <BookingPage
              language={language}
              selectedCar={selectedCar}
              bookingData={bookingData}
              setBookingData={setBookingData}
              setCurrentPage={handlePageChange}
              handleBookingSubmit={handleBookingSubmit}
            />
          )}
          {currentPage === "contact-us" && (
            <ContactUs
              language={language}
            />
          )}
        </div>
      </main>

      <Footer language={language} />
      <ChatBot language={language} />
    </div>
  );
};

export default App;

import React, { useState } from "react";
import "./index.css";
import { useTranslation } from "./utils/translations";
import Header from "./components/Header";
import HomePage from "./components/HomePage";
import CarsPage from "./components/CarsPage";
import BookingPage from "./components/BookingPage";
import Footer from "./components/Footer";
import ChatBot from "./components/ChatBot";

const App = () => {
  const [language, setLanguage] = useState("ar");
  const [currentPage, setCurrentPage] = useState("home");
  const [selectedCar, setSelectedCar] = useState(null);
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
    setCurrentPage("home");
    setSelectedCar(null);
  };

  return (
    <div
      className="min-h-screen bg-gray-50"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <Header
        language={language}
        setLanguage={setLanguage}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      <main>
        {currentPage === "home" && (
          <HomePage
            language={language}
            setCurrentPage={setCurrentPage}
            setSelectedCar={setSelectedCar}
          />
        )}
        {currentPage === "cars" && (
          <CarsPage
            language={language}
            searchFilters={searchFilters}
            setSearchFilters={setSearchFilters}
            setSelectedCar={setSelectedCar}
            setCurrentPage={setCurrentPage}
          />
        )}
        {currentPage === "booking" && selectedCar && (
          <BookingPage
            language={language}
            selectedCar={selectedCar}
            bookingData={bookingData}
            setBookingData={setBookingData}
            setCurrentPage={setCurrentPage}
            handleBookingSubmit={handleBookingSubmit}
          />
        )}
      </main>

      <Footer language={language} />
      <ChatBot language={language} />
    </div>
  );
};

export default App;

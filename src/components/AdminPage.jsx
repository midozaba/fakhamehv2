/*eslint-disable */
import React, { useState } from "react";
import carsData from "../data/cars.json";

const AdminPage = ({ language }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState("contacts");

  // Mock data - will be replaced with real data later
  const [contactResponses] = useState([
    {
      id: 1,
      name: "Ahmad Hassan",
      email: "ahmad@example.com",
      phone: "+962 77 123 4567",
      subject: "Car Rental Inquiry",
      message: "I'm interested in renting a luxury car for a week.",
      date: "2025-09-28",
      status: "new"
    },
    {
      id: 2,
      name: "Sara Mohammed",
      email: "sara@example.com",
      phone: "+962 79 987 6543",
      subject: "Booking Question",
      message: "Do you offer airport pickup service?",
      date: "2025-09-27",
      status: "read"
    },
    {
      id: 3,
      name: "Omar Ali",
      email: "omar@example.com",
      phone: "+962 78 555 1234",
      subject: "Special Request",
      message: "Can I rent a car for a wedding event?",
      date: "2025-09-26",
      status: "responded"
    }
  ]);

  const [bookings, setBookings] = useState([
    {
      id: 1,
      customerName: "Khaled Ibrahim",
      email: "khaled@example.com",
      phone: "+962 77 111 2222",
      carName: "Mercedes S-Class",
      pickupDate: "2025-10-05",
      returnDate: "2025-10-10",
      days: 5,
      totalPrice: "350 JOD",
      status: "pending",
      insurance: "Full Coverage",
      license: "123456789",
      address: {
        street: "King Abdullah II Street, Building 25",
        city: "Amman",
        area: "Abdoun",
        postalCode: "11941",
        country: "Jordan"
      },
      idDocumentUrl: "https://example.com/documents/khaled-id.jpg",
      passportDocumentUrl: "https://example.com/documents/khaled-passport.jpg"
    },
    {
      id: 2,
      customerName: "Layla Mahmoud",
      email: "layla@example.com",
      phone: "+962 79 333 4444",
      carName: "BMW 5 Series",
      pickupDate: "2025-10-03",
      returnDate: "2025-10-07",
      days: 4,
      totalPrice: "280 JOD",
      status: "pending",
      insurance: "Basic",
      license: "987654321",
      address: {
        street: "Mecca Street, Al-Rabia Complex",
        city: "Amman",
        area: "Shmeisani",
        postalCode: "11953",
        country: "Jordan"
      },
      idDocumentUrl: "https://example.com/documents/layla-id.jpg",
      passportDocumentUrl: "https://example.com/documents/layla-passport.jpg"
    },
    {
      id: 3,
      customerName: "Fadi Nasser",
      email: "fadi@example.com",
      phone: "+962 78 999 8888",
      carName: "Toyota Camry",
      pickupDate: "2025-09-30",
      returnDate: "2025-10-02",
      days: 2,
      totalPrice: "80 JOD",
      status: "confirmed",
      insurance: "Full Coverage",
      license: "456789123",
      address: {
        street: "Gardens Street, Villa 12",
        city: "Amman",
        area: "Gardens",
        postalCode: "11194",
        country: "Jordan"
      },
      idDocumentUrl: "https://example.com/documents/fadi-id.jpg",
      passportDocumentUrl: "https://example.com/documents/fadi-passport.jpg"
    }
  ]);

  const [reviews, setReviews] = useState([
    {
      id: 1,
      customerName: "Ahmed Mohammed",
      customerNameAr: "أحمد محمد",
      rating: 5,
      comment: "Excellent service and clean cars. Highly recommended!",
      commentAr: "خدمة ممتازة وسيارات نظيفة. أنصح بشدة!",
      date: "2025-09-25",
      isApproved: true
    },
    {
      id: 2,
      customerName: "Sarah Ali",
      customerNameAr: "سارة علي",
      rating: 5,
      comment: "Reasonable prices and very professional staff",
      commentAr: "أسعار معقولة وموظفين محترفين جداً",
      date: "2025-09-24",
      isApproved: true
    },
    {
      id: 3,
      customerName: "Khaled Hassan",
      customerNameAr: "خالد حسن",
      rating: 5,
      comment: "Great experience! The car was in excellent condition",
      commentAr: "تجربة رائعة! السيارة كانت بحالة ممتازة",
      date: "2025-09-23",
      isApproved: true
    }
  ]);

  const [newReview, setNewReview] = useState({
    customerName: "",
    customerNameAr: "",
    rating: 5,
    comment: "",
    commentAr: ""
  });

  const [cars, setCars] = useState(carsData);
  const [newCar, setNewCar] = useState({
    car_barnd: "",
    CAR_TYPE: "",
    CAR_MODEL: new Date().getFullYear(),
    CAR_NUM: "",
    PRICEPERDAY: "",
    priceperweek: "",
    pricepermonth: "",
    car_color: "",
    MILEAGE: "",
    status: "available",
    image: ""
  });
  const [editingCar, setEditingCar] = useState(null);
  const [viewingDocuments, setViewingDocuments] = useState(null);

  const handleLogin = (e) => {
    e.preventDefault();
    // TODO: Implement actual authentication
    setIsLoggedIn(true);
  };

  const handleBookingApproval = (bookingId, approved) => {
    setBookings(bookings.map(booking =>
      booking.id === bookingId
        ? { ...booking, status: approved ? "confirmed" : "rejected" }
        : booking
    ));
  };

  const handleAddReview = (e) => {
    e.preventDefault();
    const review = {
      id: reviews.length + 1,
      ...newReview,
      date: new Date().toISOString().split('T')[0],
      isApproved: true
    };
    setReviews([review, ...reviews]);
    setNewReview({
      customerName: "",
      customerNameAr: "",
      rating: 5,
      comment: "",
      commentAr: ""
    });
  };

  const handleDeleteReview = (reviewId) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      setReviews(reviews.filter(review => review.id !== reviewId));
    }
  };

  const handleAddCar = (e) => {
    e.preventDefault();
    const car = {
      car_id: cars.length + 1,
      ...newCar,
      PRICEPERDAY: parseFloat(newCar.PRICEPERDAY),
      priceperweek: parseFloat(newCar.priceperweek),
      pricepermonth: parseFloat(newCar.pricepermonth),
      CAR_MODEL: parseInt(newCar.CAR_MODEL),
      CAR_NUM: parseInt(newCar.CAR_NUM),
      MILEAGE: newCar.MILEAGE ? parseInt(newCar.MILEAGE) : null,
      category_id: null,
      car_brand: null
    };
    setCars([...cars, car]);
    setNewCar({
      car_barnd: "",
      CAR_TYPE: "",
      CAR_MODEL: new Date().getFullYear(),
      CAR_NUM: "",
      PRICEPERDAY: "",
      priceperweek: "",
      pricepermonth: "",
      car_color: "",
      MILEAGE: "",
      status: "available",
      image: ""
    });
    // TODO: Send to backend API
    console.log("New car added:", car);
  };

  const handleEditCar = (car) => {
    setEditingCar(car);
    setNewCar({
      car_barnd: car.car_barnd,
      CAR_TYPE: car.CAR_TYPE,
      CAR_MODEL: car.CAR_MODEL,
      CAR_NUM: car.CAR_NUM,
      PRICEPERDAY: car.PRICEPERDAY,
      priceperweek: car.priceperweek,
      pricepermonth: car.pricepermonth,
      car_color: car.car_color,
      MILEAGE: car.MILEAGE || "",
      status: car.status,
      image: car.image || ""
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateCar = (e) => {
    e.preventDefault();
    const updatedCar = {
      ...editingCar,
      ...newCar,
      PRICEPERDAY: parseFloat(newCar.PRICEPERDAY),
      priceperweek: parseFloat(newCar.priceperweek),
      pricepermonth: parseFloat(newCar.pricepermonth),
      CAR_MODEL: parseInt(newCar.CAR_MODEL),
      CAR_NUM: parseInt(newCar.CAR_NUM),
      MILEAGE: newCar.MILEAGE ? parseInt(newCar.MILEAGE) : null
    };
    setCars(cars.map(car => car.car_id === editingCar.car_id ? updatedCar : car));
    setEditingCar(null);
    setNewCar({
      car_barnd: "",
      CAR_TYPE: "",
      CAR_MODEL: new Date().getFullYear(),
      CAR_NUM: "",
      PRICEPERDAY: "",
      priceperweek: "",
      pricepermonth: "",
      car_color: "",
      MILEAGE: "",
      status: "available",
      image: ""
    });
    // TODO: Send to backend API
    console.log("Car updated:", updatedCar);
  };

  const handleDeleteCar = (carId) => {
    if (window.confirm("Are you sure you want to delete this car?")) {
      setCars(cars.filter(car => car.car_id !== carId));
      // TODO: Send to backend API
      console.log("Car deleted:", carId);
    }
  };

  const handleCancelEdit = () => {
    setEditingCar(null);
    setNewCar({
      car_barnd: "",
      CAR_TYPE: "",
      CAR_MODEL: new Date().getFullYear(),
      CAR_NUM: "",
      PRICEPERDAY: "",
      priceperweek: "",
      pricepermonth: "",
      car_color: "",
      MILEAGE: "",
      status: "available",
      image: ""
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      new: "bg-blue-100 text-blue-800",
      read: "bg-yellow-100 text-yellow-800",
      responded: "bg-green-100 text-green-800",
      confirmed: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      completed: "bg-gray-100 text-gray-800",
      rejected: "bg-red-100 text-red-800",
      cancelled: "bg-red-100 text-red-800",
      available: "bg-green-100 text-green-800",
      rented: "bg-blue-100 text-blue-800",
      maintenance: "bg-orange-100 text-orange-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Login</h1>
              <p className="text-gray-600">Enter your credentials to access the dashboard</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="admin@fakhama.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <a href="#" className="text-sm text-blue-600 hover:text-blue-700">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-900 transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                Sign In
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-blue-900">Admin Dashboard</h1>
            <button
              onClick={() => setIsLoggedIn(false)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Contacts</p>
                <p className="text-3xl font-bold text-blue-900">{contactResponses.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Bookings</p>
                <p className="text-3xl font-bold text-blue-900">{bookings.length}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending Approval</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {bookings.filter(b => b.status === "pending").length}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Available Cars</p>
                <p className="text-3xl font-bold text-purple-600">
                  {cars.filter(c => c.status === "available").length}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Cars in Fleet</p>
                <p className="text-3xl font-bold text-indigo-600">{cars.length}</p>
              </div>
              <div className="bg-indigo-100 p-3 rounded-lg">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Customer Reviews</p>
                <p className="text-3xl font-bold text-pink-600">{reviews.length}</p>
              </div>
              <div className="bg-pink-100 p-3 rounded-lg">
                <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("contacts")}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "contacts"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                }`}
              >
                Contact Responses
              </button>
              <button
                onClick={() => setActiveTab("bookings")}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "bookings"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                }`}
              >
                Bookings
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "reviews"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                }`}
              >
                Customer Reviews
              </button>
              <button
                onClick={() => setActiveTab("cars")}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "cars"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                }`}
              >
                Manage Cars
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Contact Responses Tab */}
            {activeTab === "contacts" && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Form Submissions</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {contactResponses.map((contact) => (
                        <tr key={contact.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{contact.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{contact.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{contact.phone}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{contact.subject}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{contact.message}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{contact.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(contact.status)}`}>
                              {contact.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Bookings Tab */}
            {activeTab === "bookings" && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Customer Bookings</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Car</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pickup Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Return Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Insurance</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documents</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{booking.customerName}</div>
                            <div className="text-xs text-gray-500">License: {booking.license}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">{booking.email}</div>
                            <div className="text-xs text-gray-500">{booking.phone}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{booking.carName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{booking.pickupDate}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{booking.returnDate}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{booking.days}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{booking.insurance}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{booking.totalPrice}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => setViewingDocuments(booking)}
                              className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors flex items-center gap-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              View
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {booking.status === "pending" && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleBookingApproval(booking.id, true)}
                                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleBookingApproval(booking.id, false)}
                                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === "reviews" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Customer Reviews Management</h2>
                </div>

                {/* Add New Review Form */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Review</h3>
                  <form onSubmit={handleAddReview} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Customer Name (English)
                        </label>
                        <input
                          type="text"
                          value={newReview.customerName}
                          onChange={(e) => setNewReview({...newReview, customerName: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="John Doe"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Customer Name (Arabic)
                        </label>
                        <input
                          type="text"
                          value={newReview.customerNameAr}
                          onChange={(e) => setNewReview({...newReview, customerNameAr: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="أحمد محمد"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rating
                      </label>
                      <select
                        value={newReview.rating}
                        onChange={(e) => setNewReview({...newReview, rating: parseInt(e.target.value)})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value={5}>5 Stars - Excellent</option>
                        <option value={4}>4 Stars - Very Good</option>
                        <option value={3}>3 Stars - Good</option>
                        <option value={2}>2 Stars - Fair</option>
                        <option value={1}>1 Star - Poor</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Review Comment (English)
                      </label>
                      <textarea
                        value={newReview.comment}
                        onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Excellent service and clean cars..."
                        required
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Review Comment (Arabic)
                      </label>
                      <textarea
                        value={newReview.commentAr}
                        onChange={(e) => setNewReview({...newReview, commentAr: e.target.value})}
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="خدمة ممتازة وسيارات نظيفة..."
                        required
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add Review
                    </button>
                  </form>
                </div>

                {/* Reviews List */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">All Reviews ({reviews.length})</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-5 h-5 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                              </svg>
                            ))}
                          </div>
                          <button
                            onClick={() => handleDeleteReview(review.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        <div className="mb-2">
                          <p className="font-semibold text-gray-900">{review.customerName}</p>
                          <p className="text-sm text-gray-600 font-arabic">{review.customerNameAr}</p>
                        </div>
                        <p className="text-sm text-gray-700 mb-2 italic">"{review.comment}"</p>
                        <p className="text-sm text-gray-700 mb-2 italic font-arabic" dir="rtl">"{review.commentAr}"</p>
                        <p className="text-xs text-gray-500">{review.date}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Cars Management Tab */}
            {activeTab === "cars" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Car Fleet Management</h2>
                </div>

                {/* Add/Edit Car Form */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {editingCar ? "Edit Car" : "Add New Car"}
                  </h3>
                  <form onSubmit={editingCar ? handleUpdateCar : handleAddCar} className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Brand *
                        </label>
                        <input
                          type="text"
                          value={newCar.car_barnd}
                          onChange={(e) => setNewCar({...newCar, car_barnd: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Toyota, BMW, etc."
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Model/Type *
                        </label>
                        <input
                          type="text"
                          value={newCar.CAR_TYPE}
                          onChange={(e) => setNewCar({...newCar, CAR_TYPE: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Camry, X5, etc."
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Year *
                        </label>
                        <input
                          type="number"
                          value={newCar.CAR_MODEL}
                          onChange={(e) => setNewCar({...newCar, CAR_MODEL: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="2024"
                          min="1990"
                          max={new Date().getFullYear() + 1}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Car Number *
                        </label>
                        <input
                          type="number"
                          value={newCar.CAR_NUM}
                          onChange={(e) => setNewCar({...newCar, CAR_NUM: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="12345"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Color *
                        </label>
                        <input
                          type="text"
                          value={newCar.car_color}
                          onChange={(e) => setNewCar({...newCar, car_color: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="White, Black, etc."
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mileage
                        </label>
                        <input
                          type="number"
                          value={newCar.MILEAGE}
                          onChange={(e) => setNewCar({...newCar, MILEAGE: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="50000"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Price Per Day (JOD) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={newCar.PRICEPERDAY}
                          onChange={(e) => setNewCar({...newCar, PRICEPERDAY: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="30.00"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Price Per Week (JOD) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={newCar.priceperweek}
                          onChange={(e) => setNewCar({...newCar, priceperweek: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="28.00"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Price Per Month (JOD) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={newCar.pricepermonth}
                          onChange={(e) => setNewCar({...newCar, pricepermonth: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="25.00"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Status *
                        </label>
                        <select
                          value={newCar.status}
                          onChange={(e) => setNewCar({...newCar, status: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="available">Available</option>
                          <option value="rented">Rented</option>
                          <option value="maintenance">Under Maintenance</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Image URL
                        </label>
                        <input
                          type="text"
                          value={newCar.image}
                          onChange={(e) => setNewCar({...newCar, image: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://example.com/car.jpg (will add upload later)"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        {editingCar ? "Update Car" : "Add Car"}
                      </button>
                      {editingCar && (
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* Cars List */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">All Cars ({cars.length})</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand & Model</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Car #</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Color</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price/Day</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price/Week</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price/Month</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {cars.map((car) => (
                          <tr key={car.car_id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{car.car_id}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{car.car_barnd}</div>
                              <div className="text-xs text-gray-500">{car.CAR_TYPE}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{car.CAR_MODEL}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{car.CAR_NUM}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{car.car_color}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{car.PRICEPERDAY} JOD</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{car.priceperweek} JOD</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{car.pricepermonth} JOD</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(car.status)}`}>
                                {car.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditCar(car)}
                                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteCar(car.car_id)}
                                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Document Viewer Modal */}
      {viewingDocuments && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
          onClick={() => setViewingDocuments(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Customer Documents - {viewingDocuments.customerName}
              </h2>
              <button
                onClick={() => setViewingDocuments(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Booking Information</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <span className="ml-2 font-medium">{viewingDocuments.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Phone:</span>
                    <span className="ml-2 font-medium">{viewingDocuments.phone}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">License Number:</span>
                    <span className="ml-2 font-medium">{viewingDocuments.license}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Car:</span>
                    <span className="ml-2 font-medium">{viewingDocuments.carName}</span>
                  </div>
                </div>

                {/* Address Information */}
                {viewingDocuments.address && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2">Address</h4>
                    <div className="text-sm text-gray-700">
                      <p>{viewingDocuments.address.street}</p>
                      <p>
                        {viewingDocuments.address.area && `${viewingDocuments.address.area}, `}
                        {viewingDocuments.address.city}
                        {viewingDocuments.address.postalCode && ` ${viewingDocuments.address.postalCode}`}
                      </p>
                      <p>{viewingDocuments.address.country}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* ID Document */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">National ID / Residence Card</h3>
                  <a
                    href={viewingDocuments.idDocumentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </a>
                </div>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={viewingDocuments.idDocumentUrl}
                    alt="ID Document"
                    className="w-full h-auto"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="hidden w-full h-64 items-center justify-center bg-gray-100 text-gray-500">
                    <div className="text-center">
                      <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p>Document preview not available</p>
                      <p className="text-sm">Click download to view</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Passport Document */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Passport</h3>
                  <a
                    href={viewingDocuments.passportDocumentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </a>
                </div>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={viewingDocuments.passportDocumentUrl}
                    alt="Passport Document"
                    className="w-full h-auto"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="hidden w-full h-64 items-center justify-center bg-gray-100 text-gray-500">
                    <div className="text-center">
                      <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p>Document preview not available</p>
                      <p className="text-sm">Click download to view</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
              <button
                onClick={() => setViewingDocuments(null)}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;

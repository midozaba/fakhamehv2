/*eslint-disable */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import {
  getBookings,
  updateBookingStatus,
  getContactMessages,
  updateMessageStatus,
  getCars,
  getAdminStats,
  createCar,
  updateCar,
  deleteCar,
  getAdminUsers,
  getActionLogs,
  exportActionLogs
} from "../services/adminApi";
import { getImageUrl } from "../utils/carHelpers";

const AdminPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // State for dashboard stats
  const [stats, setStats] = useState(null);

  // State for bookings
  const [bookings, setBookings] = useState([]);
  const [bookingsFilter, setBookingsFilter] = useState("all");

  // State for contact messages
  const [contactMessages, setContactMessages] = useState([]);
  const [messagesFilter, setMessagesFilter] = useState("all");

  // State for cars
  const [cars, setCars] = useState([]);
  const [carsSearchTerm, setCarsSearchTerm] = useState('');
  const [carsStatusFilter, setCarsStatusFilter] = useState('all');
  const [showCarForm, setShowCarForm] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [carImageFile, setCarImageFile] = useState(null);
  const [carImagePreview, setCarImagePreview] = useState(null);
  const [carFormData, setCarFormData] = useState({
    car_barnd: '',
    car_type: '',
    car_model: new Date().getFullYear(),
    car_num: '',
    car_category: '',
    price_per_day: '',
    price_per_week: '',
    price_per_month: '',
    car_color: '',
    mileage: '',
    status: 'available',
    image_url: ''
  });

  // State for bulk upload
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [bulkUploadFiles, setBulkUploadFiles] = useState([]);
  const [bulkUploadResults, setBulkUploadResults] = useState(null);
  const [bulkUploading, setBulkUploading] = useState(false);

  // State for reviews
  const [reviews, setReviews] = useState([]);
  const [reviewsFilter, setReviewsFilter] = useState("all");

  // State for viewing documents
  const [viewingDocuments, setViewingDocuments] = useState(null);

  // State for activity logs (developer only)
  const [actionLogs, setActionLogs] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [logsFilter, setLogsFilter] = useState({
    startDate: '',
    endDate: '',
    adminId: '',
    action: '',
    entityType: '',
    limit: 100,
    offset: 0
  });
  const [logsPagination, setLogsPagination] = useState({ total: 0, limit: 100, offset: 0 });
  const [expandedLog, setExpandedLog] = useState(null);

  // Fetch dashboard stats
  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await getAdminStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      toast.error('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  // Fetch bookings
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const filters = bookingsFilter !== "all" ? { status: bookingsFilter } : {};
      const response = await getBookings(filters);
      if (response.success) {
        setBookings(response.data);
      }
    } catch (error) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  // Fetch contact messages
  const fetchMessages = async () => {
    try {
      setLoading(true);
      const filters = messagesFilter !== "all" ? { status: messagesFilter } : {};
      const response = await getContactMessages(filters);
      if (response.success) {
        setContactMessages(response.data);
      }
    } catch (error) {
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  // Fetch cars
  const fetchCars = async () => {
    try {
      setLoading(true);
      // Clear cache to ensure fresh data for admin
      if (window.apiClearCache) {
        window.apiClearCache('/cars');
      }
      // Admin needs to see ALL cars, including rented ones
      const response = await getCars({ status: 'all' });
      if (response.success) {
        setCars(response.data);
      }
    } catch (error) {
      toast.error('Failed to load cars');
    } finally {
      setLoading(false);
    }
  };

  // Filter cars based on search term and status
  const getFilteredCars = () => {
    let filtered = [...cars];

    // Filter by status
    if (carsStatusFilter !== 'all') {
      filtered = filtered.filter(car => car.status === carsStatusFilter);
    }

    // Filter by search term (car number or type)
    if (carsSearchTerm.trim()) {
      const searchLower = carsSearchTerm.toLowerCase().trim();
      filtered = filtered.filter(car =>
        car.car_num?.toString().includes(searchLower) ||
        car.car_type?.toLowerCase().includes(searchLower) ||
        car.car_barnd?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  };

  // Fetch reviews
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/reviews');
      if (response.ok) {
        const data = await response.json();
        let filteredReviews = data;
        if (reviewsFilter !== 'all') {
          filteredReviews = data.filter(r => r.status === reviewsFilter);
        }
        setReviews(filteredReviews);
      }
    } catch (error) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  // Fetch admin users (for developer role)
  const fetchAdminUsers = async () => {
    try {
      const response = await getAdminUsers();
      if (response.success) {
        setAdminUsers(response.data);
      }
    } catch (error) {
      console.error('Failed to load admin users');
    }
  };

  // Fetch action logs (for developer role)
  const fetchActionLogs = async () => {
    try {
      setLoading(true);
      const response = await getActionLogs(logsFilter);
      if (response.success) {
        setActionLogs(response.data);
        setLogsPagination({
          total: response.total,
          limit: response.limit,
          offset: response.offset
        });
      }
    } catch (error) {
      toast.error('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  // Handle export to Excel
  const handleExportLogs = async () => {
    try {
      await exportActionLogs(logsFilter);
      toast.success('Activity logs exported successfully');
    } catch (error) {
      toast.error('Failed to export activity logs');
    }
  };

  // Load current user from localStorage
  useEffect(() => {
    const user = localStorage.getItem('adminUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === "dashboard") {
      fetchStats();
    } else if (activeTab === "bookings") {
      fetchBookings();
    } else if (activeTab === "contacts") {
      fetchMessages();
    } else if (activeTab === "cars") {
      fetchCars();
    } else if (activeTab === "reviews") {
      fetchReviews();
    } else if (activeTab === "activity-logs" && currentUser?.role === 'developer') {
      fetchAdminUsers();
      fetchActionLogs();
    }
  }, [activeTab, bookingsFilter, messagesFilter, reviewsFilter]);

  // Reload logs when filter changes
  useEffect(() => {
    if (activeTab === "activity-logs" && currentUser?.role === 'developer') {
      fetchActionLogs();
    }
  }, [logsFilter]);

  // Scroll to top and lock body scroll when modal is open
  useEffect(() => {
    if (showCarForm || viewingDocuments || showBulkUpload) {
      // Scroll to top instantly
      window.scrollTo(0, 0);
      // Lock scroll
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showCarForm, viewingDocuments, showBulkUpload]);

  // Handle booking status update
  const handleBookingStatusUpdate = async (bookingId, newStatus) => {
    try {
      const response = await updateBookingStatus(bookingId, newStatus);
      if (response.success) {
        toast.success('Booking status updated successfully');
        fetchBookings(); // Refresh bookings
      }
    } catch (error) {
      toast.error('Failed to update booking status');
    }
  };

  // Handle message status update
  const handleMessageStatusUpdate = async (messageId, newStatus) => {
    try {
      const response = await updateMessageStatus(messageId, newStatus);
      if (response.success) {
        toast.success('Message status updated');
        fetchMessages(); // Refresh messages
      }
    } catch (error) {
      toast.error('Failed to update message status');
    }
  };

  // Handle car form open for adding new car
  const handleAddCarClick = () => {
    setEditingCar(null);
    setCarImageFile(null);
    setCarImagePreview(null);
    setCarFormData({
      car_barnd: '',
      car_type: '',
      car_model: new Date().getFullYear(),
      car_num: '',
      car_category: '',
      price_per_day: '',
      price_per_week: '',
      price_per_month: '',
      car_color: '',
      mileage: '',
      status: 'available',
      image_url: ''
    });
    setShowCarForm(true);
  };

  // Handle car form open for editing
  const handleEditCarClick = (car) => {
    setEditingCar(car);
    setCarImageFile(null);
    setCarImagePreview(car.image_url || null);
    setCarFormData({
      car_barnd: car.car_barnd,
      car_type: car.car_type,
      car_model: car.car_model,
      car_num: car.car_num,
      car_category: car.car_category || '',
      price_per_day: car.price_per_day,
      price_per_week: car.price_per_week,
      price_per_month: car.price_per_month,
      car_color: car.car_color,
      mileage: car.mileage || '',
      status: car.status,
      image_url: car.image_url || ''
    });
    setShowCarForm(true);
  };

  // Handle car form input changes
  const handleCarFormChange = (e) => {
    const { name, value } = e.target;
    setCarFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle car image file selection
  const handleCarImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      setCarImageFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setCarImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle car form submit
  const handleCarFormSubmit = async (e) => {
    e.preventDefault();

    try {
      // Create FormData for file upload
      const formData = new FormData();

      // Append all car data (except image_url which is generated by server)
      Object.keys(carFormData).forEach(key => {
        if (key !== 'image_url') {
          // Always send all fields, even if empty, to avoid undefined values on server
          formData.append(key, carFormData[key] || '');
        }
      });

      // Append image file if selected
      if (carImageFile) {
        formData.append('carImage', carImageFile);
      }

      if (editingCar) {
        // Update existing car
        const response = await updateCar(editingCar.id, formData);
        if (response.success) {
          toast.success('Car updated successfully');
          setShowCarForm(false);
          setCarImageFile(null);
          setCarImagePreview(null);
          fetchCars();
        }
      } else {
        // Create new car
        const response = await createCar(formData);
        if (response.success) {
          toast.success('Car created successfully');
          setShowCarForm(false);
          setCarImageFile(null);
          setCarImagePreview(null);
          fetchCars();
        }
      }
    } catch (error) {
      toast.error(error.message || 'Failed to save car');
    }
  };

  // Handle car delete
  const handleDeleteCar = async (carId) => {
    if (!window.confirm('Are you sure you want to delete this car?')) {
      return;
    }

    try {
      const response = await deleteCar(carId);
      if (response.success) {
        toast.success('Car deleted successfully');
        fetchCars();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete car');
    }
  };

  // Handle bulk upload file selection
  const handleBulkUploadFilesChange = (e) => {
    const files = Array.from(e.target.files);
    setBulkUploadFiles(files);
    setBulkUploadResults(null);
  };

  // Handle bulk upload submission
  const handleBulkUploadSubmit = async (e) => {
    e.preventDefault();

    if (bulkUploadFiles.length === 0) {
      toast.error('Please select at least one image file');
      return;
    }

    setBulkUploading(true);
    setBulkUploadResults(null);

    try {
      const formData = new FormData();

      // Append all files
      bulkUploadFiles.forEach(file => {
        formData.append('carImages', file);
      });

      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/cars/bulk-upload-images', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setBulkUploadResults(data.results);
        toast.success(data.message);
        // Refresh cars list
        fetchCars();
      } else {
        toast.error(data.error || 'Bulk upload failed');
      }
    } catch (error) {
      console.error('Bulk upload error:', error);
      toast.error('Failed to upload images');
    } finally {
      setBulkUploading(false);
    }
  };

  // Handle bulk upload modal close
  const handleCloseBulkUpload = () => {
    setShowBulkUpload(false);
    setBulkUploadFiles([]);
    setBulkUploadResults(null);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `${parseFloat(amount).toFixed(2)} JOD`;
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
      case 'new':
        return 'bg-yellow-100 text-yellow-800';
      case 'active':
      case 'read':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
      case 'replied':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-slate-600 text-white p-6 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            {currentUser && (
              <p className="text-blue-200 text-sm mt-1">
                Welcome, {currentUser.full_name} ({currentUser.role})
              </p>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="bg-white text-blue-900 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-all flex items-center gap-2"
          >
            <span>Logout</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      <div className="container mx-auto p-6">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-6 overflow-hidden">
          <div className="flex border-b overflow-x-auto">
            {[
              { id: 'dashboard', name: 'Dashboard', icon: '📊' },
              { id: 'bookings', name: 'Bookings', icon: '🚗' },
              { id: 'contacts', name: 'Messages', icon: '✉️' },
              { id: 'cars', name: 'Cars', icon: '🔧' },
              { id: 'reviews', name: 'Reviews', icon: '⭐' },
              ...(currentUser?.role === 'developer' ? [{ id: 'activity-logs', name: 'Activity Logs', icon: '📋' }] : [])
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-4 font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-blue-900 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
                <p className="mt-4 text-gray-600">Loading statistics...</p>
              </div>
            ) : stats ? (
              <div>
                {/* Statistics Cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white p-6 rounded-xl shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm">Total Bookings</p>
                        <p className="text-3xl font-bold text-blue-900">{stats.bookings.total}</p>
                      </div>
                      <div className="text-4xl">🚗</div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm">Pending</p>
                        <p className="text-3xl font-bold text-yellow-600">{stats.bookings.pending}</p>
                      </div>
                      <div className="text-4xl">⏳</div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm">Total Revenue</p>
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.revenue.total)}</p>
                      </div>
                      <div className="text-4xl">💰</div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm">Available Cars</p>
                        <p className="text-3xl font-bold text-blue-600">{stats.cars.available}/{stats.cars.total}</p>
                      </div>
                      <div className="text-4xl">🔧</div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm">New Messages</p>
                        <p className="text-3xl font-bold text-purple-600">{stats.messages.new}</p>
                      </div>
                      <div className="text-4xl">✉️</div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm">Completed</p>
                        <p className="text-3xl font-bold text-green-600">{stats.bookings.confirmed}</p>
                      </div>
                      <div className="text-4xl">✅</div>
                    </div>
                  </div>
                </div>

                {/* Recent Bookings */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold mb-4">Recent Bookings</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Car</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pickup Date</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {stats.recentBookings && stats.recentBookings.map((booking) => (
                          <tr key={booking.booking_id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm">{booking.customer_name}</td>
                            <td className="px-4 py-3 text-sm">{booking.car_brand} {booking.car_type}</td>
                            <td className="px-4 py-3 text-sm">{formatDate(booking.pickup_date)}</td>
                            <td className="px-4 py-3 text-sm font-semibold">{formatCurrency(booking.total_price)}</td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                                {booking.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-600">No data available</div>
            )}
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Bookings Management</h2>
              <select
                value={bookingsFilter}
                onChange={(e) => setBookingsFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="all">All Bookings</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
                <p className="mt-4 text-gray-600">Loading bookings...</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {bookings.map((booking) => (
                  <div key={booking.booking_id} className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-blue-900">{booking.customer_name}</h3>
                        <p className="text-gray-600">{booking.customer_email}</p>
                        <p className="text-gray-600">{booking.customer_phone}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                        <p className="text-sm text-gray-500 mt-2">
                          Booked: {formatDate(booking.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-700 mb-2">🚗 Car Details</h4>
                        <p><strong>Car:</strong> {booking.car_brand} {booking.car_type} ({booking.car_model})</p>
                        <p><strong>Color:</strong> {booking.car_color}</p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-700 mb-2">📅 Rental Period</h4>
                        <p><strong>Pickup:</strong> {formatDate(booking.pickup_date)}</p>
                        <p><strong>Return:</strong> {formatDate(booking.return_date)}</p>
                        <p><strong>Duration:</strong> {booking.days} days</p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-700 mb-2">📍 Address</h4>
                        <p>{booking.street}</p>
                        <p>{booking.city}, {booking.area || ''}</p>
                        <p>{booking.country} {booking.postal_code || ''}</p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-700 mb-2">💰 Pricing</h4>
                        <p><strong>Base Price:</strong> {formatCurrency(booking.base_price)}</p>
                        <p><strong>Insurance:</strong> {formatCurrency(booking.insurance_price)}</p>
                        <p><strong>Services:</strong> {formatCurrency(booking.services_price)}</p>
                        <p className="text-lg font-bold text-blue-900 mt-2">
                          <strong>Total:</strong> {formatCurrency(booking.total_price)}
                        </p>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg mb-4">
                      <h4 className="font-semibold text-gray-700 mb-2">📋 Additional Info</h4>
                      <p><strong>Insurance Type:</strong> {booking.insurance_type}</p>
                      <p><strong>License:</strong> {booking.customer_license}</p>
                      {booking.additional_services && (() => {
                        try {
                          const services = typeof booking.additional_services === 'string'
                            ? JSON.parse(booking.additional_services)
                            : booking.additional_services;
                          return services.length > 0 ? (
                            <p><strong>Services:</strong> {services.join(', ')}</p>
                          ) : null;
                        } catch (e) {
                          return null;
                        }
                      })()}
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setViewingDocuments(booking)}
                        className="px-4 py-2 bg-blue-100 text-blue-900 rounded-lg hover:bg-blue-200 transition-all"
                      >
                        View Documents
                      </button>

                      {booking.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleBookingStatusUpdate(booking.booking_id, 'active')}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => handleBookingStatusUpdate(booking.booking_id, 'cancelled')}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                          >
                            Cancel
                          </button>
                        </>
                      )}

                      {booking.status === 'active' && (
                        <button
                          onClick={() => handleBookingStatusUpdate(booking.booking_id, 'completed')}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {bookings.length === 0 && (
                  <div className="text-center py-12 bg-white rounded-xl shadow-lg">
                    <p className="text-gray-600">No bookings found</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Contact Messages Tab */}
        {activeTab === "contacts" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Contact Messages</h2>
              <select
                value={messagesFilter}
                onChange={(e) => setMessagesFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="all">All Messages</option>
                <option value="new">New</option>
                <option value="read">Read</option>
                <option value="replied">Replied</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
                <p className="mt-4 text-gray-600">Loading messages...</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {contactMessages.map((message) => (
                  <div key={message.message_id} className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-blue-900">{message.name}</h3>
                        <p className="text-gray-600">{message.email}</p>
                        {message.phone && <p className="text-gray-600">{message.phone}</p>}
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(message.status)}`}>
                          {message.status}
                        </span>
                        <p className="text-sm text-gray-500 mt-2">
                          {formatDate(message.created_at)}
                        </p>
                      </div>
                    </div>

                    {message.subject && (
                      <div className="mb-4">
                        <p className="font-semibold text-gray-700">Subject:</p>
                        <p className="text-gray-600">{message.subject}</p>
                      </div>
                    )}

                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <p className="font-semibold text-gray-700 mb-2">Message:</p>
                      <p className="text-gray-600 whitespace-pre-wrap">{message.message}</p>
                    </div>

                    <div className="flex gap-3">
                      {message.status === 'new' && (
                        <button
                          onClick={() => handleMessageStatusUpdate(message.message_id, 'read')}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
                        >
                          Mark as Read
                        </button>
                      )}
                      {(message.status === 'new' || message.status === 'read') && (
                        <button
                          onClick={() => handleMessageStatusUpdate(message.message_id, 'replied')}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
                        >
                          Mark as Replied
                        </button>
                      )}
                      <button
                        onClick={() => handleMessageStatusUpdate(message.message_id, 'archived')}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all"
                      >
                        Archive
                      </button>
                      <a
                        href={`mailto:${message.email}`}
                        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all"
                      >
                        Reply via Email
                      </a>
                    </div>
                  </div>
                ))}

                {contactMessages.length === 0 && (
                  <div className="text-center py-12 bg-white rounded-xl shadow-lg">
                    <p className="text-gray-600">No messages found</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Cars Tab */}
        {activeTab === "cars" && (
          <div>
            <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
              <h2 className="text-2xl font-bold">Car Inventory</h2>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowBulkUpload(true)}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold hover:opacity-90 transition-all transform hover:scale-105"
                >
                  Upload Photos
                </button>
                <button
                  onClick={handleAddCarClick}
                  className="px-6 py-3 bg-gradient-to-r from-blue-900 to-slate-600 text-white rounded-lg font-semibold hover:opacity-90 transition-all transform hover:scale-105"
                >
                  + Add New Car
                </button>
              </div>
            </div>

            {/* Search and Filter Controls */}
            <div className="mb-6 bg-white rounded-xl shadow-lg p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search Bar */}
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search by Car Number, Type, or Brand
                  </label>
                  <input
                    type="text"
                    placeholder="Enter car number, type, or brand..."
                    value={carsSearchTerm}
                    onChange={(e) => setCarsSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Status Filter */}
                <div className="sm:w-64">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filter by Status
                  </label>
                  <select
                    value={carsStatusFilter}
                    onChange={(e) => setCarsStatusFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Cars</option>
                    <option value="available">Available</option>
                    <option value="rented">Rented</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>

                {/* Clear Filters Button */}
                {(carsSearchTerm || carsStatusFilter !== 'all') && (
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setCarsSearchTerm('');
                        setCarsStatusFilter('all');
                      }}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all whitespace-nowrap"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>

              {/* Results Count */}
              <div className="mt-3 text-sm text-gray-600">
                Showing {getFilteredCars().length} of {cars.length} cars
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
                <p className="mt-4 text-gray-600">Loading cars...</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Model</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Color</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Car #</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price/Day</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {getFilteredCars().map((car) => (
                        <tr key={car.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium">{car.car_barnd}</td>
                          <td className="px-4 py-3 text-sm">{car.car_type}</td>
                          <td className="px-4 py-3 text-sm">{car.car_model}</td>
                          <td className="px-4 py-3 text-sm">{car.car_color}</td>
                          <td className="px-4 py-3 text-sm">{car.car_num}</td>
                          <td className="px-4 py-3 text-sm font-semibold">{formatCurrency(car.price_per_day)}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              car.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {car.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditCarClick(car)}
                                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-all"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteCar(car.id)}
                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-all"
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

                {getFilteredCars().length === 0 && !loading && (
                  <div className="text-center py-12">
                    <p className="text-gray-600">
                      {cars.length === 0
                        ? 'No cars found in inventory'
                        : 'No cars match the current filters'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === "reviews" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Reviews Management</h2>
              <select
                value={reviewsFilter}
                onChange={(e) => setReviewsFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="all">All Reviews</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
                <p className="mt-4 text-gray-600">Loading reviews...</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-blue-900">{review.customer_name}</h3>
                        <div className="flex items-center gap-1 mt-2">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={`text-2xl ${i < review.rating ? 'text-yellow-500' : 'text-gray-300'}`}>
                              ★
                            </span>
                          ))}
                          <span className="ml-2 text-gray-600">({review.rating}/5)</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(review.status)}`}>
                          {review.status}
                        </span>
                        <p className="text-sm text-gray-500 mt-2">
                          {formatDate(review.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <p className="text-gray-700 whitespace-pre-wrap">{review.comment}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={review.is_featured}
                          onChange={async (e) => {
                            try {
                              const response = await fetch(`/api/reviews/${review.id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  ...review,
                                  is_featured: e.target.checked
                                })
                              });
                              if (response.ok) {
                                toast.success('Review updated');
                                fetchReviews();
                              }
                            } catch (error) {
                              toast.error('Failed to update review');
                            }
                          }}
                          className="w-4 h-4"
                        />
                        <span className="text-sm font-medium">Featured</span>
                      </label>

                      <div className="flex-1"></div>

                      {review.status === 'pending' && (
                        <>
                          <button
                            onClick={async () => {
                              try {
                                const response = await fetch(`/api/reviews/${review.id}`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ ...review, status: 'approved' })
                                });
                                if (response.ok) {
                                  toast.success('Review approved');
                                  fetchReviews();
                                }
                              } catch (error) {
                                toast.error('Failed to approve review');
                              }
                            }}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
                          >
                            Approve
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                const response = await fetch(`/api/reviews/${review.id}`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ ...review, status: 'rejected' })
                                });
                                if (response.ok) {
                                  toast.success('Review rejected');
                                  fetchReviews();
                                }
                              } catch (error) {
                                toast.error('Failed to reject review');
                              }
                            }}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      <button
                        onClick={async () => {
                          if (!window.confirm('Are you sure you want to delete this review?')) return;
                          try {
                            const response = await fetch(`/api/reviews/${review.id}`, {
                              method: 'DELETE'
                            });
                            if (response.ok) {
                              toast.success('Review deleted');
                              fetchReviews();
                            }
                          } catch (error) {
                            toast.error('Failed to delete review');
                          }
                        }}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}

                {reviews.length === 0 && (
                  <div className="text-center py-12 bg-white rounded-xl shadow-lg">
                    <p className="text-gray-600">No reviews found</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Activity Logs Tab (Developer Only) */}
        {activeTab === "activity-logs" && currentUser?.role === 'developer' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Activity Logs</h2>
              <button
                onClick={handleExportLogs}
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-all flex items-center gap-2"
              >
                <span>📥</span>
                Export to Excel
              </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h3 className="font-semibold text-lg mb-4">Filters</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="datetime-local"
                    value={logsFilter.startDate}
                    onChange={(e) => setLogsFilter({...logsFilter, startDate: e.target.value, offset: 0})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="datetime-local"
                    value={logsFilter.endDate}
                    onChange={(e) => setLogsFilter({...logsFilter, endDate: e.target.value, offset: 0})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Admin User</label>
                  <select
                    value={logsFilter.adminId}
                    onChange={(e) => setLogsFilter({...logsFilter, adminId: e.target.value, offset: 0})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Users</option>
                    {adminUsers.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.full_name} ({user.username})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Action Type</label>
                  <select
                    value={logsFilter.action}
                    onChange={(e) => setLogsFilter({...logsFilter, action: e.target.value, offset: 0})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Actions</option>
                    <option value="LOGIN">Login</option>
                    <option value="LOGOUT">Logout</option>
                    <option value="CREATE">Create</option>
                    <option value="UPDATE">Update</option>
                    <option value="DELETE">Delete</option>
                    <option value="STATUS_CHANGE">Status Change</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Entity Type</label>
                  <select
                    value={logsFilter.entityType}
                    onChange={(e) => setLogsFilter({...logsFilter, entityType: e.target.value, offset: 0})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Entities</option>
                    <option value="car">Car</option>
                    <option value="booking">Booking</option>
                    <option value="review">Review</option>
                    <option value="message">Message</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Results Per Page</label>
                  <select
                    value={logsFilter.limit}
                    onChange={(e) => setLogsFilter({...logsFilter, limit: parseInt(e.target.value), offset: 0})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="50">50</option>
                    <option value="100">100</option>
                    <option value="200">200</option>
                    <option value="500">500</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => setLogsFilter({
                    startDate: '',
                    endDate: '',
                    adminId: '',
                    action: '',
                    entityType: '',
                    limit: 100,
                    offset: 0
                  })}
                  className="text-blue-600 hover:text-blue-800 font-semibold"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Activity Logs Table */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
                <p className="mt-4 text-gray-600">Loading logs...</p>
              </div>
            ) : (
              <div>
                <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-4">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin User</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entity</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {actionLogs.map((log) => (
                          <React.Fragment key={log.id}>
                            <tr className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {new Date(log.created_at).toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{log.admin_username}</div>
                                <div className="text-sm text-gray-500">{log.admin_role}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                  log.action === 'CREATE' ? 'bg-green-100 text-green-800' :
                                  log.action === 'UPDATE' ? 'bg-blue-100 text-blue-800' :
                                  log.action === 'DELETE' ? 'bg-red-100 text-red-800' :
                                  log.action === 'LOGIN' ? 'bg-purple-100 text-purple-800' :
                                  log.action === 'LOGOUT' ? 'bg-gray-100 text-gray-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {log.action}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {log.entity_type ? (
                                  <span className="capitalize">{log.entity_type} #{log.entity_id}</span>
                                ) : (
                                  <span className="text-gray-400">N/A</span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900 max-w-md truncate">
                                {log.description}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <button
                                  onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                                  className="text-blue-600 hover:text-blue-800 font-semibold"
                                >
                                  {expandedLog === log.id ? 'Hide' : 'View'}
                                </button>
                              </td>
                            </tr>
                            {expandedLog === log.id && (
                              <tr>
                                <td colSpan="6" className="px-6 py-4 bg-gray-50">
                                  <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-semibold text-sm text-gray-700 mb-2">Old Data</h4>
                                      <pre className="bg-white p-3 rounded border text-xs overflow-auto max-h-64">
                                        {log.old_data ? JSON.stringify(
                                          typeof log.old_data === 'string' ? JSON.parse(log.old_data) : log.old_data,
                                          null,
                                          2
                                        ) : 'N/A'}
                                      </pre>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-sm text-gray-700 mb-2">New Data</h4>
                                      <pre className="bg-white p-3 rounded border text-xs overflow-auto max-h-64">
                                        {log.new_data ? JSON.stringify(
                                          typeof log.new_data === 'string' ? JSON.parse(log.new_data) : log.new_data,
                                          null,
                                          2
                                        ) : 'N/A'}
                                      </pre>
                                    </div>
                                  </div>
                                  <div className="mt-4 grid md:grid-cols-2 gap-4">
                                    <div>
                                      <span className="font-semibold text-sm text-gray-700">IP Address: </span>
                                      <span className="text-sm text-gray-900">{log.ip_address}</span>
                                    </div>
                                    <div>
                                      <span className="font-semibold text-sm text-gray-700">User Agent: </span>
                                      <span className="text-sm text-gray-900">{log.user_agent}</span>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pagination */}
                <div className="bg-white rounded-xl shadow-lg p-4 flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Showing {logsPagination.offset + 1} to {Math.min(logsPagination.offset + logsPagination.limit, logsPagination.total)} of {logsPagination.total} logs
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setLogsFilter({...logsFilter, offset: Math.max(0, logsFilter.offset - logsFilter.limit)})}
                      disabled={logsFilter.offset === 0}
                      className={`px-4 py-2 rounded-lg font-semibold ${
                        logsFilter.offset === 0
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setLogsFilter({...logsFilter, offset: logsFilter.offset + logsFilter.limit})}
                      disabled={logsFilter.offset + logsFilter.limit >= logsPagination.total}
                      className={`px-4 py-2 rounded-lg font-semibold ${
                        logsFilter.offset + logsFilter.limit >= logsPagination.total
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>

                {actionLogs.length === 0 && (
                  <div className="text-center py-12 bg-white rounded-xl shadow-lg">
                    <p className="text-gray-600">No activity logs found</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Document Viewer Modal */}
      {viewingDocuments && (
        <div
          className="fixed inset-0 flex items-start justify-center z-50 p-4 pt-8 overflow-y-auto"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setViewingDocuments(null);
            }
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto my-8">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-2xl font-bold">Customer Documents</h3>
              <button
                onClick={() => setViewingDocuments(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4 bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-2">Booking Information</h4>
                <p><strong>Customer:</strong> {viewingDocuments.customer_name}</p>
                <p><strong>Email:</strong> {viewingDocuments.customer_email}</p>
                <p><strong>Phone:</strong> {viewingDocuments.customer_phone}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {viewingDocuments.id_document ? (
                  <div>
                    <h4 className="font-semibold mb-2">ID Document</h4>
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <p className="text-sm text-gray-600 mb-2">File: {viewingDocuments.id_document}</p>
                      <img
                        src={getImageUrl(`/uploads/${viewingDocuments.id_document}`)}
                        alt="ID Document"
                        className="w-full h-64 object-contain bg-white rounded mb-3"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <p className="text-sm text-gray-500 mb-3" style={{display: 'none'}}>
                        Preview not available for this file type
                      </p>
                      <a
                        href={getImageUrl(`/uploads/${viewingDocuments.id_document}`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
                      >
                        View/Download
                      </a>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h4 className="font-semibold mb-2">ID Document</h4>
                    <div className="border rounded-lg p-4 bg-gray-50 text-center text-gray-500">
                      No ID document uploaded
                    </div>
                  </div>
                )}

                {viewingDocuments.passport_document ? (
                  <div>
                    <h4 className="font-semibold mb-2">Passport Document</h4>
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <p className="text-sm text-gray-600 mb-2">File: {viewingDocuments.passport_document}</p>
                      <img
                        src={getImageUrl(`/uploads/${viewingDocuments.passport_document}`)}
                        alt="Passport Document"
                        className="w-full h-64 object-contain bg-white rounded mb-3"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <p className="text-sm text-gray-500 mb-3" style={{display: 'none'}}>
                        Preview not available for this file type
                      </p>
                      <a
                        href={getImageUrl(`/uploads/${viewingDocuments.passport_document}`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
                      >
                        View/Download
                      </a>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h4 className="font-semibold mb-2">Passport Document</h4>
                    <div className="border rounded-lg p-4 bg-gray-50 text-center text-gray-500">
                      No passport document uploaded
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Car Add/Edit Modal */}
      {showCarForm && (
        <div
          className="fixed inset-0 flex items-start justify-center z-50 p-4 pt-8 overflow-y-auto"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCarForm(false);
            }
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-2xl font-bold">
                {editingCar ? 'Edit Car' : 'Add New Car'}
              </h3>
              <button
                onClick={() => setShowCarForm(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCarFormSubmit} className="p-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand *
                  </label>
                  <input
                    type="text"
                    name="car_barnd"
                    value={carFormData.car_barnd}
                    onChange={handleCarFormChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Toyota, Honda"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type *
                  </label>
                  <input
                    type="text"
                    name="car_type"
                    value={carFormData.car_type}
                    onChange={handleCarFormChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Camry, Civic"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model Year *
                  </label>
                  <input
                    type="number"
                    name="car_model"
                    value={carFormData.car_model}
                    onChange={handleCarFormChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="2024"
                    min="1900"
                    max="2050"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Car Number *
                  </label>
                  <input
                    type="number"
                    name="car_num"
                    value={carFormData.car_num}
                    onChange={handleCarFormChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="12345"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    name="car_category"
                    value={carFormData.car_category}
                    onChange={handleCarFormChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Category</option>
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Truck">Truck</option>
                    <option value="Van">Van</option>
                    <option value="Luxury">Luxury</option>
                    <option value="Sports">Sports</option>
                    <option value="Economy">Economy</option>
                    <option value="Compact">Compact</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color *
                  </label>
                  <input
                    type="text"
                    name="car_color"
                    value={carFormData.car_color}
                    onChange={handleCarFormChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., White, Black"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mileage
                  </label>
                  <input
                    type="number"
                    name="mileage"
                    value={carFormData.mileage}
                    onChange={handleCarFormChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="50000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Per Day (JOD) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="price_per_day"
                    value={carFormData.price_per_day}
                    onChange={handleCarFormChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
                    name="price_per_week"
                    value={carFormData.price_per_week}
                    onChange={handleCarFormChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="180.00"
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
                    name="price_per_month"
                    value={carFormData.price_per_month}
                    onChange={handleCarFormChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="600.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    name="status"
                    value={carFormData.status}
                    onChange={handleCarFormChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="available">Available</option>
                    <option value="rented">Rented</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Car Image (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCarImageChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Upload car image (JPG, PNG, max 5MB)
                  </p>

                  {/* Image Preview */}
                  {carImagePreview && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                      <img
                        src={carImagePreview}
                        alt="Car preview"
                        className="w-full max-w-md h-48 object-cover rounded-lg border-2 border-gray-200"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-900 to-slate-600 text-white rounded-lg font-semibold hover:opacity-90 transition-all"
                >
                  {editingCar ? 'Update Car' : 'Add Car'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCarForm(false)}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showBulkUpload && (
        <div
          className="fixed inset-0 flex items-start justify-center z-50 p-4 pt-8 overflow-y-auto"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseBulkUpload();
            }
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto my-8">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-2xl font-bold">Bulk Upload Car Photos</h3>
              <button
                onClick={handleCloseBulkUpload}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              {/* Instructions */}
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h4 className="font-semibold text-gray-700 mb-2">Instructions</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                  <li>Name your image files with the car number (e.g., "7041195.jpg", "7050085.png")</li>
                  <li>The car number must be exactly 7 digits and match a car in your database</li>
                  <li>Select multiple images at once (up to 100 files)</li>
                  <li>Supported formats: JPG, PNG, GIF, WEBP (max 5MB each)</li>
                  <li>Images will automatically be matched to cars by their car number</li>
                </ol>
              </div>

              <form onSubmit={handleBulkUploadSubmit}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Car Images
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleBulkUploadFilesChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={bulkUploading}
                  />
                  {bulkUploadFiles.length > 0 && (
                    <p className="text-sm text-gray-600 mt-2">
                      {bulkUploadFiles.length} file(s) selected
                    </p>
                  )}
                </div>

                {/* File list preview */}
                {bulkUploadFiles.length > 0 && !bulkUploadResults && (
                  <div className="mb-6 max-h-48 overflow-y-auto border rounded-lg p-4">
                    <h4 className="font-semibold text-gray-700 mb-2">Selected Files:</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {bulkUploadFiles.map((file, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <span className="text-green-600">✓</span>
                          <span>{file.name}</span>
                          <span className="text-gray-400">({(file.size / 1024).toFixed(0)} KB)</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Upload results */}
                {bulkUploadResults && (
                  <div className="mb-6 space-y-4">
                    {/* Success results */}
                    {bulkUploadResults.success.length > 0 && (
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h4 className="font-semibold text-green-800 mb-2">
                          Successfully Uploaded ({bulkUploadResults.success.length})
                        </h4>
                        <div className="max-h-48 overflow-y-auto">
                          <ul className="space-y-1 text-sm text-green-700">
                            {bulkUploadResults.success.map((result, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-green-600 mt-0.5">✓</span>
                                <span>
                                  <strong>{result.filename}</strong> → Car #{result.car_num} ({result.car})
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Failed results */}
                    {bulkUploadResults.failed.length > 0 && (
                      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <h4 className="font-semibold text-red-800 mb-2">
                          Failed ({bulkUploadResults.failed.length})
                        </h4>
                        <div className="max-h-48 overflow-y-auto">
                          <ul className="space-y-1 text-sm text-red-700">
                            {bulkUploadResults.failed.map((result, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-red-600 mt-0.5">✗</span>
                                <span>
                                  <strong>{result.filename}</strong>
                                  {result.car_num && ` (Car #${result.car_num})`}: {result.reason}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Skipped results */}
                    {bulkUploadResults.skipped.length > 0 && (
                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <h4 className="font-semibold text-yellow-800 mb-2">
                          Skipped ({bulkUploadResults.skipped.length})
                        </h4>
                        <div className="max-h-48 overflow-y-auto">
                          <ul className="space-y-1 text-sm text-yellow-700">
                            {bulkUploadResults.skipped.map((result, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-yellow-600 mt-0.5">⚠</span>
                                <span>
                                  <strong>{result.filename}</strong>: {result.reason}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-3">
                  {!bulkUploadResults && (
                    <button
                      type="submit"
                      disabled={bulkUploading || bulkUploadFiles.length === 0}
                      className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                        bulkUploading || bulkUploadFiles.length === 0
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:opacity-90'
                      }`}
                    >
                      {bulkUploading ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Uploading...
                        </span>
                      ) : (
                        `Upload ${bulkUploadFiles.length} Photo(s)`
                      )}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleCloseBulkUpload}
                    className="px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all"
                  >
                    {bulkUploadResults ? 'Close' : 'Cancel'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;

// Admin API Service - Now using centralized API client
import api from './api';

// Wrapper to maintain backward compatibility with AdminPage expecting { success, data } format
const wrapResponse = (data) => ({ success: true, data });

// ========================================
// BOOKINGS
// ========================================

export const getBookings = async (filters = {}) => {
  try {
    const data = await api.bookings.getAll();
    return wrapResponse(data);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    throw error;
  }
};

export const getBookingById = async (id) => {
  try {
    const data = await api.bookings.getById(id);
    return wrapResponse(data);
  } catch (error) {
    console.error('Error fetching booking:', error);
    throw error;
  }
};

export const updateBookingStatus = async (id, status) => {
  try {
    const data = await api.bookings.updateStatus(id, status);
    return wrapResponse(data);
  } catch (error) {
    console.error('Error updating booking status:', error);
    throw error;
  }
};

// ========================================
// CONTACT MESSAGES
// ========================================

export const getContactMessages = async (filters = {}) => {
  try {
    const params = filters;
    const response = await api.client.get('/contact-messages', { params });
    // Use same unwrapping logic - check for array, data property, or empty array fallback
    const rawData = response.data;
    const data = Array.isArray(rawData) ? rawData : (rawData?.data || []);
    return wrapResponse(data);
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    throw error;
  }
};

export const updateMessageStatus = async (id, status) => {
  try {
    const response = await api.client.patch(`/contact-messages/${id}/status`, { status });
    // Unwrap response.data if it has a nested data property
    const data = response.data?.data || response.data;
    return wrapResponse(data);
  } catch (error) {
    console.error('Error updating message status:', error);
    throw error;
  }
};

// ========================================
// CARS
// ========================================

export const getCars = async (filters = {}) => {
  try {
    const data = await api.cars.getAll(filters);
    return wrapResponse(data);
  } catch (error) {
    console.error('Error fetching cars:', error);
    throw error;
  }
};

export const createCar = async (carData) => {
  try {
    const data = await api.cars.create(carData);
    return wrapResponse(data);
  } catch (error) {
    console.error('Error creating car:', error);
    throw error;
  }
};

export const updateCar = async (id, carData) => {
  try {
    const data = await api.cars.update(id, carData);
    return wrapResponse(data);
  } catch (error) {
    console.error('Error updating car:', error);
    throw error;
  }
};

export const deleteCar = async (id) => {
  try {
    const data = await api.cars.delete(id);
    return wrapResponse(data);
  } catch (error) {
    console.error('Error deleting car:', error);
    throw error;
  }
};

// ========================================
// ADMIN STATISTICS
// ========================================

export const getAdminStats = async () => {
  try {
    const data = await api.admin.getStats();
    return wrapResponse(data);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    throw error;
  }
};

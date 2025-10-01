// Admin API Service
// Use relative URL to work with Vite proxy in development
const API_URL = '/api';

// ========================================
// BOOKINGS
// ========================================

export const getBookings = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_URL}/bookings?${params}`);

    if (!response.ok) {
      throw new Error('Failed to fetch bookings');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching bookings:', error);
    throw error;
  }
};

export const getBookingById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/bookings/${id}`);

    if (!response.ok) {
      throw new Error('Failed to fetch booking');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching booking:', error);
    throw error;
  }
};

export const updateBookingStatus = async (id, status) => {
  try {
    const response = await fetch(`${API_URL}/bookings/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error('Failed to update booking status');
    }

    return await response.json();
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
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_URL}/contact-messages?${params}`);

    if (!response.ok) {
      throw new Error('Failed to fetch contact messages');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    throw error;
  }
};

export const updateMessageStatus = async (id, status) => {
  try {
    const response = await fetch(`${API_URL}/contact-messages/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error('Failed to update message status');
    }

    return await response.json();
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
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_URL}/cars?${params}`);

    if (!response.ok) {
      throw new Error('Failed to fetch cars');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching cars:', error);
    throw error;
  }
};

// ========================================
// CAR MANAGEMENT
// ========================================

export const createCar = async (carData) => {
  try {
    const response = await fetch(`${API_URL}/cars`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(carData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create car');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating car:', error);
    throw error;
  }
};

export const updateCar = async (id, carData) => {
  try {
    const response = await fetch(`${API_URL}/cars/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(carData),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to update car';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
        console.error('Server error details:', errorData);
      } catch (e) {
        // Response is not JSON, use status text
        errorMessage = `${errorMessage}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating car:', error);
    throw error;
  }
};

export const deleteCar = async (id) => {
  try {
    const response = await fetch(`${API_URL}/cars/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      let errorMessage = 'Failed to delete car';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // Response is not JSON, use status text
        errorMessage = `${errorMessage}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return await response.json();
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
    const response = await fetch(`${API_URL}/admin/stats`);

    if (!response.ok) {
      throw new Error('Failed to fetch statistics');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching statistics:', error);
    throw error;
  }
};

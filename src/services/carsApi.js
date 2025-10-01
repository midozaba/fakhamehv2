// Public Cars API Service
const API_URL = '/api';

/**
 * Fetch all available cars from the database
 * @param {Object} filters - Optional filters (status, category, etc.)
 * @returns {Promise<Array>} Array of car objects
 */
export const fetchCars = async (filters = {}) => {
  try {
    const params = new URLSearchParams({
      status: 'available', // Only fetch available cars for public
      ...filters
    });

    const response = await fetch(`${API_URL}/cars?${params}`);

    if (!response.ok) {
      throw new Error('Failed to fetch cars');
    }

    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Error fetching cars:', error);
    throw error;
  }
};

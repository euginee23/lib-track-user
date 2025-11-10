import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Reservation Fetching API Service
 * Provides functions to retrieve reservation data
 */

/**
 * Fetch all reservations (admin/librarian function)
 * @param {Object} filters - Optional filters
 * @param {number} filters.user_id - Filter by user ID
 * @param {string} filters.status - Filter by status (Pending, Approved, Rejected)
 * @returns {Promise<Object>} API response with reservations data
 */
export const fetchAllReservations = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.user_id) {
      params.append('user_id', filters.user_id);
    }
    
    if (filters.status) {
      params.append('status', filters.status);
    }

    const queryString = params.toString();
    const url = queryString 
      ? `${API_BASE_URL}/api/reservations?${queryString}`
      : `${API_BASE_URL}/api/reservations`;

    const response = await axios.get(url);
    const payload = response.data || {};
    // Ensure each reservation has a numeric position for UI
    if (payload.data && Array.isArray(payload.data)) {
      payload.data = payload.data.map(r => ({ ...r, position: Number(r.position) || 1 }));
    }
    return payload;
  } catch (error) {
    console.error('Error fetching all reservations:', error);
    throw new Error(`Failed to fetch reservations: ${error.response?.data?.message || error.message}`);
  }
};

/**
 * Fetch a specific reservation by ID
 * @param {number} reservationId - The reservation ID
 * @returns {Promise<Object>} Reservation data
 */
export const getReservationById = async (reservationId) => {
  try {
    if (!reservationId) {
      throw new Error('Reservation ID is required');
    }

    const response = await axios.get(`${API_BASE_URL}/api/reservations/${reservationId}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch reservation');
    }

    const payload = response.data || {};
    if (payload.data) {
      payload.data.position = Number(payload.data.position) || 1;
    }

    return payload;
  } catch (error) {
    console.error(`Error fetching reservation ${reservationId}:`, error);
    throw new Error(`Failed to fetch reservation: ${error.response?.data?.message || error.message}`);
  }
};

/**
 * Fetch reservations for a specific user
 * @param {number} userId - The user ID
 * @param {string} status - Optional status filter (Pending, Approved, Rejected)
 * @returns {Promise<Object>} API response with user's reservations
 */
export const getUserReservations = async (userId, status = null) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const params = new URLSearchParams();
    if (status) {
      params.append('status', status);
    }

    const queryString = params.toString();
    const url = queryString
      ? `${API_BASE_URL}/api/reservations/user/${userId}?${queryString}`
      : `${API_BASE_URL}/api/reservations/user/${userId}`;

    const response = await axios.get(url);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch user reservations');
    }

    const payload = response.data || {};
    if (payload.data && Array.isArray(payload.data)) {
      payload.data = payload.data.map(r => ({ ...r, position: Number(r.position) || 1 }));
    }

    return payload;
  } catch (error) {
    console.error(`Error fetching reservations for user ${userId}:`, error);
    throw new Error(`Failed to fetch user reservations: ${error.response?.data?.message || error.message}`);
  }
};

/**
 * Get pending reservations for a user
 * @param {number} userId - The user ID
 * @returns {Promise<Array>} Array of pending reservations
 */
export const getPendingReservations = async (userId) => {
  try {
    const response = await getUserReservations(userId, 'Pending');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching pending reservations:', error);
    throw error;
  }
};

/**
 * Get approved reservations for a user
 * @param {number} userId - The user ID
 * @returns {Promise<Array>} Array of approved reservations
 */
export const getApprovedReservations = async (userId) => {
  try {
    const response = await getUserReservations(userId, 'Approved');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching approved reservations:', error);
    throw error;
  }
};

/**
 * Get rejected reservations for a user
 * @param {number} userId - The user ID
 * @returns {Promise<Array>} Array of rejected reservations
 */
export const getRejectedReservations = async (userId) => {
  try {
    const response = await getUserReservations(userId, 'Rejected');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching rejected reservations:', error);
    throw error;
  }
};

/**
 * Get all reservations grouped by status
 * @param {number} userId - The user ID
 * @returns {Promise<Object>} Object with reservations grouped by status
 */
export const getReservationsByStatus = async (userId) => {
  try {
    const response = await getUserReservations(userId);
    
    const reservations = response.data || [];
    
    const groupedReservations = {
      pending: [],
      approved: [],
      rejected: [],
      all: reservations
    };

    reservations.forEach(reservation => {
      const status = reservation.status?.toLowerCase();
      if (status === 'pending') {
        groupedReservations.pending.push(reservation);
      } else if (status === 'approved') {
        groupedReservations.approved.push(reservation);
      } else if (status === 'rejected') {
        groupedReservations.rejected.push(reservation);
      }
    });

    return groupedReservations;
  } catch (error) {
    console.error('Error grouping reservations by status:', error);
    throw error;
  }
};

/**
 * Get book reservations for a user
 * @param {number} userId - The user ID
 * @returns {Promise<Array>} Array of book reservations
 */
export const getBookReservations = async (userId) => {
  try {
    const response = await getUserReservations(userId);
    const reservations = response.data || [];
    
    return reservations.filter(reservation => reservation.reservation_type === 'book');
  } catch (error) {
    console.error('Error fetching book reservations:', error);
    throw error;
  }
};

/**
 * Get research paper reservations for a user
 * @param {number} userId - The user ID
 * @returns {Promise<Array>} Array of research paper reservations
 */
export const getResearchReservations = async (userId) => {
  try {
    const response = await getUserReservations(userId);
    const reservations = response.data || [];
    
    return reservations.filter(reservation => reservation.reservation_type === 'research_paper');
  } catch (error) {
    console.error('Error fetching research paper reservations:', error);
    throw error;
  }
};

/**
 * Check if user has existing reservation for a specific book
 * @param {number} userId - The user ID
 * @param {number} bookId - The book ID
 * @returns {Promise<Object|null>} Existing reservation or null
 */
export const checkBookReservation = async (userId, bookId) => {
  try {
    const reservations = await getBookReservations(userId);
    const existingReservation = reservations.find(
      r => r.book_id === bookId && r.status !== 'Rejected'
    );
    
    return existingReservation || null;
  } catch (error) {
    console.error('Error checking book reservation:', error);
    throw error;
  }
};

/**
 * Check if user has existing reservation for a specific research paper
 * @param {number} userId - The user ID
 * @param {number} researchPaperId - The research paper ID
 * @returns {Promise<Object|null>} Existing reservation or null
 */
export const checkResearchReservation = async (userId, researchPaperId) => {
  try {
    const reservations = await getResearchReservations(userId);
    const existingReservation = reservations.find(
      r => r.research_paper_id === researchPaperId && r.status !== 'Rejected'
    );
    
    return existingReservation || null;
  } catch (error) {
    console.error('Error checking research paper reservation:', error);
    throw error;
  }
};

/**
 * Get reservation statistics for a user
 * @param {number} userId - The user ID
 * @returns {Promise<Object>} Reservation statistics
 */
export const getReservationStats = async (userId) => {
  try {
    const response = await getUserReservations(userId);
    const reservations = response.data || [];

    const stats = {
      total: reservations.length,
      pending: 0,
      approved: 0,
      rejected: 0,
      books: 0,
      researchPapers: 0
    };

    reservations.forEach(reservation => {
      const status = reservation.status?.toLowerCase();
      const type = reservation.reservation_type;

      if (status === 'pending') stats.pending++;
      if (status === 'approved') stats.approved++;
      if (status === 'rejected') stats.rejected++;
      
      if (type === 'book') stats.books++;
      if (type === 'research_paper') stats.researchPapers++;
    });

    return stats;
  } catch (error) {
    console.error('Error fetching reservation stats:', error);
    throw error;
  }
};

/**
 * Get all pending reservations (admin/librarian function)
 * @returns {Promise<Array>} Array of all pending reservations
 */
export const getAllPendingReservations = async () => {
  try {
    const response = await fetchAllReservations({ status: 'Pending' });
    return response.data || [];
  } catch (error) {
    console.error('Error fetching all pending reservations:', error);
    throw error;
  }
};

/**
 * Get all approved reservations (admin/librarian function)
 * @returns {Promise<Array>} Array of all approved reservations
 */
export const getAllApprovedReservations = async () => {
  try {
    const response = await fetchAllReservations({ status: 'Approved' });
    return response.data || [];
  } catch (error) {
    console.error('Error fetching all approved reservations:', error);
    throw error;
  }
};

/**
 * Get all rejected reservations (admin/librarian function)
 * @returns {Promise<Array>} Array of all rejected reservations
 */
export const getAllRejectedReservations = async () => {
  try {
    const response = await fetchAllReservations({ status: 'Rejected' });
    return response.data || [];
  } catch (error) {
    console.error('Error fetching all rejected reservations:', error);
    throw error;
  }
};

// Export all functions
export default {
  fetchAllReservations,
  getReservationById,
  getUserReservations,
  getPendingReservations,
  getApprovedReservations,
  getRejectedReservations,
  getReservationsByStatus,
  getBookReservations,
  getResearchReservations,
  checkBookReservation,
  checkResearchReservation,
  getReservationStats,
  getAllPendingReservations,
  getAllApprovedReservations,
  getAllRejectedReservations
};

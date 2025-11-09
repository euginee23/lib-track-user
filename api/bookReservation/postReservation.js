import axios from 'axios';
import { cancelReservation as cancelReservationApi } from './cancelReservation';

const API_BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Reservation Posting API Service
 * Provides functions to create, update, and delete reservations
 */

/**
 * Create a new reservation for a book
 * @param {Object} reservationData - Reservation data
 * @param {number} reservationData.book_id - The book ID to reserve
 * @param {number} reservationData.user_id - The user ID making the reservation
 * @returns {Promise<Object>} API response with created reservation data
 */
export const createBookReservation = async (reservationData) => {
  try {
    const { book_id, user_id } = reservationData;

    if (!book_id || !user_id) {
      throw new Error('Book ID and User ID are required');
    }

    const response = await axios.post(`${API_BASE_URL}/api/reservations`, {
      book_id,
      user_id
    });

    return response.data;
  } catch (error) {
    console.error('Error creating book reservation:', error);
    throw new Error(`Failed to create book reservation: ${error.response?.data?.message || error.message}`);
  }
};

/**
 * Create a new reservation for a research paper
 * @param {Object} reservationData - Reservation data
 * @param {number} reservationData.research_paper_id - The research paper ID to reserve
 * @param {number} reservationData.user_id - The user ID making the reservation
 * @returns {Promise<Object>} API response with created reservation data
 */
export const createResearchReservation = async (reservationData) => {
  try {
    const { research_paper_id, user_id } = reservationData;

    if (!research_paper_id || !user_id) {
      throw new Error('Research Paper ID and User ID are required');
    }

    const response = await axios.post(`${API_BASE_URL}/api/reservations`, {
      research_paper_id,
      user_id
    });

    return response.data;
  } catch (error) {
    console.error('Error creating research paper reservation:', error);
    throw new Error(`Failed to create research paper reservation: ${error.response?.data?.message || error.message}`);
  }
};

/**
 * Create a reservation (auto-detects book or research paper)
 * @param {Object} reservationData - Reservation data
 * @param {number} reservationData.book_id - The book ID (optional if research_paper_id provided)
 * @param {number} reservationData.research_paper_id - The research paper ID (optional if book_id provided)
 * @param {number} reservationData.user_id - The user ID making the reservation
 * @returns {Promise<Object>} API response with created reservation data
 */
export const createReservation = async (reservationData) => {
  try {
    const { book_id, research_paper_id, user_id } = reservationData;

    if (!user_id) {
      throw new Error('User ID is required');
    }

    if ((!book_id && !research_paper_id) || (book_id && research_paper_id)) {
      throw new Error('Must specify either book_id or research_paper_id, but not both');
    }

    const payload = {
      user_id
    };

    if (book_id) {
      payload.book_id = book_id;
    } else {
      payload.research_paper_id = research_paper_id;
    }

    const response = await axios.post(`${API_BASE_URL}/api/reservations`, payload);

    return response.data;
  } catch (error) {
    console.error('Error creating reservation:', error);
    throw new Error(`Failed to create reservation: ${error.response?.data?.message || error.message}`);
  }
};

/**
 * Update reservation status
 * @param {number} reservationId - The reservation ID to update
 * @param {Object} updateData - Update data
 * @param {string} updateData.status - New status (Pending, Approved, Rejected)
 * @param {string} updateData.reason - Optional reason for status change
 * @returns {Promise<Object>} API response with updated reservation data
 */
export const updateReservationStatus = async (reservationId, updateData) => {
  try {
    if (!reservationId) {
      throw new Error('Reservation ID is required');
    }

    const { status, reason } = updateData;

    if (!status) {
      throw new Error('Status is required');
    }

    const validStatuses = ['Pending', 'Approved', 'Rejected'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const response = await axios.put(`${API_BASE_URL}/api/reservations/${reservationId}`, {
      status,
      reason: reason || null
    });

    return response.data;
  } catch (error) {
    console.error('Error updating reservation status:', error);
    throw new Error(`Failed to update reservation: ${error.response?.data?.message || error.message}`);
  }
};

/**
 * Update reservation reason
 * @param {number} reservationId - The reservation ID to update
 * @param {string} reason - New reason for the reservation
 * @returns {Promise<Object>} API response with updated reservation data
 */
export const updateReservationReason = async (reservationId, reason) => {
  try {
    if (!reservationId) {
      throw new Error('Reservation ID is required');
    }

    const response = await axios.put(`${API_BASE_URL}/api/reservations/${reservationId}`, {
      reason
    });

    return response.data;
  } catch (error) {
    console.error('Error updating reservation reason:', error);
    throw new Error(`Failed to update reservation reason: ${error.response?.data?.message || error.message}`);
  }
};

/**
 * Delete/cancel a reservation
 * @param {number} reservationId - The reservation ID to delete
 * @returns {Promise<Object>} API response confirming deletion
 */
export const deleteReservation = async (reservationId) => {
  try {
    if (!reservationId) {
      throw new Error('Reservation ID is required');
    }

    const response = await axios.delete(`${API_BASE_URL}/api/reservations/${reservationId}`);

    return response.data;
  } catch (error) {
    console.error('Error deleting reservation:', error);
    throw new Error(`Failed to delete reservation: ${error.response?.data?.message || error.message}`);
  }
};

/**
 * Cancel a reservation (alias for deleteReservation)
 * @param {number} reservationId - The reservation ID to cancel
 * @returns {Promise<Object>} API response confirming cancellation
 */
export const cancelReservation = async (reservationId) => {
  // Prefer server-side cancel endpoint which handles restoring resource availability
  try {
    const resp = await cancelReservationApi(reservationId);
    return resp;
  } catch (err) {
    // Fallback to hard delete if the cancel endpoint fails for any reason
    console.warn('Cancel endpoint failed, falling back to deleteReservation:', err?.message || err);
    return deleteReservation(reservationId);
  }
};

/**
 * Approve a reservation (admin/librarian function)
 * @param {number} reservationId - The reservation ID to approve
 * @param {string} reason - Optional reason for approval
 * @returns {Promise<Object>} API response with updated reservation data
 */
export const approveReservation = async (reservationId, reason = null) => {
  return updateReservationStatus(reservationId, {
    status: 'Approved',
    reason
  });
};

/**
 * Reject a reservation (admin/librarian function)
 * @param {number} reservationId - The reservation ID to reject
 * @param {string} reason - Reason for rejection
 * @returns {Promise<Object>} API response with updated reservation data
 */
export const rejectReservation = async (reservationId, reason) => {
  if (!reason) {
    throw new Error('Reason is required when rejecting a reservation');
  }

  return updateReservationStatus(reservationId, {
    status: 'Rejected',
    reason
  });
};

// Export all functions
export default {
  createBookReservation,
  createResearchReservation,
  createReservation,
  updateReservationStatus,
  updateReservationReason,
  deleteReservation,
  cancelReservation,
  approveReservation,
  rejectReservation
};

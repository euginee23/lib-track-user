import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Cancel a reservation using the server-side cancel endpoint.
 * This will mark the reservation as 'Cancelled' and, if it was previously
 * Approved, restore the book/research status back to 'Available'.
 *
 * POST /api/reservations/:id/cancel
 *
 * @param {number|string} reservationId
 * @returns {Promise<Object>} API response
 */
export const cancelReservation = async (reservationId) => {
  try {
    if (!reservationId) throw new Error('Reservation ID is required');
    const resp = await axios.post(`${API_BASE_URL}/api/reservations/${reservationId}/cancel`);
    return resp.data;
  } catch (err) {
    console.error('Error cancelling reservation via cancel endpoint:', err?.response?.data || err.message || err);
    throw new Error(err.response?.data?.message || 'Failed to cancel reservation');
  }
};

export default {
  cancelReservation
};

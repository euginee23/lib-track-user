import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Delete a single notification by id
 * DELETE /api/notifications/:id
 * @param {number|string} id
 */
export const deleteNotification = async (id) => {
  try {
    if (!id) throw new Error('notification id is required');
    const resp = await axios.delete(`${API_BASE_URL}/api/notifications/${id}`);
    return resp.data;
  } catch (err) {
    console.error('User: Error deleting notification', err?.response?.data || err.message || err);
    throw new Error(err.response?.data?.message || 'Failed to delete notification');
  }
};

/**
 * Batch delete or delete by user
 * DELETE /api/notifications (body: { ids: [..] } or { user_id })
 * @param {Object} payload
 */
export const deleteNotifications = async (payload = {}) => {
  try {
    const resp = await axios.delete(`${API_BASE_URL}/api/notifications`, { data: payload });
    return resp.data;
  } catch (err) {
    console.error('User: Error batch deleting notifications', err?.response?.data || err.message || err);
    throw new Error(err.response?.data?.message || 'Failed to delete notifications');
  }
};

export default {
  deleteNotification,
  deleteNotifications
};

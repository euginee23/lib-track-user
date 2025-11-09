import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Fetch notifications for a user (or all) with pagination
 * GET /api/notifications?user_id=&page=&limit=
 * @param {Object} options
 * @param {number|string} options.user_id - optional user id to filter
 * @param {number} options.page - page number (default 1)
 * @param {number} options.limit - items per page (default 25)
 * @returns {Promise<Object>} { notifications: [], pagination: {...} }
 */
export const getNotifications = async ({ user_id, page = 1, limit = 25 } = {}) => {
  try {
    const params = new URLSearchParams();
    if (user_id !== undefined && user_id !== null) params.append('user_id', String(user_id));
    params.append('page', String(page));
    params.append('limit', String(limit));

    const url = `${API_BASE_URL}/api/notifications?${params.toString()}`;
    const resp = await axios.get(url);
    return resp.data;
  } catch (err) {
    console.error('User: Error fetching notifications', err?.response?.data || err.message || err);
    throw new Error(err.response?.data?.message || 'Failed to fetch notifications');
  }
};

export default {
  getNotifications
};

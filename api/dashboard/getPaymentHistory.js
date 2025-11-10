const API_URL = import.meta.env.VITE_API_URL;

/**
 * Fetch payment history (penalties) for a specific user
 * @param {number} userId - The user's ID
 * @returns {Promise<Array>} Array of penalty records with payment status
 */
export async function getPaymentHistory(userId) {
  try {
    const response = await fetch(`${API_URL}/api/penalties/user/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success && data.data && data.data.penalties) {
      return data.data.penalties;
    }

    return [];
  } catch (error) {
    console.error('Error fetching payment history:', error);
    throw error;
  }
}

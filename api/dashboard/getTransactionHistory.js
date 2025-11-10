const API_URL = import.meta.env.VITE_API_URL;

/**
 * Fetch transaction history for a specific user
 * @param {number|string} userId - The user ID to fetch transactions for
 * @returns {Promise<Array>} Array of transaction objects
 */
export async function getTransactionHistory(userId) {
  try {
    if (!userId) {
      throw new Error('User ID is required to fetch transaction history');
    }

    const response = await fetch(`${API_URL}/api/transactions/user/${userId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      credentials: 'omit',
      cache: 'no-cache',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch transaction history: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch transaction history');
    }

    return data.data || [];
  } catch (error) {
    console.error("Error fetching transaction history:", error);
    throw error;
  }
}

/**
 * Fetch ongoing/borrowed transactions for a specific user
 * @param {number|string} userId - The user ID to fetch transactions for
 * @returns {Promise<Array>} Array of ongoing transaction objects
 */
export async function getOngoingTransactions(userId) {
  try {
    if (!userId) {
      throw new Error('User ID is required to fetch ongoing transactions');
    }

    const response = await fetch(`${API_URL}/api/transactions?user_id=${userId}&transaction_type=borrow`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      credentials: 'omit',
      cache: 'no-cache',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ongoing transactions: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch ongoing transactions');
    }

    return data.data || [];
  } catch (error) {
    console.error("Error fetching ongoing transactions:", error);
    throw error;
  }
}

/**
 * Fetch returned transactions (transaction history with return type)
 * @param {number|string} userId - The user ID to fetch returned transactions for
 * @returns {Promise<Array>} Array of returned transaction objects
 */
export async function getReturnedTransactions(userId) {
  try {
    if (!userId) {
      throw new Error('User ID is required to fetch returned transactions');
    }

    const response = await fetch(`${API_URL}/api/transactions/history?user_id=${userId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      credentials: 'omit',
      cache: 'no-cache',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch returned transactions: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch returned transactions');
    }

    return data.data || [];
  } catch (error) {
    console.error("Error fetching returned transactions:", error);
    throw error;
  }
}

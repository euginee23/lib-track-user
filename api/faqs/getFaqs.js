import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Fetch active FAQs from server
 */
export const getFaqs = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/faqs`, {
      params: { active: 1 }
    });
    
    if (response.data && response.data.success) {
      return response.data.data;
    }
    return [];
  } catch (err) {
    console.error('Error fetching FAQs:', err);
    return [];
  }
};

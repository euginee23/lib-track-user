import axios from 'axios';

// Use Vite env var when available; fallback to relative API path
const ENV_BASE = import.meta.env.VITE_CHATBOT_BASE_URL || '';
const DEFAULT_PATH = '/api/chatbot';

let API_BASE_URL = '';
try {
  const isBrowser = typeof window !== 'undefined' && !!window.location;
  const pageIsHttps = isBrowser && window.location.protocol === 'https:';

  if (ENV_BASE) {
    if (pageIsHttps && ENV_BASE.startsWith('http://')) {
      console.warn('ChatbotService: page is HTTPS but VITE_CHATBOT_BASE_URL uses http:// — switching to same-origin /api/chatbot/proxy to avoid mixed-content.');
      API_BASE_URL = `${DEFAULT_PATH}/proxy`;
    } else {
      API_BASE_URL = ENV_BASE.replace(/\/$/, '') + DEFAULT_PATH;
    }
  } else {
    API_BASE_URL = DEFAULT_PATH;
  }
} catch (e) {
  API_BASE_URL = ENV_BASE ? ENV_BASE.replace(/\/$/, '') + DEFAULT_PATH : DEFAULT_PATH;
}

/**
 * Rule-Based Chatbot API Service
 * Handles communication with the rule-based chatbot backend
 */

class ChatbotService {
  constructor() {
    this.sessionId = null;
    this.baseURL = `${API_BASE_URL}`;
    this.isOnline = true;
    
    console.warn('ChatbotService: using API base URL ->', this.baseURL);
  }

  /**
   * Initialize a new chat session
   */
  async initializeSession(userId = null) {
    try {
      const response = await axios.post(`${this.baseURL}/generate-session`, { userId });
      this.sessionId = response.data.sessionId;
      return this.sessionId;
    } catch (error) {
      console.error('Failed to initialize session:', error);
      this.sessionId = `session_${Date.now()}`;
      return this.sessionId;
    }
  }

  /**
   * Send a message to the chatbot and get a response
   * @param {string} message - User's message
   * @param {Object} userInfo - User information (userId, userName, userRole)
   */
  async sendMessage(message, userInfo = {}) {
    try {
      // Ensure we have a session
      if (!this.sessionId) {
        await this.initializeSession(userInfo.userId);
      }

      const url = `${this.baseURL}/chat`;
      console.debug('ChatbotService: sending message to', url);

      const response = await axios.post(url, {
        message,
        sessionId: this.sessionId,
        userId: userInfo.userId,
        userName: userInfo.userName,
        userRole: userInfo.userRole
      }, {
        timeout: 10000 // 10 second timeout
      });

      this.isOnline = true;
      return response.data;
    } catch (error) {
      this.isOnline = false;
      console.error('ChatbotService: sendMessage failed', {
        message,
        errorMessage: error.message,
        status: error.response?.status
      });
      throw new Error(error.response?.data?.message || error.message || 'Failed to send message');
    }
  }

  /**
   * Get conversation history
   */
  async getHistory() {
    try {
      if (!this.sessionId) {
        return { success: false, messages: [] };
      }

      const response = await axios.get(`${this.baseURL}/history/${this.sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting history:', error);
      return { success: false, messages: [] };
    }
  }

  /**
   * Clear conversation history
   */
  async clearHistory() {
    try {
      if (!this.sessionId) {
        return { success: true };
      }

      const response = await axios.delete(`${this.baseURL}/history/${this.sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Error clearing history:', error);
      return { success: false };
    }
  }

  /**
   * Start a new conversation (clear history and generate new session)
   */
  async startNewConversation(userId = null) {
    await this.clearHistory();
    await this.initializeSession(userId);
  }

  /**
   * Check chatbot service status
   */
  async checkStatus() {
    try {
      const response = await axios.get(`${this.baseURL}/status`);
      return response.data;
    } catch (error) {
      console.error('Error checking status:', error);
      return {
        success: false,
        status: 'offline',
        error: 'Unable to connect to chatbot service'
      };
    }
  }

  /**
   * Get current session ID
   */
  getSessionId() {
    return this.sessionId;
  }

  /**
   * Set session ID (useful for resuming conversations)
   */
  setSessionId(sessionId) {
    this.sessionId = sessionId;
  }
  
  /**
   * Check if service is online
   */
  isServiceOnline() {
    return this.isOnline;
  }
  
  /**
   * Perform health check
   */
  async performHealthCheck() {
    try {
      const response = await axios.get(`${this.baseURL}/status`, { timeout: 5000 });
      this.isOnline = response.data.success;
      return this.isOnline;
    } catch (error) {
      this.isOnline = false;
      return false;
    }
  }
}

// Create singleton instance
const chatbotService = new ChatbotService();

export default chatbotService;
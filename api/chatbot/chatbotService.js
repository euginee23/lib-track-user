import axios from 'axios';

// Use Vite env var when available; fallback to relative API path so
// deployed frontend doesn't call localhost and avoids mixed-content issues.
const ENV_BASE = import.meta.env.VITE_CHATBOT_BASE_URL || '';
const DEFAULT_PATH = '/api/chatbot';

// Build-time base. We'll allow a runtime override in the browser so deployed
// builds don't accidentally call localhost if the env var was set to it
let API_BASE_URL = ENV_BASE ? ENV_BASE.replace(/\/$/, '') + DEFAULT_PATH : DEFAULT_PATH;

try {
  if (typeof window !== 'undefined' && window.location) {
    const clientHost = window.location.hostname;
    // If the client is not running on localhost but the resolved API_BASE_URL
    // points to localhost, switch to the relative default path so the browser
    // talks to the same origin (avoids calling user's machine).
    if (!['localhost', '127.0.0.1'].includes(clientHost) && /localhost|127\\.0\\.0\\.1/.test(API_BASE_URL)) {
      API_BASE_URL = DEFAULT_PATH;
    }
  }
} catch (e) {
  // ignore errors during runtime detection
}

// Extra guard: if the page is served over HTTPS (deployed) and the API_BASE_URL
// still points to localhost (e.g. embedded at build time), force the relative
// path so browsers do not attempt mixed-content or client-localhost connections.
try {
  if (typeof window !== 'undefined' && window.location && window.location.protocol === 'https:') {
    if (/localhost|127\.0\.0\.1/.test(API_BASE_URL)) {
      API_BASE_URL = DEFAULT_PATH;
    }
  }
} catch (e) {
  // ignore
}

/**
 * Ollama-powered Chatbot API Service
 * Handles communication with the AI chatbot backend
 */

class ChatbotService {
  constructor() {
    this.sessionId = null;
    this.baseURL = `${API_BASE_URL}`;
    // Log the resolved base URL so deployed builds can be debugged easily
    // (this will appear in browser console of deployed app)
    try {
      console.warn('ChatbotService: using API base URL ->', this.baseURL);
    } catch (e) {
      // ignore if console is not available in some environments
    }
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

      const response = await axios.post(`${this.baseURL}/chat`, {
        message,
        sessionId: this.sessionId,
        userId: userInfo.userId,
        userName: userInfo.userName,
        userRole: userInfo.userRole
      });

      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error(error.response?.data?.message || 'Failed to send message');
    }
  }

  /**
   * Send a message with streaming response
   * @param {string} message - User's message
   * @param {Object} userInfo - User information
   * @param {Function} onChunk - Callback for each chunk of response
   */
  async sendMessageStream(message, userInfo = {}, onChunk) {
    try {
      // Ensure we have a session
      if (!this.sessionId) {
        await this.initializeSession(userInfo.userId);
      }

      const response = await fetch(`${this.baseURL}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          sessionId: this.sessionId,
          userId: userInfo.userId,
          userName: userInfo.userName,
          userRole: userInfo.userRole
        })
      });

      if (!response.ok) {
        throw new Error('Stream request failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              return;
            }
            try {
              const parsed = JSON.parse(data);
              onChunk(parsed);
            } catch (e) {
              console.error('Error parsing chunk:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error in streaming:', error);
      throw error;
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
}

// Create singleton instance
const chatbotService = new ChatbotService();

export default chatbotService;

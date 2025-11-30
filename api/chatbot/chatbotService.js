import axios from 'axios';

// Use Vite env var when available; fallback to relative API path so
// deployed frontend doesn't call localhost and avoids mixed-content issues.
const ENV_BASE = import.meta.env.VITE_CHATBOT_BASE_URL || '';
const DEFAULT_PATH = '/api/chatbot';

// When the frontend page is served over HTTPS, browsers will block requests to
// plain HTTP endpoints (mixed-content). If the user sets an explicit HTTP
// backend URL in `VITE_CHATBOT_BASE_URL` and the page is HTTPS, prefer the
// same-origin proxy path so the browser can reach the chatbot via the server.
let API_BASE_URL = '';
try {
  const isBrowser = typeof window !== 'undefined' && !!window.location;
  const pageIsHttps = isBrowser && window.location.protocol === 'https:';

  if (ENV_BASE) {
    // If env base is present but page is HTTPS and env uses http://, switch
    // to same-origin path to avoid mixed-content. This keeps your internal
    // chatbot service HTTP-only on the VPS while allowing the browser to talk
    // to a proxy on the same origin.
    if (pageIsHttps && ENV_BASE.startsWith('http://')) {
      try { console.warn('ChatbotService: page is HTTPS but VITE_CHATBOT_BASE_URL uses http:// — switching to same-origin /api/chatbot/proxy to avoid mixed-content.'); } catch(e){}
      API_BASE_URL = `${DEFAULT_PATH}/proxy`; // use server-side proxy at /api/chatbot/proxy
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
      const url = `${this.baseURL}/chat`;
      try { console.debug('ChatbotService: sending message to', url, { message, sessionId: this.sessionId, userInfo }); } catch (e) {}

      const response = await axios.post(url, {
        message,
        sessionId: this.sessionId,
        userId: userInfo.userId,
        userName: userInfo.userName,
        userRole: userInfo.userRole
      });

      return response.data;
    } catch (error) {
      try {
        console.error('ChatbotService: sendMessage failed', {
          message,
          sessionId: this.sessionId,
          baseURL: this.baseURL,
          errorMessage: error.message,
          status: error.response?.status,
          responseData: error.response?.data
        });
      } catch (e) {}
      throw new Error(error.response?.data?.message || error.message || 'Failed to send message');
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
      const streamUrl = `${this.baseURL}/chat/stream`;
      try { console.debug('ChatbotService: opening stream to', streamUrl, { message, sessionId: this.sessionId, userInfo }); } catch (e) {}

      const response = await fetch(streamUrl, {
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
        const text = await response.text().catch(() => '(no body)');
        console.error('ChatbotService: stream request returned non-ok', { status: response.status, body: text });
        throw new Error('Stream request failed: ' + (response.status || '') + ' ' + text);
      }

      // Robust SSE parsing: buffer across reads and split on \n\n (SSE message delimiter)
      if (!response.body || !response.body.getReader) {
        throw new Error('Streaming not supported by environment (no readable stream)');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process full SSE messages separated by blank line
        let idx;
        while ((idx = buffer.indexOf('\n\n')) !== -1) {
          const raw = buffer.slice(0, idx).trim();
          buffer = buffer.slice(idx + 2);

          if (!raw) continue;

          // Each message may contain multiple lines; find 'data: ' lines
          const lines = raw.split('\n');
          let dataLines = [];
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              dataLines.push(line.slice(6));
            }
          }

          if (dataLines.length === 0) continue;

          const data = dataLines.join('\n');
          if (data === '[DONE]') {
            return;
          }

          try {
            const parsed = JSON.parse(data);
            try { onChunk(parsed); } catch (e) { console.error('onChunk handler error:', e); }
          } catch (e) {
            console.error('ChatbotService: failed to parse SSE data as JSON', { data, err: e });
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

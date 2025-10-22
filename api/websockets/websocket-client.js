const serverUrl = import.meta.env.VITE_WS_URL;

class WebSocketClient {
  constructor() {
    this.serverUrl = serverUrl;
    this.socket = null;
    this.listeners = {};
    this.messageQueue = [];
    this.isOpen = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.isConnecting = false;
    this.initialConnectionDelay = 1000; // Wait 1 second before first connection attempt
  }

  connect() {
    if (!this.serverUrl) {
      console.error("WebSocket URL not configured");
      return;
    }

    if (this.isConnecting || this.isOpen) {
      return; // Prevent duplicate connection attempts
    }

    // Add delay for initial connection to let server start up
    const delay = this.reconnectAttempts === 0 ? this.initialConnectionDelay : 0;
    
    setTimeout(() => {
      this.attemptConnection();
    }, delay);
  }

  attemptConnection() {
    if (this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    try {
      this.socket = new WebSocket(this.serverUrl);

      this.socket.onopen = () => {
        this.isOpen = true;
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        console.log("✅ User connected to WebSocket server");
        
        // Send any queued messages
        while (this.messageQueue.length > 0) {
          const { type, payload } = this.messageQueue.shift();
          this.send(type, payload);
        }
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const { type, payload } = data;

          if (this.listeners[type]) {
            this.listeners[type].forEach((callback) => callback(payload));
          }
        } catch (error) {
          console.error("Invalid JSON received:", event.data);
        }
      };

      this.socket.onclose = (event) => {
        this.isOpen = false;
        this.isConnecting = false;
        
        // Only log error if it's not a manual close and not the first attempt
        if (event.code !== 1000 && this.reconnectAttempts > 0) {
          console.log("❌ User disconnected from WebSocket server");
        }
        
        // Attempt to reconnect if not a manual close
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.attemptReconnect();
        }
      };

      this.socket.onerror = (error) => {
        this.isConnecting = false;
        
        // Only log error after first attempt to avoid initial startup noise
        if (this.reconnectAttempts > 0) {
          console.error("WebSocket error:", error);
        }
      };

    } catch (error) {
      this.isConnecting = false;
      console.error("Failed to create WebSocket connection:", error);
    }
  }

  attemptReconnect() {
    this.reconnectAttempts++;
    console.log(`🔄 User WebSocket attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
    
    setTimeout(() => {
      this.attemptConnection();
    }, this.reconnectDelay);
  }

  send(type, payload) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, payload }));
    } else if (!this.isOpen) {
      // Queue the message if not open yet
      this.messageQueue.push({ type, payload });
      console.warn("WebSocket not open, message queued");
    } else {
      console.error("WebSocket is not open");
    }
  }

  on(type, callback) {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(callback);
  }

  off(type, callback) {
    if (this.listeners[type]) {
      this.listeners[type] = this.listeners[type].filter((cb) => cb !== callback);
    }
  }

  close() {
    if (this.socket) {
      this.socket.close(1000, 'Manual close');
      this.isOpen = false;
      this.isConnecting = false;
      this.reconnectAttempts = 0;
    }
  }
}

export default WebSocketClient;
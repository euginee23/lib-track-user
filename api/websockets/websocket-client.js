const serverUrl = import.meta.env.VITE_WS_URL;


class WebSocketClient {
  constructor() {
    this.serverUrl = serverUrl;
    this.socket = null;
    this.listeners = {};
    this.messageQueue = [];
    this.isOpen = false;
  }

  connect() {
    this.socket = new WebSocket(this.serverUrl);

    this.socket.onopen = () => {
      this.isOpen = true;
      console.log("✅ Connected to WebSocket server");
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

    this.socket.onclose = () => {
      this.isOpen = false;
      console.log("❌ Disconnected from WebSocket server");
    };

    this.socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
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
      this.socket.close();
      this.isOpen = false;
    }
  }
}

export default WebSocketClient;
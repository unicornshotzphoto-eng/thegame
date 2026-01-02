/**
 * WebSocket Client for real-time communication
 * Handles connections to Django Channels WebSocket endpoints
 */

import { Platform } from 'react-native';
import { API_BASE_URL } from './apiConfig';

class WebSocketClient {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 2000;
    this.listeners = new Map();
  }

  /**
   * Get WebSocket URL based on API base URL
   */
  getWebSocketURL(endpoint) {
    const baseURL = (() => {
      if (API_BASE_URL && API_BASE_URL !== 'auto') {
        return API_BASE_URL;
      }
      if (Platform.OS === 'web') {
        return 'http://localhost:8000/';
      }
      if (Platform.OS === 'android') {
        return 'http://10.0.2.2:8000/';
      }
      return 'http://localhost:8000/';
    })();
    // Convert http:// to ws:// and https:// to wss://
    const wsBaseURL = baseURL.replace(/^http/, 'ws');
    return `${wsBaseURL}${endpoint}`;
  }

  /**
   * Connect to a WebSocket endpoint
   * @param {string} endpoint - WebSocket endpoint (e.g., 'ws/chat/room1/')
   * @param {Object} options - Connection options
   */
  connect(endpoint, options = {}) {
    const url = this.getWebSocketURL(endpoint);
    console.log('🔌 Connecting to WebSocket:', url);

    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('✅ WebSocket connected:', endpoint);
        this.reconnectAttempts = 0;
        if (options.onOpen) options.onOpen();
        this.emit('open', {});
      };

      this.ws.onclose = (event) => {
        console.log('🔌 WebSocket closed:', event.code, event.reason);
        if (options.onClose) options.onClose(event);
        this.emit('close', event);
        
        // Auto-reconnect if not manually closed
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`🔄 Reconnecting... (Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
          setTimeout(() => {
            this.connect(endpoint, options);
          }, this.reconnectDelay * this.reconnectAttempts);
        }
      };

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        if (options.onError) options.onError(error);
        this.emit('error', error);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📨 WebSocket message received:', data);
          if (options.onMessage) options.onMessage(data);
          this.emit('message', data);
          
          // Emit specific event type if present
          if (data.type) {
            this.emit(data.type, data);
          }
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
        }
      };
    } catch (error) {
      console.error('❌ Error creating WebSocket:', error);
      if (options.onError) options.onError(error);
    }

    return this;
  }

  /**
   * Send data through WebSocket
   * @param {Object} data - Data to send
   */
  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = typeof data === 'string' ? data : JSON.stringify(data);
      console.log('📤 Sending WebSocket message:', data);
      this.ws.send(message);
    } else {
      console.warn('⚠️ WebSocket not connected. Cannot send message.');
    }
  }

  /**
   * Close WebSocket connection
   */
  close() {
    if (this.ws) {
      console.log('🔌 Closing WebSocket connection');
      this.ws.close(1000, 'Client closed connection');
      this.ws = null;
      this.listeners.clear();
    }
  }

  /**
   * Add event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to listeners
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`❌ Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Get connection state
   */
  getReadyState() {
    if (!this.ws) return WebSocket.CLOSED;
    return this.ws.readyState;
  }
}

/**
 * Chat WebSocket Manager
 */
export class ChatWebSocket extends WebSocketClient {
  constructor(roomName) {
    super();
    this.roomName = roomName;
  }

  connect(options = {}) {
    return super.connect(`ws/chat/${this.roomName}/`, options);
  }

  sendMessage(message, username, image = null) {
    this.send({
      type: 'chat_message',
      message,
      username,
      image,
      timestamp: new Date().toISOString(),
    });
  }

  sendImage(imageBase64, username, caption = '') {
    this.send({
      type: 'chat_message',
      message: caption,
      username,
      image: imageBase64,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Game WebSocket Manager
 */
export class GameWebSocket extends WebSocketClient {
  constructor(gameId) {
    super();
    this.gameId = gameId;
  }

  connect(options = {}) {
    return super.connect(`ws/game/${this.gameId}/`, options);
  }

  sendGameUpdate(data) {
    this.send({
      type: 'game_update',
      ...data,
    });
  }
}

/**
 * Notification WebSocket Manager
 */
export class NotificationWebSocket extends WebSocketClient {
  connect(options = {}) {
    return super.connect('ws/notifications/', options);
  }
}

export default WebSocketClient;

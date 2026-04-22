import { RealtimeEvent, TestProgress } from './realtime-server';

export interface RealtimeClientConfig {
  websocketUrl?: string;
  sseUrl?: string;
  preferredProtocol?: 'websocket' | 'sse' | 'auto';
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  onEvent?: (event: RealtimeEvent) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

export class RealtimeMonitoringClient {
  private config: Required<RealtimeClientConfig>;
  private ws?: WebSocket;
  private eventSource?: EventSource;
  private isConnecting = false;
  private isConnected = false;
  private reconnectAttempts = 0;
  private reconnectTimeout?: NodeJS.Timeout;
  private currentProtocol: 'websocket' | 'sse' | 'none' = 'none';

  constructor(config: RealtimeClientConfig = {}) {
    this.config = {
      websocketUrl: config.websocketUrl || 'ws://localhost:8080',
      sseUrl: config.sseUrl || 'http://localhost:8081/events',
      preferredProtocol: config.preferredProtocol || 'auto',
      reconnectInterval: config.reconnectInterval || 3000,
      maxReconnectAttempts: config.maxReconnectAttempts || 10,
      onEvent: config.onEvent || (() => {}),
      onConnect: config.onConnect || (() => {}),
      onDisconnect: config.onDisconnect || (() => {}),
      onError: config.onError || (() => {})
    };
  }

  /**
   * Connect to the monitoring server
   */
  async connect(): Promise<void> {
    if (this.isConnecting || this.isConnected) {
      return;
    }

    this.isConnecting = true;

    try {
      if (this.config.preferredProtocol === 'auto') {
        // Try WebSocket first, fallback to SSE
        try {
          await this.connectWebSocket();
        } catch (error) {
          console.log('WebSocket connection failed, trying SSE...');
          await this.connectSSE();
        }
      } else if (this.config.preferredProtocol === 'websocket') {
        await this.connectWebSocket();
      } else if (this.config.preferredProtocol === 'sse') {
        await this.connectSSE();
      }
    } catch (error) {
      this.isConnecting = false;
      this.config.onError(error as Error);
      throw error;
    }
  }

  /**
   * Disconnect from the monitoring server
   */
  disconnect(): void {
    this.clearReconnectTimeout();
    
    if (this.ws) {
      this.ws.close();
      this.ws = undefined;
    }
    
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = undefined;
    }
    
    this.isConnected = false;
    this.isConnecting = false;
    this.currentProtocol = 'none';
    this.config.onDisconnect();
  }

  /**
   * Send message to server (WebSocket only)
   */
  send(message: any): void {
    if (this.currentProtocol === 'websocket' && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('Cannot send message: not connected via WebSocket');
    }
  }

  /**
   * Connect via WebSocket
   */
  private async connectWebSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.config.websocketUrl);
        this.currentProtocol = 'websocket';

        this.ws.onopen = () => {
          console.log('Connected via WebSocket');
          this.isConnected = true;
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.config.onConnect();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.config.onEvent(data);
          } catch (error) {
            console.error('Invalid WebSocket message:', error);
          }
        };

        this.ws.onclose = () => {
          console.log('WebSocket connection closed');
          this.handleDisconnect();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnecting = false;
          reject(new Error('WebSocket connection failed'));
        };

        // Connection timeout
        setTimeout(() => {
          if (this.isConnecting) {
            this.ws?.close();
            reject(new Error('WebSocket connection timeout'));
          }
        }, 5000);

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Connect via Server-Sent Events
   */
  private async connectSSE(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.eventSource = new EventSource(this.config.sseUrl);
        this.currentProtocol = 'sse';

        this.eventSource.onopen = () => {
          console.log('Connected via SSE');
          this.isConnected = true;
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.config.onConnect();
          resolve();
        };

        this.eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.config.onEvent(data);
          } catch (error) {
            console.error('Invalid SSE message:', error);
          }
        };

        this.eventSource.onerror = (error) => {
          console.error('SSE error:', error);
          this.isConnecting = false;
          
          if (this.eventSource?.readyState === EventSource.CLOSED) {
            reject(new Error('SSE connection failed'));
          }
        };

        // Connection timeout
        setTimeout(() => {
          if (this.isConnecting) {
            this.eventSource?.close();
            reject(new Error('SSE connection timeout'));
          }
        }, 5000);

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Handle disconnection and attempt reconnection
   */
  private handleDisconnect(): void {
    this.isConnected = false;
    this.config.onDisconnect();

    if (this.reconnectAttempts < this.config.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting reconnection ${this.reconnectAttempts}/${this.config.maxReconnectAttempts}...`);
      
      this.reconnectTimeout = setTimeout(() => {
        this.connect().catch(error => {
          console.error('Reconnection failed:', error);
        });
      }, this.config.reconnectInterval);
    } else {
      console.error('Max reconnection attempts reached');
      this.config.onError(new Error('Max reconnection attempts reached'));
    }
  }

  /**
   * Clear reconnection timeout
   */
  private clearReconnectTimeout(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = undefined;
    }
  }

  /**
   * Get connection status
   */
  getStatus(): {
    connected: boolean;
    protocol: 'websocket' | 'sse' | 'none';
    reconnectAttempts: number;
  } {
    return {
      connected: this.isConnected,
      protocol: this.currentProtocol,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  /**
   * Request latest metrics from server
   */
  requestMetrics(): void {
    this.send({ type: 'get_metrics' });
  }

  /**
   * Subscribe to real-time updates
   */
  subscribe(): void {
    this.send({ type: 'subscribe' });
  }

  /**
   * Ping server
   */
  ping(): void {
    this.send({ type: 'ping' });
  }
}

/**
 * Browser-compatible real-time monitoring client
 */
export class BrowserRealtimeClient extends RealtimeMonitoringClient {
  constructor(config: RealtimeClientConfig = {}) {
    // Auto-detect URLs for browser environment
    const browserConfig = {
      ...config,
      websocketUrl: config.websocketUrl || `ws://${window.location.host}/ws`,
      sseUrl: config.sseUrl || `http://${window.location.host}/events`
    };

    super(browserConfig);
  }

  /**
   * Create browser-specific event handlers
   */
  setupBrowserEvents(): void {
    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Page is hidden, reduce activity
        this.disconnect();
      } else {
        // Page is visible, reconnect
        this.connect().catch(error => {
          console.error('Failed to reconnect on page visibility change:', error);
        });
      }
    });

    // Handle page unload
    window.addEventListener('beforeunload', () => {
      this.disconnect();
    });
  }
}

/**
 * Utility function to create and connect a client with sensible defaults
 */
export async function createMonitoringClient(config?: RealtimeClientConfig): Promise<RealtimeMonitoringClient> {
  const client = new RealtimeMonitoringClient(config);
  await client.connect();
  return client;
}

// Export types for external use
export type { RealtimeEvent, TestProgress };

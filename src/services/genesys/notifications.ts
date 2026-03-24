import { genesysApi } from './auth';
import { getGenesysConfig } from './config';
import { getAccessToken } from './auth';

// ===== Genesys Notification API (WebSocket) =====
// Creates a persistent WebSocket connection for realtime updates

interface NotificationChannel {
  id: string;
  connectUri: string;
  expires: string;
}

interface NotificationChannelResponse {
  id: string;
  connectUri: string;
  expires: string;
}

export type NotificationHandler = (topic: string, data: unknown) => void;

export class GenesysNotificationService {
  private channel: NotificationChannel | null = null;
  private ws: WebSocket | null = null;
  private handler: NotificationHandler;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private subscribedTopics: string[] = [];
  private isShuttingDown = false;

  constructor(handler: NotificationHandler) {
    this.handler = handler;
  }

  async connect(): Promise<void> {
    try {
      // Step 1: Create notification channel
      this.channel = await genesysApi<NotificationChannelResponse>(
        '/api/v2/notifications/channels',
        { method: 'POST' }
      );

      console.log('[Genesys WS] Channel created:', this.channel.id);

      // Step 2: Connect WebSocket
      const token = await getAccessToken();
      const wsUrl = `${this.channel.connectUri}?access_token=${token}`;

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[Genesys WS] Connected');
        this.startHeartbeat();

        // Re-subscribe topics if reconnecting
        if (this.subscribedTopics.length > 0) {
          this.subscribeTopics(this.subscribedTopics);
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          // Skip heartbeat/system messages
          if (message.topicName === 'channel.metadata') return;

          this.handler(message.topicName, message.eventBody);
        } catch (error) {
          console.error('[Genesys WS] Error parsing message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.warn('[Genesys WS] Disconnected:', event.code, event.reason);
        this.stopHeartbeat();

        if (!this.isShuttingDown) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('[Genesys WS] Error:', error);
      };
    } catch (error) {
      console.error('[Genesys WS] Failed to connect:', error);
      this.scheduleReconnect();
    }
  }

  async subscribeTopics(topics: string[]): Promise<void> {
    if (!this.channel) {
      console.warn('[Genesys WS] No channel, cannot subscribe');
      return;
    }

    this.subscribedTopics = [...new Set([...this.subscribedTopics, ...topics])];

    const body = this.subscribedTopics.map(topic => ({ id: topic }));

    await genesysApi(
      `/api/v2/notifications/channels/${this.channel.id}/subscriptions`,
      {
        method: 'POST',
        body,
      }
    );

    console.log(`[Genesys WS] Subscribed to ${topics.length} topics`);
  }

  // Subscribe to queue observation updates
  async subscribeToQueues(queueIds: string[]): Promise<void> {
    const topics = queueIds.map(id => `v2.analytics.queues.${id}.observations`);
    await this.subscribeTopics(topics);
  }

  // Subscribe to user presence & conversation updates
  async subscribeToUsers(userIds: string[]): Promise<void> {
    const topics = userIds.flatMap(id => [
      `v2.users.${id}.presence`,
      `v2.users.${id}.conversations`,
      `v2.users.${id}.routingStatus`,
    ]);
    await this.subscribeTopics(topics);
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ message: 'ping' }));
      }
    }, 30000); // Every 30 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;

    console.log('[Genesys WS] Reconnecting in 5 seconds...');
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 5000);
  }

  disconnect(): void {
    this.isShuttingDown = true;
    this.stopHeartbeat();

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    // Delete channel
    if (this.channel) {
      genesysApi(`/api/v2/notifications/channels/${this.channel.id}`, { method: 'DELETE' }).catch(() => {});
      this.channel = null;
    }

    console.log('[Genesys WS] Disconnected');
  }
}

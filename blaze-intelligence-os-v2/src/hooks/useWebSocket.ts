import { useEffect, useRef, useState, useCallback } from 'react';
import { WebSocketMessage } from '../types';

interface UseWebSocketOptions {
  onOpen?: () => void;
  onMessage?: (data: any) => void;
  onError?: (error: Event) => void;
  onClose?: () => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export function useWebSocket(url?: string | null, options: UseWebSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const {
    onOpen,
    onMessage,
    onError,
    onClose,
    reconnectInterval = 5000,
    maxReconnectAttempts = 10
  } = options;

  const isBrowser = typeof window !== 'undefined' && typeof WebSocket !== 'undefined';
  const shouldAttemptConnection = Boolean(url && isBrowser);

  const connect = useCallback(() => {
    if (!shouldAttemptConnection) {
      setIsConnected(false);
      return;
    }

    try {
      const ws = new WebSocket(url!);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected to:', url);
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
        onOpen?.();
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
          onMessage?.(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        onError?.(error);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        wsRef.current = null;
        onClose?.();

        if (shouldAttemptConnection && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          console.log(`Reconnecting... Attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts}`);
          reconnectTimeoutRef.current = setTimeout(connect, reconnectInterval);
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setIsConnected(false);
    }
  }, [shouldAttemptConnection, url, onOpen, onMessage, onError, onClose, reconnectInterval, maxReconnectAttempts]);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (!shouldAttemptConnection) {
      console.warn('WebSocket connection disabled. Message not sent:', message);
      return false;
    }

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const messageId = typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);

      const messageWithTimestamp = {
        ...message,
        timestamp: new Date().toISOString(),
        id: messageId
      };
      wsRef.current.send(JSON.stringify(messageWithTimestamp));
      return true;
    }
    console.warn('WebSocket is not connected. Message not sent:', message);
    return false;
  }, [shouldAttemptConnection]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  useEffect(() => {
    if (!shouldAttemptConnection) {
      setIsConnected(false);
      return;
    }

    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect, shouldAttemptConnection]);

  return {
    isConnected,
    sendMessage,
    lastMessage,
    disconnect,
    reconnect: connect
  };
}

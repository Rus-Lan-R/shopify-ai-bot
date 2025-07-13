import { useEffect, useRef } from "react";

export const useWebsocket = (props: {
  wsUrl: string;
  path: string;
  onMessage: (e: MessageEvent) => void;
  onOpen: (ws: WebSocket) => void;
  onError?: () => void;
  onClose?: () => void;
  onReconnect?: () => void;
}) => {
  const ws = useRef<WebSocket | null>(null);
  const { path, wsUrl, onError, onMessage, onOpen, onClose, onReconnect } =
    props;

  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

  const wsConnect = () => {
    ws.current = new WebSocket(`${wsUrl}/ws/${path}`);
    ws.current.onopen = () => {
      if (ws.current) {
        onOpen(ws.current);
      }
    };
    ws.current.onmessage = onMessage;
    if (onError) {
      ws.current.onerror = onError;
    }
    if (onClose) {
      ws.current.onclose = onClose;
      ws.current.addEventListener("close", () => {
        onReconnect?.();
        scheduleReconnect();
      });
    }
  };

  const scheduleReconnect = () => {
    if (reconnectTimeout.current) return;

    reconnectTimeout.current = setTimeout(() => {
      reconnectTimeout.current = null;
      ws.current?.close();
      wsConnect();
    }, 5000);
  };

  useEffect(() => {
    wsConnect();

    return () => {
      if (ws?.current && ws?.current?.readyState) {
        ws?.current?.close();
      }
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
    };
  }, []);

  return { socket: ws.current };
};

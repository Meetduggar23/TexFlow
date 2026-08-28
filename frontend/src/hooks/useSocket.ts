import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export default function useSocket(projectId: string | undefined) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (!projectId) return;

    const token = localStorage.getItem('token');
    const backendUrl = import.meta.env.VITE_API_URL || '';
    const newSocket = io(backendUrl || window.location.origin, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      auth: token ? { token } : undefined,
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      reconnectAttempts.current = 0;
      newSocket.emit('join-project', projectId);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason);
      if (reason === 'io server disconnect') {
        newSocket.connect();
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      reconnectAttempts.current++;
      if (reconnectAttempts.current >= maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
      }
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log('Reconnected after', attemptNumber, 'attempts');
      newSocket.emit('join-project', projectId);
    });

    newSocket.on('reconnect_attempt', (attemptNumber) => {
      console.log('Reconnection attempt:', attemptNumber);
    });

    newSocket.on('reconnect_failed', () => {
      console.error('Reconnection failed');
    });

    socketRef.current = newSocket;
    setSocket(newSocket);
  }, [projectId]);

  useEffect(() => {
    connect();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
    };
  }, [connect]);

  return socket;
}

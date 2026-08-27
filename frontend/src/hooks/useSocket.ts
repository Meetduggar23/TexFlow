import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export default function useSocket(projectId: string | undefined) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!projectId) return;

    const token = localStorage.getItem('token');
    const newSocket = io({
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      auth: token ? { token } : undefined,
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      newSocket.emit('join-project', projectId);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      socketRef.current = null;
      setSocket(null);
    };
  }, [projectId]);

  return socket;
}

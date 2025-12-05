import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const createSocketConnection = (namespace) => {
  const token = localStorage.getItem('accessToken');
  
  if (!token) {
    throw new Error('No access token found');
  }

  const socket = io(`${SOCKET_URL}/${namespace}`, {
    auth: {
      token: token
    },
    transports: ['websocket'],
    reconnection: true,
  });

  return socket;
};

export const chatSocket = () => createSocketConnection('chat');
export const visioSocket = () => createSocketConnection('visio');


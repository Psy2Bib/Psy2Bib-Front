// Configuration de base de l'API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper pour gérer les requêtes
const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Une erreur est survenue');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// API Auth
export const authAPI = {
  login: async (credentials) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  register: async (userData) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  logout: async () => {
    return apiRequest('/auth/logout', {
      method: 'POST',
    });
  },

  verifyToken: async () => {
    return apiRequest('/auth/verify');
  },

  refreshToken: async () => {
    return apiRequest('/auth/refresh', {
      method: 'POST',
    });
  },
};

// API Users
export const userAPI = {
  getProfile: async (userId) => {
    return apiRequest(`/users/${userId}`);
  },

  updateProfile: async (userId, updates) => {
    return apiRequest(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  getOnlineUsers: async () => {
    return apiRequest('/users/online');
  },
};

// API Messages
export const messageAPI = {
  getMessages: async (roomId, limit = 50, offset = 0) => {
    return apiRequest(`/messages/${roomId}?limit=${limit}&offset=${offset}`);
  },

  sendMessage: async (messageData) => {
    return apiRequest('/messages', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  },

  deleteMessage: async (messageId) => {
    return apiRequest(`/messages/${messageId}`, {
      method: 'DELETE',
    });
  },
};

// API Rooms
export const roomAPI = {
  getRooms: async () => {
    return apiRequest('/rooms');
  },

  createRoom: async (roomData) => {
    return apiRequest('/rooms', {
      method: 'POST',
      body: JSON.stringify(roomData),
    });
  },

  joinRoom: async (roomId) => {
    return apiRequest(`/rooms/${roomId}/join`, {
      method: 'POST',
    });
  },

  leaveRoom: async (roomId) => {
    return apiRequest(`/rooms/${roomId}/leave`, {
      method: 'POST',
    });
  },
};

// API WebRTC Signaling
export const signalingAPI = {
  sendOffer: async (roomId, offer) => {
    return apiRequest(`/signaling/${roomId}/offer`, {
      method: 'POST',
      body: JSON.stringify({ offer }),
    });
  },

  sendAnswer: async (roomId, answer) => {
    return apiRequest(`/signaling/${roomId}/answer`, {
      method: 'POST',
      body: JSON.stringify({ answer }),
    });
  },

  sendIceCandidate: async (roomId, candidate) => {
    return apiRequest(`/signaling/${roomId}/ice-candidate`, {
      method: 'POST',
      body: JSON.stringify({ candidate }),
    });
  },
};

export default {
  auth: authAPI,
  user: userAPI,
  message: messageAPI,
  room: roomAPI,
  signaling: signalingAPI,
};
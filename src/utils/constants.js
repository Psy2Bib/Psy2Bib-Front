// Configuration de l'application
export const APP_CONFIG = {
  name: 'PSY2BIB',
  version: '1.0.0',
  description: 'Chat Vidéo Sécurisé avec Chiffrement de Bout en Bout',
};

// URLs de l'API
export const API_ENDPOINTS = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  WS_URL: process.env.REACT_APP_WS_URL || 'ws://localhost:5000',
  AUTH: '/api/auth',
  USERS: '/api/users',
  MESSAGES: '/api/messages',
  ROOMS: '/api/rooms',
  SIGNALING: '/api/signaling',
};

// États de connexion WebRTC
export const CONNECTION_STATES = {
  NEW: 'new',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  FAILED: 'failed',
  CLOSED: 'closed',
};

// Types de messages
export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  FILE: 'file',
  SYSTEM: 'system',
  ENCRYPTED: 'encrypted',
};

// Événements WebSocket
export const WS_EVENTS = {
  // Connexion
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',
  
  // Authentification
  AUTH: 'auth',
  AUTH_SUCCESS: 'auth:success',
  AUTH_ERROR: 'auth:error',
  
  // Messages
  MESSAGE: 'message',
  MESSAGE_SENT: 'message:sent',
  MESSAGE_RECEIVED: 'message:received',
  MESSAGE_ERROR: 'message:error',
  
  // Utilisateurs
  USER_JOINED: 'user:joined',
  USER_LEFT: 'user:left',
  USER_TYPING: 'user:typing',
  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline',
  
  // Rooms
  ROOM_CREATED: 'room:created',
  ROOM_JOINED: 'room:joined',
  ROOM_LEFT: 'room:left',
  ROOM_UPDATED: 'room:updated',
  
  // WebRTC Signaling
  OFFER: 'webrtc:offer',
  ANSWER: 'webrtc:answer',
  ICE_CANDIDATE: 'webrtc:ice-candidate',
  CALL_REQUEST: 'call:request',
  CALL_ACCEPT: 'call:accept',
  CALL_REJECT: 'call:reject',
  CALL_END: 'call:end',
};

// Erreurs communes
export const ERROR_MESSAGES = {
  // Auth
  INVALID_CREDENTIALS: 'Identifiants invalides',
  USER_NOT_FOUND: 'Utilisateur introuvable',
  EMAIL_EXISTS: 'Cet email est déjà utilisé',
  USERNAME_EXISTS: 'Ce nom d\'utilisateur est déjà pris',
  WEAK_PASSWORD: 'Le mot de passe est trop faible',
  
  // Media
  MEDIA_PERMISSION_DENIED: 'Permission d\'accès média refusée',
  MEDIA_NOT_FOUND: 'Aucun périphérique trouvé',
  MEDIA_IN_USE: 'Le périphérique est déjà utilisé',
  
  // Connection
  CONNECTION_FAILED: 'Échec de connexion',
  CONNECTION_TIMEOUT: 'Délai de connexion dépassé',
  PEER_DISCONNECTED: 'Le pair s\'est déconnecté',
  
  // Messages
  MESSAGE_SEND_FAILED: 'Échec d\'envoi du message',
  MESSAGE_TOO_LONG: 'Message trop long',
  
  // Crypto
  ENCRYPTION_FAILED: 'Échec du chiffrement',
  DECRYPTION_FAILED: 'Échec du déchiffrement',
  KEY_GENERATION_FAILED: 'Échec de génération des clés',
  
  // Generic
  UNKNOWN_ERROR: 'Une erreur inconnue s\'est produite',
  NETWORK_ERROR: 'Erreur réseau',
};

// Limites
export const LIMITS = {
  MESSAGE_MAX_LENGTH: 5000,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 20,
  PASSWORD_MIN_LENGTH: 6,
  FILE_MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ROOM_MAX_PARTICIPANTS: 10,
};

// Configuration média par défaut
export const MEDIA_CONSTRAINTS = {
  VIDEO: {
    QUALITY_LOW: {
      width: { ideal: 640 },
      height: { ideal: 480 },
      frameRate: { ideal: 15 }
    },
    QUALITY_MEDIUM: {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      frameRate: { ideal: 30 }
    },
    QUALITY_HIGH: {
      width: { ideal: 1920 },
      height: { ideal: 1080 },
      frameRate: { ideal: 30 }
    },
  },
  AUDIO: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: 48000,
  },
};

// Durées (en millisecondes)
export const DURATIONS = {
  TYPING_INDICATOR_TIMEOUT: 3000,
  RECONNECT_INTERVAL: 5000,
  HEARTBEAT_INTERVAL: 30000,
  MESSAGE_RETRY_DELAY: 2000,
  CONNECTION_TIMEOUT: 30000,
};

// Couleurs du thème
export const THEME_COLORS = {
  PRIMARY: '#3B82F6',
  SECONDARY: '#8B5CF6',
  SUCCESS: '#10B981',
  ERROR: '#EF4444',
  WARNING: '#F59E0B',
  INFO: '#06B6D4',
  
  BG_PRIMARY: '#111827',
  BG_SECONDARY: '#1F2937',
  BG_TERTIARY: '#374151',
  
  TEXT_PRIMARY: '#F9FAFB',
  TEXT_SECONDARY: '#D1D5DB',
  TEXT_TERTIARY: '#9CA3AF',
};

// Expressions régulières
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  USERNAME: /^[a-zA-Z0-9_-]{3,20}$/,
  URL: /^https?:\/\/.+/,
};

// Statuts utilisateur
export const USER_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  AWAY: 'away',
  BUSY: 'busy',
};

// Rôles utilisateur
export const USER_ROLES = {
  USER: 'user',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
};

// Clés localStorage
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
  SETTINGS: 'settings',
  PRIVATE_KEY: 'privateKey', // NE JAMAIS utiliser en production
};

export default {
  APP_CONFIG,
  API_ENDPOINTS,
  CONNECTION_STATES,
  MESSAGE_TYPES,
  WS_EVENTS,
  ERROR_MESSAGES,
  LIMITS,
  MEDIA_CONSTRAINTS,
  DURATIONS,
  THEME_COLORS,
  REGEX,
  USER_STATUS,
  USER_ROLES,
  STORAGE_KEYS,
};
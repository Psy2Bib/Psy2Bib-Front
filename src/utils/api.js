/**
 * Service API - Gestion de toutes les requêtes HTTP vers le backend
 * 
 * Ce service centralise toutes les communications avec l'API NestJS.
 * Il gère automatiquement l'ajout des tokens JWT et le refresh automatique.
 */

import axios from 'axios';
import { getRedirectUrl } from './auth';

// URL de base de l'API (à adapter selon l'environnement)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5500';

// Création de l'instance axios avec configuration de base
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 secondes de timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Formater un message d'erreur lisible
 * @param {Error} error - Erreur axios
 * @returns {string} Message d'erreur formaté
 */
const formatErrorMessage = (error) => {
  if (error.response) {
    // Erreur avec réponse du serveur
    const status = error.response.status;
    const message = error.response.data?.message || error.response.data?.error || 'Erreur inconnue';

    switch (status) {
      case 400:
        return `Données invalides : ${message}`;
      case 401:
        return 'Session expirée. Veuillez vous reconnecter.';
      case 403:
        return 'Accès refusé. Vous n\'avez pas les permissions nécessaires.';
      case 404:
        return 'Ressource non trouvée.';
      case 409:
        return `Conflit : ${message}`;
      case 422:
        return `Erreur de validation : ${message}`;
      case 500:
        return 'Erreur serveur. Veuillez réessayer plus tard.';
      case 503:
        return 'Service temporairement indisponible.';
      default:
        return `Erreur ${status} : ${message}`;
    }
  } else if (error.request) {
    // Requête envoyée mais pas de réponse
    if (error.code === 'ECONNABORTED') {
      return 'La requête a pris trop de temps. Vérifiez votre connexion.';
    }
    return 'Impossible de contacter le serveur. Vérifiez votre connexion internet.';
  } else {
    // Erreur lors de la configuration de la requête
    return error.message || 'Une erreur inattendue s\'est produite.';
  }
};

/**
 * Intercepteur pour ajouter le token JWT à chaque requête
 */
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Intercepteur pour gérer le refresh automatique des tokens
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si erreur 401 et qu'on n'a pas déjà tenté un refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          // Pas de refresh token, rediriger vers login
          localStorage.clear();
          const role = localStorage.getItem('userRole') || 'PATIENT';
          window.location.href = getRedirectUrl(role).replace('/dashboard', '/login');
          return Promise.reject(new Error('Session expirée'));
        }

        // Tenter de rafraîchir le token
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
            timeout: 10000,
          }
        );

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

        if (!newAccessToken) {
          throw new Error('Token de rafraîchissement invalide');
        }

        // Sauvegarder les nouveaux tokens
        localStorage.setItem('accessToken', newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }

        // Réessayer la requête originale avec le nouveau token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Le refresh a échoué, déconnecter l'utilisateur
        localStorage.clear();
        const role = localStorage.getItem('userRole') || 'PATIENT';
        window.location.href = getRedirectUrl(role).replace('/dashboard', '/login');
        return Promise.reject(new Error('Session expirée. Veuillez vous reconnecter.'));
      }
    }

    // Formater l'erreur avec un message plus lisible
    const formattedError = new Error(formatErrorMessage(error));
    formattedError.response = error.response;
    formattedError.request = error.request;
    formattedError.config = error.config;
    
    return Promise.reject(formattedError);
  }
);

// ==================== AUTHENTIFICATION ====================

/**
 * Inscription d'un nouvel utilisateur
 * @param {Object} data - Données d'inscription
 * @returns {Promise} Réponse avec tokens et données utilisateur
 */
export const register = async (data) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

/**
 * Connexion d'un utilisateur
 * @param {Object} data - Email et passwordHash
 * @returns {Promise} Réponse avec tokens et données utilisateur
 */
export const login = async (data) => {
  const response = await api.post('/auth/login', data);
  return response.data;
};

/**
 * Rafraîchir les tokens JWT
 * @returns {Promise} Nouveaux tokens
 */
export const refreshTokens = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }
  const response = await axios.post(
    `${API_BASE_URL}/auth/refresh`,
    {},
    {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
      timeout: 10000,
    }
  );
  return response.data;
};

/**
 * Déconnexion
 * @returns {Promise}
 */
export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    // On continue quand même le nettoyage local
  } finally {
    localStorage.clear();
  }
};

// ==================== PATIENTS ====================

/**
 * Récupérer le profil chiffré du patient connecté
 * @returns {Promise} Blobs chiffrés (encryptedMasterKey, salt, encryptedProfile)
 */
export const getPatientProfile = async () => {
  const response = await api.get('/patients/me');
  return response.data;
};

/**
 * Mettre à jour le profil chiffré du patient
 * @param {Object} data - Nouveaux blobs chiffrés
 * @returns {Promise} Profil mis à jour
 */
export const updatePatientProfile = async (data) => {
  const response = await api.patch('/patients/me', data);
  return response.data;
};

// ==================== PSYCHOLOGUES ====================

/**
 * Rechercher des psychologues
 * @param {Object} params - Paramètres de recherche (name, specialty, language)
 * @returns {Promise} Liste des psychologues
 */
export const searchPsychologists = async (params = {}) => {
  const response = await api.get('/psychologists', { params });
  return response.data;
};

/**
 * Récupérer le profil d'un psychologue par son ID
 * ⚠️ NOTE : Cet endpoint n'existe pas encore dans le backend
 * Pour l'instant, utilisez searchPsychologists() avec un filtre
 * @param {string} psyId - ID du psychologue
 * @returns {Promise} Profil du psychologue
 * @deprecated Utilisez searchPsychologists() à la place
 */
export const getPsychologistProfile = async (psyId) => {
  if (!psyId) {
    throw new Error('ID du psychologue requis');
  }
  
  // TODO: Implémenter GET /psychologists/:id dans le backend
  // Pour l'instant, on utilise la recherche
  try {
    const results = await searchPsychologists({});
    const profile = results.find(p => {
      const id = p.id || p.userId || p.user?.id;
      return id === psyId;
    });
    
    if (!profile) {
      throw new Error('Psychologue non trouvé');
    }
    
    return profile;
  } catch (error) {
    throw new Error(`Impossible de récupérer le profil : ${error.message}`);
  }
};

/**
 * Récupérer mon profil psychologue (pour un psy connecté)
 * @returns {Promise} Profil du psychologue connecté
 */
export const getMyPsychologistProfile = async () => {
  const response = await api.get('/psychologists/me');
  return response.data;
};

/**
 * Mettre à jour mon profil psychologue
 * @param {Object} data - Nouvelles données du profil
 * @returns {Promise} Profil mis à jour
 */
export const updateMyPsychologistProfile = async (data) => {
  const response = await api.put('/psychologists/me', data);
  return response.data;
};

// ==================== RENDEZ-VOUS ====================

/**
 * Créer des disponibilités (PSY uniquement)
 * @param {Object} data - date, startTime, endTime
 * @returns {Promise} Créneaux créés
 */
export const createAvailabilities = async (data) => {
  if (!data.date || !data.startTime || !data.endTime) {
    throw new Error('Date, heure de début et heure de fin requises');
  }
  const response = await api.post('/psy/availabilities', data);
  return response.data;
};

/**
 * Supprimer une disponibilité (PSY uniquement)
 * @param {string} availabilityId - ID du créneau
 * @returns {Promise}
 */
export const deleteAvailability = async (availabilityId) => {
  if (!availabilityId) {
    throw new Error('ID de disponibilité requis');
  }
  const response = await api.delete(`/psy/availabilities/${availabilityId}`);
  return response.data;
};

/**
 * Récupérer les disponibilités d'un psychologue
 * @param {string} psyId - ID du psychologue
 * @returns {Promise} Liste des créneaux
 */
export const getPsyAvailabilities = async (psyId) => {
  if (!psyId) {
    throw new Error('ID du psychologue requis');
  }
  const response = await api.get(`/psy/${psyId}/availabilities`);
  return response.data;
};

/**
 * Rechercher des créneaux disponibles
 * @param {Object} params - Paramètres de recherche (psyId, dateFrom, dateTo, onlyAvailable)
 * @returns {Promise} Liste des créneaux
 */
export const searchAvailabilities = async (params = {}) => {
  const response = await api.get('/search/availabilities', { params });
  return response.data;
};

/**
 * Réserver un rendez-vous (PATIENT uniquement)
 * @param {Object} data - availabilityId, type
 * @returns {Promise} Rendez-vous créé
 */
export const bookAppointment = async (data) => {
  if (!data.availabilityId || !data.type) {
    throw new Error('ID de disponibilité et type de rendez-vous requis');
  }
  if (!['ONLINE', 'IN_PERSON'].includes(data.type)) {
    throw new Error('Type de rendez-vous invalide (ONLINE ou IN_PERSON)');
  }
  const response = await api.post('/appointments/book', data);
  return response.data;
};

/**
 * Récupérer mes rendez-vous (PATIENT)
 * @returns {Promise} Liste des rendez-vous
 */
export const getMyAppointments = async () => {
  const response = await api.get('/appointments/my');
  return response.data;
};

/**
 * Récupérer mes rendez-vous (PSY)
 * @returns {Promise} Liste des rendez-vous
 */
export const getPsyAppointments = async () => {
  const response = await api.get('/psy/appointments');
  return response.data;
};

/**
 * Annuler un rendez-vous
 * @param {string} appointmentId - ID du rendez-vous
 * @returns {Promise} Rendez-vous annulé
 */
export const cancelAppointment = async (appointmentId) => {
  if (!appointmentId) {
    throw new Error('ID du rendez-vous requis');
  }
  const response = await api.patch(`/appointments/${appointmentId}/cancel`);
  return response.data;
};

/**
 * Confirmer un rendez-vous (PSY ou ADMIN)
 * @param {string} appointmentId - ID du rendez-vous
 * @returns {Promise} Rendez-vous confirmé
 */
export const confirmAppointment = async (appointmentId) => {
  if (!appointmentId) {
    throw new Error('ID du rendez-vous requis');
  }
  const response = await api.patch(`/appointments/${appointmentId}/confirm`);
  return response.data;
};

// ==================== MESSAGERIE ====================

/**
 * Envoyer un message chiffré
 * @param {Object} data - recipientId, encryptedContent, iv, attachmentPath (optionnel)
 * @returns {Promise} Message envoyé
 */
export const sendMessage = async (data) => {
  if (!data.recipientId || !data.encryptedContent || !data.iv) {
    throw new Error('recipientId, encryptedContent et iv requis');
  }
  const response = await api.post('/chat/send', data);
  return response.data;
};

/**
 * Récupérer une conversation
 * @param {string} userId - ID de l'interlocuteur
 * @returns {Promise} Liste des messages
 */
export const getConversation = async (userId) => {
  if (!userId) {
    throw new Error('ID de l\'utilisateur requis');
  }
  const response = await api.get(`/chat/conversation/${userId}`);
  return response.data;
};

/**
 * Lister les conversations (threads)
 * @returns {Promise} Liste des conversations avec dernier message et unread count
 */
export const listThreads = async () => {
  const response = await api.get('/chat/threads');
  return response.data;
};

/**
 * Marquer une conversation comme lue
 * @param {string} userId - ID de l'interlocuteur
 * @returns {Promise}
 */
export const markConversationAsRead = async (userId) => {
  if (!userId) {
    throw new Error('ID de l\'utilisateur requis');
  }
  const response = await api.patch(`/chat/conversation/${userId}/read`);
  return response.data;
};

/**
 * Compter les messages non lus
 * @returns {Promise} Nombre de messages non lus
 */
export const getUnreadCount = async () => {
  const response = await api.get('/chat/unread/count');
  return response.data;
};

/**
 * Uploader une pièce jointe chiffrée
 * @param {File} file - Fichier déjà chiffré
 * @returns {Promise} Chemin du fichier uploadé
 */
export const uploadAttachment = async (file) => {
  if (!file || !(file instanceof File)) {
    throw new Error('Fichier invalide');
  }
  
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/chat/attachment', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 60000, // 60 secondes pour les uploads
  });
  return response.data;
};

/**
 * Télécharger une pièce jointe chiffrée
 * @param {string} filename - Nom du fichier
 * @returns {Promise} Blob du fichier
 */
export const downloadAttachment = async (filename) => {
  if (!filename) {
    throw new Error('Nom de fichier requis');
  }
  const response = await api.get(`/chat/attachment/${filename}`, {
    responseType: 'blob',
    timeout: 60000, // 60 secondes pour les téléchargements
  });
  return response.data;
};

export default api;

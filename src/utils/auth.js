/**
 * Service d'authentification - Gestion des tokens JWT et de l'état utilisateur
 * 
 * Ce service gère :
 * - Le stockage des tokens JWT
 * - La vérification de l'authentification
 * - Le refresh automatique des tokens
 * - La gestion de l'utilisateur connecté
 * - La validation de l'expiration des tokens
 */

import { login as apiLogin, register as apiRegister, logout as apiLogout, refreshTokens } from './api';
import { deriveKey, decryptData, base64ToArrayBuffer, storeEncryptionKey, clearEncryptionKey } from './crypto';

/**
 * Décoder un JWT sans vérification (pour lire le payload)
 * @param {string} token - Token JWT
 * @returns {Object|null} Payload décodé ou null si invalide
 */
const decodeJWT = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded;
  } catch (error) {
    console.error('Erreur lors du décodage du JWT:', error);
    return null;
  }
};

/**
 * Vérifier si un token JWT est expiré
 * @param {string} token - Token JWT
 * @returns {boolean} true si expiré ou invalide, false sinon
 */
const isTokenExpired = (token) => {
  if (!token) return true;
  
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return true;
  
  // exp est en secondes, Date.now() est en millisecondes
  const expirationTime = decoded.exp * 1000;
  const now = Date.now();
  
  // Considérer comme expiré si moins de 30 secondes restantes
  return now >= (expirationTime - 30000);
};

/**
 * Stocker les tokens JWT
 * @param {string} accessToken - Token d'accès
 * @param {string} refreshToken - Token de rafraîchissement
 */
export const storeTokens = (accessToken, refreshToken) => {
  if (!accessToken || !refreshToken) {
    console.warn('Tentative de stockage de tokens invalides');
    return;
  }
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

/**
 * Récupérer le token d'accès
 * @returns {string|null}
 */
export const getAccessToken = () => {
  return localStorage.getItem('accessToken');
};

/**
 * Récupérer le token de rafraîchissement
 * @returns {string|null}
 */
export const getRefreshToken = () => {
  return localStorage.getItem('refreshToken');
};

/**
 * Vérifier si l'utilisateur est authentifié
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  const token = getAccessToken();
  if (!token) return false;
  
  // Vérifier que le token n'est pas expiré
  return !isTokenExpired(token);
};

/**
 * Obtenir le rôle de l'utilisateur depuis le token
 * @returns {string|null} Role de l'utilisateur ou null
 */
export const getUserRole = () => {
  const token = getAccessToken();
  if (!token) return null;
  
  const decoded = decodeJWT(token);
  return decoded?.role || null;
};

/**
 * Obtenir l'ID de l'utilisateur depuis le token
 * @returns {string|null} ID de l'utilisateur ou null
 */
export const getUserId = () => {
  const token = getAccessToken();
  if (!token) return null;
  
  const decoded = decodeJWT(token);
  return decoded?.sub || null;
};

/**
 * Stocker les informations de l'utilisateur
 * @param {Object} userData - Données utilisateur
 */
export const storeUser = (userData) => {
  if (!userData) return;
  try {
    localStorage.setItem('user', JSON.stringify(userData));
  } catch (error) {
    console.error('Erreur lors du stockage des données utilisateur:', error);
  }
};

/**
 * Récupérer les informations de l'utilisateur
 * @returns {Object|null}
 */
export const getUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Erreur lors de la récupération des données utilisateur:', error);
    return null;
  }
};

/**
 * Stocker les blobs chiffrés du patient
 * @param {Object} blobs - encryptedMasterKey, salt, encryptedProfile
 */
export const storePatientBlobs = (blobs) => {
  if (!blobs) return;
  try {
    localStorage.setItem('patientBlobs', JSON.stringify(blobs));
  } catch (error) {
    console.error('Erreur lors du stockage des blobs patient:', error);
  }
};

/**
 * Récupérer les blobs chiffrés du patient
 * @returns {Object|null}
 */
export const getPatientBlobs = () => {
  try {
    const blobsStr = localStorage.getItem('patientBlobs');
    return blobsStr ? JSON.parse(blobsStr) : null;
  } catch (error) {
    console.error('Erreur lors de la récupération des blobs patient:', error);
    return null;
  }
};

/**
 * Connexion avec gestion du chiffrement Zero-Knowledge
 * @param {string} email - Email de l'utilisateur
 * @param {string} password - Mot de passe en clair
 * @returns {Promise<Object>} Données utilisateur et profil déchiffré (si patient)
 * @throws {Error} Si la connexion échoue
 */
export const login = async (email, password) => {
  if (!email || !password) {
    throw new Error('Email et mot de passe requis');
  }

  // Validation email basique
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Format d\'email invalide');
  }

  try {
    // 1. Hash du mot de passe pour l'authentification (SHA-256)
    const { hashPassword } = await import('./crypto');
    const passwordHash = await hashPassword(password);

    // 2. Appel API de connexion
    const response = await apiLogin({ email, passwordHash });

    if (!response.accessToken || !response.refreshToken) {
      throw new Error('Réponse invalide du serveur : tokens manquants');
    }

    // 3. Stocker les tokens
    storeTokens(response.accessToken, response.refreshToken);

    // 4. Stocker les infos utilisateur
    const userData = {
      id: response.userId || getUserId(),
      email,
      role: response.role,
      pseudo: response.pseudo,
    };
    storeUser(userData);

    // 5. Si c'est un patient, gérer le déchiffrement
    if (response.role === 'PATIENT' && response.salt && response.encryptedProfile) {
      // Stocker les blobs
      storePatientBlobs({
        encryptedMasterKey: response.encryptedMasterKey,
        salt: response.salt,
        encryptedProfile: response.encryptedProfile,
      });

      try {
        // Dériver la clé de chiffrement
        const salt = base64ToArrayBuffer(response.salt);
        const encryptionKey = await deriveKey(password, salt);

        // Déchiffrer le profil
        const decryptedProfile = await decryptData(response.encryptedProfile, encryptionKey);

        // Stocker la clé de chiffrement en mémoire
        storeEncryptionKey(encryptionKey);

        // Ajouter le profil déchiffré aux données utilisateur
        userData.profile = decryptedProfile;
        storeUser(userData);

        return {
          ...userData,
          profile: decryptedProfile,
        };
      } catch (decryptError) {
        console.error('Erreur lors du déchiffrement du profil:', decryptError);
        // Même si le déchiffrement échoue, on peut quand même se connecter
        // L'utilisateur devra peut-être réinitialiser son profil
        // Mais on retourne quand même les données utilisateur
      }
    }

    return userData;
  } catch (error) {
    // Ré-émettre l'erreur avec un message plus clair
    if (error.response?.status === 401) {
      throw new Error('Email ou mot de passe incorrect');
    } else if (error.response?.status === 404) {
      throw new Error('Compte non trouvé. Veuillez vous inscrire.');
    } else if (error.message) {
      throw error;
    } else {
      throw new Error('Erreur lors de la connexion. Veuillez réessayer.');
    }
  }
};

/**
 * Inscription avec gestion du chiffrement Zero-Knowledge
 * @param {Object} data - Données d'inscription
 * @param {string} password - Mot de passe en clair
 * @returns {Promise<Object>} Données utilisateur et profil déchiffré (si patient)
 * @throws {Error} Si l'inscription échoue
 */
export const register = async (data, password) => {
  // Validations
  if (!data.email || !password) {
    throw new Error('Email et mot de passe requis');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    throw new Error('Format d\'email invalide');
  }

  if (password.length < 8) {
    throw new Error('Le mot de passe doit contenir au moins 8 caractères');
  }

  try {
    // 1. Hash du mot de passe pour l'authentification (SHA-256)
    const { hashPassword } = await import('./crypto');
    const passwordHash = await hashPassword(password);

    // 2. Préparer les données d'inscription
    const registerData = {
      email: data.email.trim().toLowerCase(),
      passwordHash,
      pseudo: (data.pseudo || data.email.split('@')[0]).trim(),
      role: data.role || 'PATIENT',
    };

    // 3. Si c'est un patient, chiffrer le profil
    if (registerData.role === 'PATIENT') {
      const { generateSalt, deriveKey, encryptData, arrayBufferToBase64 } = await import('./crypto');

      // Générer le salt
      const salt = generateSalt();
      const saltBase64 = arrayBufferToBase64(salt);

      // Dériver la clé de chiffrement
      const encryptionKey = await deriveKey(password, salt);

      // Créer le profil
      const profile = {
        firstName: (data.firstName || '').trim(),
        lastName: (data.lastName || '').trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone ? data.phone.trim() : null,
        birthDate: data.birthDate || null,
        registeredAt: new Date().toISOString(),
        encryptionMethod: 'Argon2id + AES-256-GCM',
      };

      // Chiffrer le profil
      const encryptedProfile = await encryptData(profile, encryptionKey);

      // Pour l'instant, on utilise la même clé comme masterKey
      // En production, on devrait générer une clé maîtresse séparée
      const encryptedMasterKey = encryptedProfile; // Simplification pour l'instant

      registerData.encryptedMasterKey = encryptedMasterKey;
      registerData.salt = saltBase64;
      registerData.encryptedProfile = encryptedProfile;
    }

    // 4. Appel API d'inscription
    const response = await apiRegister(registerData);

    if (!response.accessToken || !response.refreshToken) {
      throw new Error('Réponse invalide du serveur : tokens manquants');
    }

    // 5. Stocker les tokens
    storeTokens(response.accessToken, response.refreshToken);

    // 6. Stocker les infos utilisateur
    const userData = {
      id: response.userId || getUserId(),
      email: data.email.trim().toLowerCase(),
      role: response.role,
      pseudo: response.pseudo,
    };

    // 7. Si c'est un patient, déchiffrer le profil
    if (response.role === 'PATIENT' && response.salt && response.encryptedProfile) {
      storePatientBlobs({
        encryptedMasterKey: response.encryptedMasterKey,
        salt: response.salt,
        encryptedProfile: response.encryptedProfile,
      });

      try {
        const salt = base64ToArrayBuffer(response.salt);
        const encryptionKey = await deriveKey(password, salt);
        const decryptedProfile = await decryptData(response.encryptedProfile, encryptionKey);
        storeEncryptionKey(encryptionKey);
        userData.profile = decryptedProfile;
      } catch (decryptError) {
        console.error('Erreur lors du déchiffrement du profil:', decryptError);
        // On continue quand même
      }
    }

    storeUser(userData);
    return userData;
  } catch (error) {
    // Ré-émettre l'erreur avec un message plus clair
    if (error.response?.status === 409) {
      throw new Error('Cet email est déjà utilisé');
    } else if (error.response?.status === 400) {
      const message = error.response.data?.message || 'Données invalides';
      throw new Error(`Erreur de validation : ${message}`);
    } else if (error.message) {
      throw error;
    } else {
      throw new Error('Erreur lors de l\'inscription. Veuillez réessayer.');
    }
  }
};

/**
 * Déconnexion
 */
export const logout = async () => {
  try {
    await apiLogout();
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    // On continue quand même le nettoyage local
  } finally {
    // Nettoyer toutes les données locales
    localStorage.clear();
    clearEncryptionKey();
  }
};

/**
 * Rafraîchir les tokens
 * @returns {Promise<Object>} Nouveaux tokens
 * @throws {Error} Si le refresh échoue
 */
export const refresh = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('Aucun token de rafraîchissement disponible');
  }

  // Vérifier que le refresh token n'est pas expiré
  if (isTokenExpired(refreshToken)) {
    throw new Error('Token de rafraîchissement expiré');
  }

  try {
    const response = await refreshTokens();
    
    if (!response.accessToken || !response.refreshToken) {
      throw new Error('Réponse invalide du serveur : tokens manquants');
    }

    storeTokens(response.accessToken, response.refreshToken);
    return response;
  } catch (error) {
    // Si le refresh échoue, nettoyer et re-lancer l'erreur
    localStorage.clear();
    clearEncryptionKey();
    throw error;
  }
};

/**
 * Vérifier et rafraîchir le token si nécessaire
 * @returns {Promise<boolean>} true si authentifié, false sinon
 */
export const ensureAuthenticated = async () => {
  const token = getAccessToken();
  if (!token) {
    return false;
  }

  // Si le token est expiré ou va bientôt expirer, le rafraîchir
  if (isTokenExpired(token)) {
    try {
      await refresh();
      return true;
    } catch (error) {
      // Le refresh a échoué, déconnecter
      await logout();
      return false;
    }
  }

  return true;
};

/**
 * Obtenir l'URL de redirection selon le rôle
 * @param {string} role - Rôle de l'utilisateur
 * @returns {string} URL de redirection
 */
export const getRedirectUrl = (role) => {
  switch (role) {
    case 'PATIENT':
      return '/patient/dashboard';
    case 'PSY':
      return '/psy/dashboard';
    case 'ADMIN':
      return '/admin/dashboard';
    default:
      return '/';
  }
};

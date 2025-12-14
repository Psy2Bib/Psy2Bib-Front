/**
 * Service d'authentification - Gestion des tokens JWT et de l'état utilisateur
 * 
 * Ce service gère :
 * - Le stockage des tokens JWT
 * - La vérification de l'authentification
 * - Le refresh automatique des tokens
 * - La gestion de l'utilisateur connecté
 */

import { login as apiLogin, register as apiRegister, logout as apiLogout, refreshTokens } from './api';
import { deriveKey, decryptData, base64ToArrayBuffer, storeEncryptionKey, clearEncryptionKey } from './crypto';

/**
 * Stocker les tokens JWT
 * @param {string} accessToken - Token d'accès
 * @param {string} refreshToken - Token de rafraîchissement
 */
export const storeTokens = (accessToken, refreshToken) => {
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
  return !!getAccessToken();
};

/**
 * Stocker les informations de l'utilisateur
 * @param {Object} userData - Données utilisateur
 */
export const storeUser = (userData) => {
  localStorage.setItem('user', JSON.stringify(userData));
};

/**
 * Récupérer les informations de l'utilisateur
 * @returns {Object|null}
 */
export const getUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * Stocker les blobs chiffrés du patient
 * @param {Object} blobs - encryptedMasterKey, salt, encryptedProfile
 */
export const storePatientBlobs = (blobs) => {
  localStorage.setItem('patientBlobs', JSON.stringify(blobs));
};

/**
 * Récupérer les blobs chiffrés du patient
 * @returns {Object|null}
 */
export const getPatientBlobs = () => {
  const blobsStr = localStorage.getItem('patientBlobs');
  return blobsStr ? JSON.parse(blobsStr) : null;
};

/**
 * Connexion avec gestion du chiffrement Zero-Knowledge
 * @param {string} email - Email de l'utilisateur
 * @param {string} password - Mot de passe en clair
 * @returns {Promise<Object>} Données utilisateur et profil déchiffré (si patient)
 */
export const login = async (email, password) => {
  // 1. Hash du mot de passe pour l'authentification (SHA-256)
  const { hashPassword } = await import('./crypto');
  const passwordHash = await hashPassword(password);

  // 2. Appel API de connexion
  const response = await apiLogin({ email, passwordHash });

  // 3. Stocker les tokens
  storeTokens(response.accessToken, response.refreshToken);

  // 4. Stocker les infos utilisateur
  const userData = {
    id: response.userId,
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
    } catch (error) {
      console.error('Erreur lors du déchiffrement du profil:', error);
      // Même si le déchiffrement échoue, on peut quand même se connecter
      // L'utilisateur devra peut-être réinitialiser son profil
    }
  }

  return userData;
};

/**
 * Inscription avec gestion du chiffrement Zero-Knowledge
 * @param {Object} data - Données d'inscription
 * @param {string} password - Mot de passe en clair
 * @returns {Promise<Object>} Données utilisateur et profil déchiffré (si patient)
 */
export const register = async (data, password) => {
  // 1. Hash du mot de passe pour l'authentification (SHA-256)
  const { hashPassword } = await import('./crypto');
  const passwordHash = await hashPassword(password);

  // 2. Préparer les données d'inscription
  const registerData = {
    email: data.email,
    passwordHash,
    pseudo: data.pseudo || data.email.split('@')[0],
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
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      email: data.email,
      phone: data.phone || null,
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

  // 5. Stocker les tokens
  storeTokens(response.accessToken, response.refreshToken);

  // 6. Stocker les infos utilisateur
  const userData = {
    id: response.userId,
    email: data.email,
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
    } catch (error) {
      console.error('Erreur lors du déchiffrement du profil:', error);
    }
  }

  storeUser(userData);
  return userData;
};

/**
 * Déconnexion
 */
export const logout = async () => {
  try {
    await apiLogout();
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
  } finally {
    // Nettoyer toutes les données locales
    localStorage.clear();
    clearEncryptionKey();
  }
};

/**
 * Rafraîchir les tokens
 * @returns {Promise<Object>} Nouveaux tokens
 */
export const refresh = async () => {
  const response = await refreshTokens();
  storeTokens(response.accessToken, response.refreshToken);
  return response;
};

/**
 * Vérifier et rafraîchir le token si nécessaire
 * @returns {Promise<boolean>} true si authentifié, false sinon
 */
export const ensureAuthenticated = async () => {
  if (!isAuthenticated()) {
    return false;
  }

  // Vérifier si le token est expiré (simplifié)
  // En production, on pourrait décoder le JWT pour vérifier l'expiration
  try {
    await refresh();
    return true;
  } catch (error) {
    // Le refresh a échoué, déconnecter
    await logout();
    return false;
  }
};


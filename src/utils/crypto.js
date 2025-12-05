
const ARGON2_CONFIG = {
  type: 2, // Argon2id (0 = Argon2d, 1 = Argon2i, 2 = Argon2id)
  memory: 65536, // 64 MB en KB
  iterations: 3, // Time cost
  parallelism: 4, // Parallélisme
  hashLength: 32, // 256 bits pour AES-256
};

/**
 * Dériver une clé AES-256 depuis un mot de passe avec Argon2id
 * @param {string} password - Mot de passe utilisateur
 * @param {Uint8Array} salt - Salt aléatoire (16 bytes minimum)
 * @returns {Promise<CryptoKey>} - Clé AES-GCM 256 bits
 */
export async function deriveKey(password, salt) {
  // Vérifier que Argon2 est chargé
  if (typeof window.argon2 === 'undefined') {
    throw new Error('Argon2 n\'est pas chargé. Vérifiez que le script est inclus dans index.html');
  }

  // Convertir le salt en Uint8Array si nécessaire
  let saltArray;
  if (salt instanceof Uint8Array) {
    saltArray = salt;
  } else if (typeof salt === 'string') {
    saltArray = base64ToArrayBuffer(salt);
  } else {
    saltArray = new Uint8Array(salt);
  }

  try {
    // Dériver le hash avec Argon2id
    const result = await window.argon2.hash({
      pass: password,
      salt: saltArray,
      type: ARGON2_CONFIG.type,
      mem: ARGON2_CONFIG.memory,
      time: ARGON2_CONFIG.iterations,
      parallelism: ARGON2_CONFIG.parallelism,
      hashLen: ARGON2_CONFIG.hashLength,
    });

    // Convertir le hash en CryptoKey pour AES-GCM
    const keyMaterial = result.hash; // Uint8Array de 32 bytes

    const aesKey = await window.crypto.subtle.importKey(
      'raw',
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      true, // extractable
      ['encrypt', 'decrypt']
    );

    return aesKey;
  } catch (error) {
    console.error('Erreur Argon2:', error);
    throw new Error('Échec de la dérivation de clé Argon2: ' + error.message);
  }
}

/**
 * Générer un salt aléatoire (16 bytes)
 * @returns {Uint8Array}
 */
export function generateSalt() {
  return window.crypto.getRandomValues(new Uint8Array(16));
}

/**
 * Générer un IV (Initialization Vector) aléatoire (12 bytes pour AES-GCM)
 * @returns {Uint8Array}
 */
export function generateIV() {
  return window.crypto.getRandomValues(new Uint8Array(12));
}

/**
 * Chiffrer des données avec AES-GCM
 * @param {any} data - Données à chiffrer (sera JSON.stringify)
 * @param {CryptoKey} key - Clé AES-GCM
 * @returns {Promise<string>} - Données chiffrées en Base64 (IV + ciphertext)
 */
export async function encryptData(data, key) {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(JSON.stringify(data));
  const iv = generateIV();

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    dataBuffer
  );

  // Combiner IV + données chiffrées
  const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encryptedBuffer), iv.length);

  return arrayBufferToBase64(combined);
}

/**
 * Déchiffrer des données avec AES-GCM
 * @param {string} encryptedData - Données chiffrées en Base64
 * @param {CryptoKey} key - Clé AES-GCM
 * @returns {Promise<any>} - Données déchiffrées
 */
export async function decryptData(encryptedData, key) {
  try {
    const combined = base64ToArrayBuffer(encryptedData);
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      data
    );

    const decoder = new TextDecoder();
    const decryptedString = decoder.decode(decryptedBuffer);
    return JSON.parse(decryptedString);
  } catch (error) {
    console.error('Erreur déchiffrement:', error);
    throw new Error('Impossible de déchiffrer les données. Mot de passe incorrect ?');
  }
}

/**
 * Hash du mot de passe pour authentification serveur (SHA-256)
 * Note: Ce hash est différent de la clé Argon2, il sert uniquement
 * à vérifier l'identité côté serveur sans révéler le mot de passe
 * @param {string} password
 * @returns {Promise<string>} - Hash en Base64
 */
export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  return arrayBufferToBase64(hashBuffer);
}

/**
 * Convertir ArrayBuffer/Uint8Array en Base64
 * @param {ArrayBuffer|Uint8Array} buffer
 * @returns {string}
 */
export function arrayBufferToBase64(buffer) {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

/**
 * Convertir Base64 en Uint8Array
 * @param {string} base64
 * @returns {Uint8Array}
 */
export function base64ToArrayBuffer(base64) {
  const binaryString = window.atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Stocker la clé de chiffrement en mémoire uniquement
 * La clé n'est JAMAIS persistée sur disque
 * @param {CryptoKey} key
 */
export function storeEncryptionKey(key) {
  window.__E2EE_KEY__ = key;
  sessionStorage.setItem('e2ee_active', 'true');
}

/**
 * Récupérer la clé de chiffrement depuis la mémoire
 * @returns {CryptoKey|undefined}
 */
export function getEncryptionKey() {
  return window.__E2EE_KEY__;
}

/**
 * Supprimer la clé de chiffrement (déconnexion)
 */
export function clearEncryptionKey() {
  delete window.__E2EE_KEY__;
  sessionStorage.removeItem('e2ee_active');
}

/**
 * Vérifier si une clé de chiffrement est active
 * @returns {boolean}
 */
export function hasEncryptionKey() {
  return !!window.__E2EE_KEY__ && sessionStorage.getItem('e2ee_active') === 'true';
}

/**
 * Vérifier si Argon2 est disponible
 * @returns {boolean}
 */
export function isArgon2Available() {
  return typeof window.argon2 !== 'undefined';
}

/**
 * Obtenir les informations de configuration Argon2
 * @returns {object}
 */
export function getArgon2Config() {
  return {
    ...ARGON2_CONFIG,
    typeName: 'Argon2id',
    memoryMB: ARGON2_CONFIG.memory / 1024,
  };
}
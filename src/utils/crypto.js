/**
 * CRYPTO UTILS - Zero-Knowledge Encryption Psy2Bib
 * Conforme au whitepaper : PBKDF2 + AES-GCM
 * Implémente les standards de l'API Web Crypto
 */

// ---- Utilitaires Encodage ----

export function arrayBufferToBase64(uint8) {
  let binary = '';
  const chunkSize = 0x8000; // évite stack overflow
  // S'assurer que c'est un Uint8Array
  if (!(uint8 instanceof Uint8Array)) {
    uint8 = new Uint8Array(uint8);
  }
  for (let i = 0; i < uint8.length; i += chunkSize) {
    const chunk = uint8.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, chunk);
  }
  return btoa(binary);
}

export function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Alias internes pour le code existant dans ce fichier
const toBase64 = arrayBufferToBase64;
const fromBase64 = base64ToArrayBuffer;

// Rend la base64 URL-safe: remplace +/ par -_ et retire les =
export function base64UrlEncode(uint8) {
  return toBase64(uint8).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

// Reconvertit URL-safe vers base64 standard
export function base64UrlDecode(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4;
  if (pad) base64 += '='.repeat(4 - pad);
  return fromBase64(base64);
}

// ---- Génération sel / IV ----

export function generateSalt() {
  return crypto.getRandomValues(new Uint8Array(16));
}

export function generateIV() {
  return crypto.getRandomValues(new Uint8Array(12)); // recommandé pour AES-GCM
}

// ---- Dérivation de clé (PBKDF2 → AES-GCM 256) ----

export async function deriveKey(password, salt) {
  if (typeof password !== 'string' || !password) {
    throw new Error('Le mot de passe doit être une chaîne non vide.');
  }
  // Autoriser salt en string base64/urlsafe ou Uint8Array
  let saltBytes;
  if (salt instanceof Uint8Array) {
    saltBytes = salt;
  } else if (typeof salt === 'string') {
    // On accepte base64 ou base64-url
    const isUrlSafe = /[-_]/.test(salt);
    saltBytes = isUrlSafe ? base64UrlDecode(salt) : fromBase64(salt);
  } else {
    throw new Error('Le salt doit être Uint8Array ou chaîne Base64/Base64-URL.');
  }
  if (saltBytes.length < 8) {
    throw new Error('Le salt doit faire au moins 8 octets (recommandé: 16).');
  }

  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: 100000, // conforme à votre whitepaper
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true, // extractable: true (si vous devez exporter la clé), sinon mettre false
    ['encrypt', 'decrypt']
  );
}

// ---- Chiffrement / Déchiffrement ----

export async function encryptData(data, key) {
  if (!(key instanceof CryptoKey)) {
    throw new Error('La clé doit être une CryptoKey AES-GCM.');
  }
  const encoder = new TextEncoder();
  const iv = generateIV();
  const payload = typeof data === 'string' ? data : JSON.stringify(data);
  const dataBuffer = encoder.encode(payload);

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    dataBuffer
  );

  // Format: [IV || ciphertext]
  const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encryptedBuffer), iv.length);

  // Retour Base64 URL-safe
  return base64UrlEncode(combined);
}

export async function decryptData(encryptedData, key) {
  if (!(key instanceof CryptoKey)) {
    throw new Error('La clé doit être une CryptoKey AES-GCM.');
  }
  try {
    const combined = base64UrlDecode(encryptedData);
    if (combined.length < 13) {
      throw new Error('Format de données chiffrées invalide.');
    }
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );

    const decoder = new TextDecoder();
    const decryptedString = decoder.decode(decryptedBuffer);

    // On tente JSON, sinon on renvoie la chaîne
    try {
      return JSON.parse(decryptedString);
    } catch (_) {
      return decryptedString;
    }
  } catch (error) {
    console.error('Erreur déchiffrement:', error);
    throw new Error('Impossible de déchiffrer les données. Mot de passe/clé ou données invalides.');
  }
}

// ---- Hash mot de passe (SHA-256) pour auth serveur ----

export async function hashPassword(password) {
  if (typeof password !== 'string') {
    throw new Error('Le mot de passe doit être une chaîne.');
  }
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(new Uint8Array(hashBuffer));
}

// ---- Stockage clé en mémoire (pas de persistance) ----

export function storeEncryptionKey(key) {
  if (typeof window === 'undefined') return; // SSR / tests
  window.__E2EE_KEY__ = key; // uniquement en mémoire
  try {
    sessionStorage.setItem('e2ee_active', 'true');
  } catch (_) {
    // sessionStorage peut être indisponible (private mode / SSR)
  }
}

export function getEncryptionKey() {
  if (typeof window === 'undefined') return undefined;
  return window.__E2EE_KEY__;
}

export function clearEncryptionKey() {
  if (typeof window === 'undefined') return;
  delete window.__E2EE_KEY__;
  try {
    sessionStorage.removeItem('e2ee_active');
  } catch (_) {}
}

export function hasEncryptionKey() {
  if (typeof window === 'undefined') return false;
  const activeFlag = (() => {
    try {
      return sessionStorage.getItem('e2ee_active') === 'true';
    } catch (_) {
      return false;
    }
  })();
  return !!window.__E2EE_KEY__ && activeFlag;
}

// ---- Helpers haut niveau: encrypt/decrypt avec mot de passe ----

/**
 * Chiffre un objet/chaîne avec un mot de passe.
 * Retourne { salt, data } en Base64 URL-safe.
 */
export async function encryptWithPassword(payload, password) {
  const salt = generateSalt();
  const key = await deriveKey(password, salt);
  const data = await encryptData(payload, key);
  return {
    salt: base64UrlEncode(salt),
    data,
  };
}

/**
 * Déchiffre un objet/chaîne chiffré via encryptWithPassword.
 * Attend { salt, data } en Base64 URL-safe.
 */
export async function decryptWithPassword(encrypted, password) {
  if (!encrypted || typeof encrypted !== 'object') {
    throw new Error('Format des données chiffrées invalide (objet attendu).');
  }
  const { salt, data } = encrypted;
  const key = await deriveKey(password, salt);
  return decryptData(data, key);
}

// ---- Export par défaut pour compatibilité avec `import CryptoUtils from '...'` ----

const CryptoUtils = {
  generateSalt,
  generateIV,
  deriveKey,
  encryptData,
  decryptData,
  hashPassword,
  storeEncryptionKey,
  getEncryptionKey,
  clearEncryptionKey,
  hasEncryptionKey,
  encryptWithPassword,
  decryptWithPassword,
  base64UrlEncode,
  base64UrlDecode,
  arrayBufferToBase64,
  base64ToArrayBuffer,
};

export default CryptoUtils;

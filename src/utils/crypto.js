/**
 * CRYPTO UTILS - Zero-Knowledge Encryption Psy2Bib
 * Conforme au whitepaper : PBKDF2 + AES-GCM
 */

// Dériver une clé AES-256 depuis un mot de passe (PBKDF2 - 100k itérations)
export async function deriveKey(password, salt) {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );
  
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000, // 100k itérations comme spécifié dans whitepaper
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

// Générer un salt aléatoire (16 bytes)
export function generateSalt() {
  return window.crypto.getRandomValues(new Uint8Array(16));
}

// Générer un IV (Initialization Vector) aléatoire (12 bytes pour AES-GCM)
export function generateIV() {
  return window.crypto.getRandomValues(new Uint8Array(12));
}

// Chiffrer des données avec AES-GCM
export async function encryptData(data, key) {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(JSON.stringify(data));
  const iv = generateIV();
  
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv
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

// Déchiffrer des données avec AES-GCM
export async function decryptData(encryptedData, key) {
  try {
    const combined = base64ToArrayBuffer(encryptedData);
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);
    
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv
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

// Hash du mot de passe pour authentification serveur
export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  return arrayBufferToBase64(hashBuffer);
}

// Convertir ArrayBuffer en Base64
export function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Convertir Base64 en ArrayBuffer
export function base64ToArrayBuffer(base64) {
  const binaryString = window.atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Stocker la clé de chiffrement en mémoire (sessionStorage pour persistance tab)
export function storeEncryptionKey(key) {
  // Stocker en mémoire uniquement (pas de persistence)
  window.__E2EE_KEY__ = key;
  sessionStorage.setItem('e2ee_active', 'true');
}

// Récupérer la clé de chiffrement
export function getEncryptionKey() {
  return window.__E2EE_KEY__;
}

// Supprimer la clé (déconnexion)
export function clearEncryptionKey() {
  delete window.__E2EE_KEY__;
  sessionStorage.removeItem('e2ee_active');
}

// Vérifier si une clé est active
export function hasEncryptionKey() {
  return !!window.__E2EE_KEY__ && sessionStorage.getItem('e2ee_active') === 'true';
}
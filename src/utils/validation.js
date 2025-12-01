import { REGEX, LIMITS } from './constants';

/**
 * Utilitaires de validation pour les formulaires et données
 */

// Valider un email
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email requis' };
  }
  
  if (!REGEX.EMAIL.test(email)) {
    return { valid: false, error: 'Format d\'email invalide' };
  }
  
  return { valid: true };
};

// Valider un nom d'utilisateur
export const validateUsername = (username) => {
  if (!username || typeof username !== 'string') {
    return { valid: false, error: 'Nom d\'utilisateur requis' };
  }
  
  if (username.length < LIMITS.USERNAME_MIN_LENGTH) {
    return { 
      valid: false, 
      error: `Le nom doit contenir au moins ${LIMITS.USERNAME_MIN_LENGTH} caractères` 
    };
  }
  
  if (username.length > LIMITS.USERNAME_MAX_LENGTH) {
    return { 
      valid: false, 
      error: `Le nom ne peut pas dépasser ${LIMITS.USERNAME_MAX_LENGTH} caractères` 
    };
  }
  
  if (!REGEX.USERNAME.test(username)) {
    return { 
      valid: false, 
      error: 'Le nom ne peut contenir que des lettres, chiffres, tirets et underscores' 
    };
  }
  
  return { valid: true };
};

// Valider un mot de passe
export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Mot de passe requis' };
  }
  
  if (password.length < LIMITS.PASSWORD_MIN_LENGTH) {
    return { 
      valid: false, 
      error: `Le mot de passe doit contenir au moins ${LIMITS.PASSWORD_MIN_LENGTH} caractères` 
    };
  }
  
  // Vérifier la complexité (optionnel)
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  if (!hasUpperCase || !hasLowerCase || !hasNumber) {
    return { 
      valid: false, 
      error: 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre' 
    };
  }
  
  return { valid: true };
};

// Valider un message
export const validateMessage = (message) => {
  if (!message || typeof message !== 'string') {
    return { valid: false, error: 'Message vide' };
  }
  
  if (message.trim().length === 0) {
    return { valid: false, error: 'Message vide' };
  }
  
  if (message.length > LIMITS.MESSAGE_MAX_LENGTH) {
    return { 
      valid: false, 
      error: `Le message ne peut pas dépasser ${LIMITS.MESSAGE_MAX_LENGTH} caractères` 
    };
  }
  
  return { valid: true };
};

// Valider une URL
export const validateUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL requise' };
  }
  
  if (!REGEX.URL.test(url)) {
    return { valid: false, error: 'Format d\'URL invalide' };
  }
  
  try {
    new URL(url);
    return { valid: true };
  } catch (error) {
    return { valid: false, error: 'URL invalide' };
  }
};

// Valider un fichier
export const validateFile = (file) => {
  if (!file) {
    return { valid: false, error: 'Fichier requis' };
  }
  
  if (file.size > LIMITS.FILE_MAX_SIZE) {
    return { 
      valid: false, 
      error: `Le fichier ne peut pas dépasser ${LIMITS.FILE_MAX_SIZE / (1024 * 1024)}MB` 
    };
  }
  
  return { valid: true };
};

// Valider une image
export const validateImage = (file) => {
  const fileValidation = validateFile(file);
  if (!fileValidation.valid) {
    return fileValidation;
  }
  
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: 'Format d\'image non supporté. Utilisez JPG, PNG, GIF ou WebP' 
    };
  }
  
  return { valid: true };
};

// Nettoyer et valider une entrée HTML
export const sanitizeHtml = (html) => {
  if (!html || typeof html !== 'string') {
    return '';
  }
  
  // Supprimer les tags dangereux
  const dangerousTags = /<script|<iframe|<object|<embed|<link|<style/gi;
  let clean = html.replace(dangerousTags, '');
  
  // Encoder les caractères spéciaux
  clean = clean
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
  
  return clean;
};

// Valider un formulaire de connexion
export const validateLoginForm = (data) => {
  const errors = {};
  
  const usernameValidation = validateUsername(data.username);
  if (!usernameValidation.valid) {
    errors.username = usernameValidation.error;
  }
  
  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.valid) {
    errors.password = passwordValidation.error;
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

// Valider un formulaire d'inscription
export const validateRegisterForm = (data) => {
  const errors = {};
  
  const usernameValidation = validateUsername(data.username);
  if (!usernameValidation.valid) {
    errors.username = usernameValidation.error;
  }
  
  const emailValidation = validateEmail(data.email);
  if (!emailValidation.valid) {
    errors.email = emailValidation.error;
  }
  
  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.valid) {
    errors.password = passwordValidation.error;
  }
  
  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Les mots de passe ne correspondent pas';
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

// Vérifier la force d'un mot de passe
export const getPasswordStrength = (password) => {
  if (!password) return 0;
  
  let strength = 0;
  
  // Longueur
  if (password.length >= 8) strength += 20;
  if (password.length >= 12) strength += 10;
  if (password.length >= 16) strength += 10;
  
  // Majuscules
  if (/[A-Z]/.test(password)) strength += 15;
  
  // Minuscules
  if (/[a-z]/.test(password)) strength += 15;
  
  // Chiffres
  if (/\d/.test(password)) strength += 15;
  
  // Caractères spéciaux
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength += 15;
  
  return Math.min(strength, 100);
};

// Obtenir le label de force du mot de passe
export const getPasswordStrengthLabel = (strength) => {
  if (strength < 30) return { label: 'Très faible', color: 'red' };
  if (strength < 50) return { label: 'Faible', color: 'orange' };
  if (strength < 70) return { label: 'Moyen', color: 'yellow' };
  if (strength < 90) return { label: 'Fort', color: 'green' };
  return { label: 'Très fort', color: 'green' };
};

export default {
  validateEmail,
  validateUsername,
  validatePassword,
  validateMessage,
  validateUrl,
  validateFile,
  validateImage,
  sanitizeHtml,
  validateLoginForm,
  validateRegisterForm,
  getPasswordStrength,
  getPasswordStrengthLabel,
};
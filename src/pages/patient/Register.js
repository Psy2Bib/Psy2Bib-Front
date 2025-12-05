import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { encryptWithPassword, hashPassword, storeEncryptionKey, deriveKey, encryptData, generateSalt, generateIV, base64UrlEncode } from '../../utils/crypto';
import { register } from '../../utils/api';

export default function PatientRegister() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async () => {
    const { firstName, lastName, email, password, confirmPassword } = formData;

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setMessage('⚠️ Veuillez remplir tous les champs');
      return;
    }

    if (password !== confirmPassword) {
      setMessage('⚠️ Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 8) {
      setMessage('⚠️ Le mot de passe doit faire au moins 8 caractères');
      return;
    }

    setLoading(true);
    setMessage('🔐 Génération des clés de chiffrement...');

    try {
      // 1. Hasher le mot de passe pour l'authentification serveur
      const passwordHash = await hashPassword(password);

      // 2. Chiffrer le profil localement (Zero-Knowledge)
      // On génère une Master Key dérivée du mot de passe
      // Note: On fait tout manuellement ici pour avoir les champs séparés (salt, encryptedProfile)
      const salt = generateSalt();
      const masterKey = await deriveKey(password, salt);
      
      const profileData = {
        firstName,
        lastName,
        email,
        createdAt: new Date().toISOString(),
        medicalHistory: [], // Sera rempli plus tard, chiffré
        notes: ''
      };

      const encryptedProfile = await encryptData(profileData, masterKey);

      // Simulation de l'encryptedMasterKey (si on voulait utiliser une double enveloppe, 
      // mais ici on dérive directement du mot de passe à chaque fois, 
      // donc on envoie null ou une valeur bidon si le backend l'exigeait, 
      // mais notre backend attend juste salt + encryptedProfile pour le modèle simple).
      // Pour respecter le modèle strict ZK avec partage de clé, on pourrait chiffrer la clé elle-même,
      // mais restons simple : mot de passe -> clé AES -> données.

      // 3. Envoyer au backend
      const payload = {
        email,
        passwordHash,
        firstName, // Envoyé en clair pour l'UI User standard (optionnel, sinon mettre "Patient")
        lastName,
        role: 'PATIENT',
        // Données ZK
        salt: base64UrlEncode(salt),
        encryptedProfile: encryptedProfile,
        encryptedMasterKey: 'not-used-in-simple-model' // ou générer une vraie enveloppe si besoin
      };

      setMessage('cloud_upload Envoi au serveur sécurisé...');
      const response = await register(payload);

      // 4. Succès
      // Stocker les tokens
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      
      // Stocker la clé en mémoire pour la session immédiate
      storeEncryptionKey(masterKey);
      
      localStorage.setItem('currentUser', JSON.stringify({
        id: response.userId, // Adapter selon retour backend
        email,
        role: 'PATIENT',
        profile: profileData
      }));

      setMessage('✅ Compte créé avec succès ! Redirection vers la finalisation du profil...');
      setTimeout(() => navigate('/patient/onboarding'), 1500);

    } catch (error) {
      console.error('Erreur inscription:', error);
      setMessage(`❌ ${error.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="row">
      <div className="col-12 col-md-8 col-lg-6 mx-auto">
        <div className="card shadow-lg">
          <div className="card-header bg-success text-white text-center py-4">
            <i className="bi bi-person-plus-fill" style={{fontSize: '3rem'}}></i>
            <h2 className="mt-2 mb-0">Inscription Patient</h2>
            <p className="mb-0 small">🛡️ Vos données sont chiffrées avant l'envoi</p>
          </div>

          <div className="card-body p-4">
            {message && (
              <div className={`alert ${
                message.includes('✅') ? 'alert-success' : 
                message.includes('🔐') || message.includes('cloud') ? 'alert-info' : 
                'alert-danger'
              }`}>
                {message}
              </div>
            )}

            <div className="alert alert-warning small mb-4">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              <strong>Attention :</strong> Nous ne stockons pas votre mot de passe. 
              Si vous l'oubliez, vos données chiffrées seront <strong>définitivement perdues</strong>.
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Prénom</label>
                <input
                  type="text"
                  className="form-control"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Nom</label>
                <input
                  type="text"
                  className="form-control"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Email</label>
              <input
                type="email"
                className="form-control"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Mot de passe</label>
              <input
                type="password"
                className="form-control"
                name="password"
                value={formData.password}
                onChange={handleChange}
              />
              <small className="text-muted">Min. 8 caractères</small>
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold">Confirmer le mot de passe</label>
              <input
                type="password"
                className="form-control"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            <button
              className="btn btn-success btn-lg w-100 mb-3"
              onClick={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Traitement sécurisé...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle-fill me-2"></i>
                  Créer mon compte sécurisé
                </>
              )}
            </button>

            <div className="text-center">
              <Link to="/patient/login" className="text-decoration-none">
                Déjà inscrit ? Se connecter
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

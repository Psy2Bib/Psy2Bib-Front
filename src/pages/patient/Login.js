import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { deriveKey, decryptData, hashPassword, storeEncryptionKey } from '../../utils/crypto';
import { login } from '../../utils/api';

export default function PatientLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      setMessage('⚠️ Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    setMessage('🔄 Authentification en cours...');

    try {
      // 1. Hasher le mot de passe pour l'envoi au serveur
      const passwordHash = await hashPassword(password);

      // 2. Appel API Login
      const response = await login(email, passwordHash);
      
      if (response.role !== 'PATIENT') {
        throw new Error('Ce compte n\'est pas un compte patient.');
      }

      setMessage('🔓 Déchiffrement de vos données...');

      // 3. Dériver la clé de chiffrement avec le salt reçu et le mot de passe saisi
      // response contient { accessToken, encryptedMasterKey, salt, encryptedProfile, ... }
      
      // Note: salt et encryptedProfile sont en Base64 (reçus du backend)
      const encryptionKey = await deriveKey(password, response.salt);

      // 4. Tenter de déchiffrer le profil
      let decryptedProfile = {};
      try {
        if (response.encryptedProfile) {
          decryptedProfile = await decryptData(response.encryptedProfile, encryptionKey);
        }
      } catch (decryptError) {
        console.error('Erreur déchiffrement:', decryptError);
        throw new Error('Authentification réussie mais impossible de déchiffrer les données locales (Mot de passe différent ?)');
      }

      // 5. Succès : Stocker les tokens et la clé
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('currentUser', JSON.stringify({
        id: response.userId,
        email,
        role: 'PATIENT',
        profile: decryptedProfile
      }));

      // Stocker la clé AES en mémoire vive uniquement
      storeEncryptionKey(encryptionKey);

      setMessage('✅ Connexion réussie ! Redirection...');
      setTimeout(() => navigate('/patient/dashboard'), 1000);

    } catch (error) {
      console.error('Erreur connexion:', error);
      setMessage(`❌ ${error.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="row">
      <div className="col-12 col-md-6 col-lg-5 mx-auto">
        <div className="card shadow-lg">
          <div className="card-header bg-primary text-white text-center py-4">
            <i className="bi bi-shield-lock" style={{fontSize: '3rem'}}></i>
            <h2 className="mt-2 mb-0">Connexion Patient</h2>
            <p className="mb-0 small">🔐 Authentification E2EE & Zero-Knowledge</p>
          </div>

          <div className="card-body p-4">
            {message && (
              <div className={`alert ${
                message.includes('✅') ? 'alert-success' : 
                message.includes('🔓') || message.includes('🔄') ? 'alert-info' : 
                'alert-danger'
              }`}>
                {message}
              </div>
            )}

            <div className="alert alert-info small mb-4">
              <i className="bi bi-info-circle-fill me-2"></i>
              Votre mot de passe <strong>ne quitte jamais votre navigateur en clair</strong>.
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Email</label>
              <input
                type="email"
                className="form-control form-control-lg"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                disabled={loading}
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold">Mot de passe</label>
              <input
                type="password"
                className="form-control form-control-lg"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                disabled={loading}
              />
            </div>

            <button
              className="btn btn-primary btn-lg w-100 mb-3"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Connexion...
                </>
              ) : (
                <>
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  Se connecter
                </>
              )}
            </button>

            <div className="text-center">
              <Link to="/patient/register" className="text-decoration-none">
                Pas encore de compte ? S'inscrire
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

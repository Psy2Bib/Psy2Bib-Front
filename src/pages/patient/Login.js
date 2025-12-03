import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { deriveKey, decryptData, base64ToArrayBuffer, storeEncryptionKey } from '../../utils/crypto';

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
    setMessage('🔓 Déchiffrement en cours...');

    try {
      // 1. Récupérer les données chiffrées (simulation backend)
      const stored = localStorage.getItem(`patient:${email}`);
      
      if (!stored) {
        setMessage('❌ Compte non trouvé. Veuillez vous inscrire.');
        setLoading(false);
        return;
      }

      const userData = JSON.parse(stored);

      // 2. Récupérer le salt et re-dériver la clé AES depuis le mot de passe
      const salt = base64ToArrayBuffer(userData.salt);
      const encryptionKey = await deriveKey(password, salt);

      // 3. Tenter de déchiffrer le profil
      try {
        const decryptedProfile = await decryptData(userData.encryptedProfile, encryptionKey);
        
        // 4. Si le déchiffrement réussit, le mot de passe est correct
        // Stocker la clé en mémoire pour la session
        storeEncryptionKey(encryptionKey);

        // 5. Stocker l'utilisateur connecté avec profil déchiffré
        localStorage.setItem('currentUser', JSON.stringify({
          email,
          role: 'patient',
          profile: decryptedProfile
        }));

        setMessage('✅ Connexion réussie ! Redirection...');
        setTimeout(() => navigate('/patient/dashboard'), 1500);

      } catch (decryptError) {
        // Si le déchiffrement échoue, le mot de passe est incorrect
        setMessage('❌ Mot de passe incorrect. Impossible de déchiffrer vos données.');
        setLoading(false);
      }

    } catch (error) {
      console.error('Erreur connexion:', error);
      setMessage('❌ Erreur lors de la connexion. Veuillez réessayer.');
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
            <p className="mb-0 small">🔐 Authentification E2EE</p>
          </div>

          <div className="card-body p-4">
            {message && (
              <div className={`alert ${
                message.includes('✅') ? 'alert-success' : 
                message.includes('🔓') ? 'alert-info' : 
                'alert-danger'
              }`}>
                {message}
              </div>
            )}

            <div className="alert alert-info small mb-4">
              <i className="bi bi-info-circle-fill me-2"></i>
              Votre mot de passe <strong>ne quitte jamais votre navigateur</strong>. 
              Il sert uniquement à déchiffrer vos données localement.
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
              <small className="text-muted">
                <i className="bi bi-unlock me-1"></i>
                Utilisé pour déchiffrer vos données chiffrées
              </small>
            </div>

            <button
              className="btn btn-primary btn-lg w-100 mb-3"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Déchiffrement...
                </>
              ) : (
                <>
                  <i className="bi bi-unlock-fill me-2"></i>
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

          <div className="card-footer bg-light text-center">
            <small className="text-muted">
              <i className="bi bi-shield-check me-1"></i>
              Zero-Knowledge • Vos données ne quittent jamais votre appareil en clair
            </small>
          </div>
        </div>

        {/* Informations techniques */}
        <div className="card mt-3 shadow">
          <div className="card-body">
            <h6 className="mb-3">
              <i className="bi bi-gear-fill me-2 text-primary"></i>
              Comment fonctionne le chiffrement ?
            </h6>
            <ol className="small mb-0">
              <li className="mb-2">
                <strong>PBKDF2 (100k itérations)</strong> : Votre mot de passe génère une clé AES-256
              </li>
              <li className="mb-2">
                <strong>AES-GCM</strong> : Vos données sont déchiffrées localement dans le navigateur
              </li>
              <li className="mb-2">
                <strong>Zero-Knowledge</strong> : Le serveur ne possède aucune clé de déchiffrement
              </li>
              <li>
                <strong>Validation</strong> : Si le déchiffrement échoue, le mot de passe est incorrect
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { deriveKey, decryptData, base64ToArrayBuffer, storeEncryptionKey } from '../../utils/crypto';

export default function PsyLogin() {
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
      const stored = localStorage.getItem(`psy:${email}`);
      
      if (!stored) {
        setMessage('❌ Compte non trouvé. Veuillez vous inscrire.');
        setLoading(false);
        return;
      }

      const userData = JSON.parse(stored);
      const salt = base64ToArrayBuffer(userData.salt);
      const encryptionKey = await deriveKey(password, salt);

      try {
        const decryptedProfile = await decryptData(userData.encryptedProfile, encryptionKey);
        storeEncryptionKey(encryptionKey);

        localStorage.setItem('currentUser', JSON.stringify({
          email,
          role: 'psy',
          profile: decryptedProfile
        }));

        setMessage('✅ Connexion réussie ! Redirection...');
        setTimeout(() => navigate('/psy/dashboard'), 1500);

      } catch (decryptError) {
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
          <div className="card-header bg-success text-white text-center py-4">
            <i className="bi bi-person-badge" style={{fontSize: '3rem'}}></i>
            <h2 className="mt-2 mb-0">Espace Psychologue</h2>
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
              Connexion professionnelle sécurisée. Votre mot de passe <strong>ne quitte jamais votre navigateur</strong>.
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Email Professionnel</label>
              <input
                type="email"
                className="form-control form-control-lg"
                placeholder="dr.martin@cabinet.com"
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
              className="btn btn-success btn-lg w-100 mb-3"
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
              <Link to="/psy/register" className="text-decoration-none">
                Première connexion ? S'inscrire
              </Link>
            </div>
          </div>

          <div className="card-footer bg-light text-center">
            <small className="text-muted">
              <i className="bi bi-shield-lock me-1"></i>
              Connexion professionnelle sécurisée • Zero-Knowledge
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}
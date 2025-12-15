import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  deriveKey, 
  decryptData, 
  base64ToArrayBuffer, 
  storeEncryptionKey,
  isArgon2Available,
  getArgon2Config 
} from '../../utils/crypto';

export default function PsyLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [argon2Ready, setArgon2Ready] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkArgon2 = () => {
      if (isArgon2Available()) {
        setArgon2Ready(true);
      } else {
        setTimeout(checkArgon2, 100);
      }
    };
    checkArgon2();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      setMessage('⚠️ Veuillez remplir tous les champs');
      return;
    }

    if (!argon2Ready) {
      setMessage('⏳ Chargement du module Argon2...');
      return;
    }

    setLoading(true);
    setMessage('🔐 Dérivation Argon2id en cours...');

    try {
      const stored = localStorage.getItem(`psy:${email}`);
      
      if (!stored) {
        setMessage('❌ Compte non trouvé. Veuillez vous inscrire.');
        setLoading(false);
        return;
      }

      const userData = JSON.parse(stored);
      const salt = base64ToArrayBuffer(userData.salt);
      
      setMessage('🔓 Déchiffrement AES-GCM...');
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
      setMessage('❌ Erreur: ' + error.message);
      setLoading(false);
    }
  };

  const argon2Config = getArgon2Config();

  return (
    <div className="row">
      <div className="col-12 col-md-6 col-lg-5 mx-auto">
        <div className="card shadow-lg">
          <div className="card-header bg-success text-white text-center py-4">
            <i className="bi bi-person-badge" style={{fontSize: '3rem'}}></i>
            <h2 className="mt-2 mb-0">Espace Psychologue</h2>
            <p className="mb-0 small">
              🔐 Authentification Argon2id + AES-256
              {argon2Ready && (
                <span className="badge bg-light text-success ms-2">
                  <i className="bi bi-check-circle"></i> Argon2 Prêt
                </span>
              )}
            </p>
          </div>

          <div className="card-body p-4">
            {message && (
              <div className={`alert ${
                message.includes('✅') ? 'alert-success' : 
                message.includes('🔐') || message.includes('🔓') || message.includes('⏳') ? 'alert-info' : 
                'alert-danger'
              }`}>
                {message}
              </div>
            )}

            <div className="alert alert-info small mb-4">
              <i className="bi bi-info-circle-fill me-2"></i>
              Connexion professionnelle sécurisée avec <strong>Argon2id</strong> (64MB RAM). 
              Votre mot de passe <strong>ne quitte jamais votre navigateur</strong>.
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
              <small className="text-muted">
                <i className="bi bi-key me-1"></i>
                Dérive la clé Argon2id → AES-256
              </small>
            </div>

            <button
              className="btn btn-success btn-lg w-100 mb-3"
              onClick={handleLogin}
              disabled={loading || !argon2Ready}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Dérivation Argon2id...
                </>
              ) : !argon2Ready ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Chargement Argon2...
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
              Connexion professionnelle • Argon2id • Zero-Knowledge
            </small>
          </div>
        </div>

        {/* Info Argon2 */}
        <div className="card mt-3 shadow">
          <div className="card-body">
            <h6 className="mb-3">
              <i className="bi bi-shield-fill-check me-2 text-success"></i>
              Sécurité Argon2id
            </h6>
            <div className="row small">
              <div className="col-6">
                <p className="mb-1"><strong>Mémoire:</strong> {argon2Config.memoryMB} MB</p>
                <p className="mb-0"><strong>Itérations:</strong> {argon2Config.iterations}</p>
              </div>
              <div className="col-6">
                <p className="mb-1"><strong>Parallelism:</strong> {argon2Config.parallelism}</p>
                <p className="mb-0"><strong>Hash:</strong> {argon2Config.hashLength * 8} bits</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
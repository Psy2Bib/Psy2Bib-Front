import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login, getRedirectUrl } from '../../utils/auth';
import { isArgon2Available, getArgon2Config } from '../../utils/crypto';

export default function PsyLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [argon2Ready, setArgon2Ready] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Vérifier que Argon2 est chargé
    const checkArgon2 = () => {
      if (isArgon2Available()) {
        setArgon2Ready(true);
        console.log('Argon2 prêt:', getArgon2Config());
      } else {
        setTimeout(checkArgon2, 100);
      }
    };
    checkArgon2();
  }, []);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async (e) => {
    e?.preventDefault();
    
    // Validation
    if (!email.trim()) {
      setMessage('⚠️ Veuillez saisir votre email');
      return;
    }

    if (!validateEmail(email)) {
      setMessage('⚠️ Format d\'email invalide');
      return;
    }

    if (!password) {
      setMessage('⚠️ Veuillez saisir votre mot de passe');
      return;
    }

    if (password.length < 8) {
      setMessage('⚠️ Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    if (!argon2Ready) {
      setMessage('⏳ Chargement du module de sécurité Argon2...');
      return;
    }

    setLoading(true);
    setMessage('🔐 Connexion en cours...');

    try {
      // Utiliser le service d'authentification qui gère tout
      const userData = await login(email.trim(), password);

      setMessage('✅ Connexion réussie ! Redirection...');
      setTimeout(() => {
        // Rediriger selon le rôle
        const redirectUrl = getRedirectUrl(userData.role);
        navigate(redirectUrl);
      }, 1000);

    } catch (error) {
      console.error('Erreur connexion:', error);
      
      // Afficher le message d'erreur de manière claire
      setMessage(error.message || '❌ Erreur lors de la connexion. Veuillez réessayer.');
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
            <h2 className="mt-2 mb-0">Connexion Psychologue</h2>
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
              Votre mot de passe <strong>ne quitte jamais votre navigateur</strong>. 
              Il est transformé par <strong>Argon2id</strong> (64MB RAM, résistant GPU) 
              pour déchiffrer vos données localement.
            </div>

            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label className="form-label fw-bold">Email Professionnel</label>
                <input
                  type="email"
                  className="form-control form-control-lg"
                  placeholder="dr.martin@cabinet.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                  autoComplete="email"
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
                  disabled={loading}
                  required
                  autoComplete="current-password"
                  minLength={8}
                />
                <small className="text-muted">
                  <i className="bi bi-unlock me-1"></i>
                  Utilisé pour dériver la clé Argon2id → AES-256
                </small>
              </div>

              <button
                type="submit"
                className="btn btn-success btn-lg w-100 mb-3"
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
            </form>

            <div className="text-center">
              <Link to="/psy/register" className="text-decoration-none">
                Première connexion ? S'inscrire
              </Link>
            </div>
          </div>

          <div className="card-footer bg-light text-center">
            <small className="text-muted">
              <i className="bi bi-shield-check me-1"></i>
              Zero-Knowledge • Argon2id • Vos données ne quittent jamais votre appareil en clair
            </small>
          </div>
        </div>

        {/* Informations techniques Argon2 */}
        <div className="card mt-3 shadow">
          <div className="card-body">
            <h6 className="mb-3">
              <i className="bi bi-gear-fill me-2 text-success"></i>
              Sécurité Argon2id (OWASP 2024)
            </h6>
            <div className="row small">
              <div className="col-6">
                <ul className="list-unstyled mb-0">
                  <li className="mb-2">
                    <i className="bi bi-memory text-info me-2"></i>
                    <strong>Mémoire:</strong> {argon2Config.memoryMB} MB
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-arrow-repeat text-success me-2"></i>
                    <strong>Itérations:</strong> {argon2Config.iterations}
                  </li>
                </ul>
              </div>
              <div className="col-6">
                <ul className="list-unstyled mb-0">
                  <li className="mb-2">
                    <i className="bi bi-cpu text-warning me-2"></i>
                    <strong>Parallelism:</strong> {argon2Config.parallelism}
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-key text-danger me-2"></i>
                    <strong>Hash:</strong> {argon2Config.hashLength * 8} bits
                  </li>
                </ul>
              </div>
            </div>
            <hr />
            <p className="small text-muted mb-0">
              <i className="bi bi-shield-fill-check text-success me-1"></i>
              <strong>Argon2id</strong> est recommandé par OWASP car il est 
              <strong> memory-hard</strong> (résistant aux attaques GPU/ASIC) et 
              combine les avantages d'Argon2i (side-channel resistant) et Argon2d (GPU resistant).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

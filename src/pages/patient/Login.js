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

export default function PatientLogin() {
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

  const handleLogin = async () => {
    if (!email || !password) {
      setMessage('⚠️ Veuillez remplir tous les champs');
      return;
    }

    if (!argon2Ready) {
      setMessage('⏳ Chargement du module de sécurité Argon2...');
      return;
    }

    setLoading(true);
    setMessage('🔐 Dérivation Argon2id en cours (64MB RAM)...');

    try {
      // 1. Récupérer les données chiffrées (simulation backend)
      const stored = localStorage.getItem(`patient:${email}`);
      
      if (!stored) {
        setMessage('❌ Compte non trouvé. Veuillez vous inscrire.');
        setLoading(false);
        return;
      }

      const userData = JSON.parse(stored);

      // 2. Récupérer le salt et re-dériver la clé AES avec Argon2id
      const salt = base64ToArrayBuffer(userData.salt);
      
      setMessage('🔓 Déchiffrement AES-GCM en cours...');
      const encryptionKey = await deriveKey(password, salt);

      // 3. Tenter de déchiffrer le profil
      try {
        const decryptedProfile = await decryptData(userData.encryptedProfile, encryptionKey);
        
        // 4. Si le déchiffrement réussit, le mot de passe est correct
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
        setMessage('❌ Mot de passe incorrect. Impossible de déchiffrer vos données.');
        setLoading(false);
      }

    } catch (error) {
      console.error('Erreur connexion:', error);
      setMessage('❌ Erreur lors de la connexion: ' + error.message);
      setLoading(false);
    }
  };

  const argon2Config = getArgon2Config();

  return (
    <div className="row">
      <div className="col-12 col-md-6 col-lg-5 mx-auto">
        <div className="card shadow-lg">
          <div className="card-header bg-primary text-white text-center py-4">
            <i className="bi bi-shield-lock" style={{fontSize: '3rem'}}></i>
            <h2 className="mt-2 mb-0">Connexion Patient</h2>
            <p className="mb-0 small">
              🔐 Authentification Argon2id + AES-256
              {argon2Ready && (
                <span className="badge bg-success ms-2">
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
                Utilisé pour dériver la clé Argon2id → AES-256
              </small>
            </div>

            <button
              className="btn btn-primary btn-lg w-100 mb-3"
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
              <Link to="/patient/register" className="text-decoration-none">
                Pas encore de compte ? S'inscrire
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
              <i className="bi bi-gear-fill me-2 text-primary"></i>
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
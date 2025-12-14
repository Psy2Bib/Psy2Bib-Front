import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../../utils/auth';
import { isArgon2Available, getArgon2Config } from '../../utils/crypto';

export default function PatientRegister() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [pseudo, setPseudo] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [argon2Ready, setArgon2Ready] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkArgon2 = () => {
      if (isArgon2Available()) {
        setArgon2Ready(true);
        console.log('Argon2 prêt pour inscription:', getArgon2Config());
      } else {
        setTimeout(checkArgon2, 100);
      }
    };
    checkArgon2();
  }, []);

  const handleRegister = async () => {
    // Validations
    if (!email || !password || !confirmPassword || !firstName || !lastName) {
      setMessage('⚠️ Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (password !== confirmPassword) {
      setMessage('❌ Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 8) {
      setMessage('❌ Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    if (!argon2Ready) {
      setMessage('⏳ Chargement du module de sécurité Argon2...');
      return;
    }

    setLoading(true);
    setMessage('🔐 Inscription en cours...');

    try {
      // Utiliser le service d'authentification qui gère tout le chiffrement
      const userData = await register({
        email,
        pseudo: pseudo || email.split('@')[0],
        firstName,
        lastName,
        phone,
        birthDate,
        role: 'PATIENT',
      }, password);

      setMessage('✅ Inscription réussie ! Vos données sont chiffrées avec Argon2id + AES-256.');
      setTimeout(() => {
        // Rediriger selon le rôle
        if (userData.role === 'PATIENT') {
          navigate('/patient/dashboard');
        } else if (userData.role === 'PSY') {
          navigate('/psy/dashboard');
        } else {
          navigate('/');
        }
      }, 2000);

    } catch (error) {
      console.error('Erreur inscription:', error);
      
      // Gérer les erreurs spécifiques
      if (error.response?.status === 409) {
        setMessage('❌ Cet email est déjà utilisé.');
      } else if (error.response?.status === 400) {
        setMessage('❌ Données invalides: ' + (error.response.data?.message || 'Vérifiez vos informations'));
      } else {
        setMessage('❌ Erreur lors de l\'inscription: ' + (error.message || 'Erreur inconnue'));
      }
      setLoading(false);
    }
  };

  const argon2Config = getArgon2Config();

  return (
    <div className="row">
      <div className="col-12 col-md-8 col-lg-6 mx-auto">
        <div className="card shadow-lg">
          <div className="card-header bg-primary text-white text-center py-4">
            <i className="bi bi-person-plus-fill" style={{fontSize: '3rem'}}></i>
            <h2 className="mt-2 mb-0">Inscription Patient</h2>
            <p className="mb-0 small">
              🔐 Chiffrement Argon2id + AES-256-GCM
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
                message.includes('🔐') || message.includes('🔑') || message.includes('🔒') || message.includes('⏳') ? 'alert-info' : 
                'alert-danger'
              }`}>
                {message}
              </div>
            )}

            <div className="alert alert-success small mb-4">
              <i className="bi bi-shield-fill-check me-2"></i>
              <strong>Zero-Knowledge :</strong> Vos données sont chiffrées localement avec 
              <strong> Argon2id</strong> (64MB RAM, résistant GPU) + <strong>AES-256-GCM</strong>. 
              Le serveur ne peut <strong>jamais</strong> les lire.
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">
                  Prénom <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="Jean"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={loading}
                />
                <small className="text-muted">
                  <i className="bi bi-lock-fill me-1"></i>Chiffré E2EE
                </small>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">
                  Nom <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="Dupont"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={loading}
                />
                <small className="text-muted">
                  <i className="bi bi-lock-fill me-1"></i>Chiffré E2EE
                </small>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">
                Email <span className="text-danger">*</span>
              </label>
              <input
                type="email"
                className="form-control form-control-lg"
                placeholder="jean.dupont@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              <small className="text-muted">
                <i className="bi bi-eye me-1"></i>Stocké en clair (authentification)
              </small>
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">
                Pseudo <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="jean_dupont"
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
                disabled={loading}
              />
              <small className="text-muted">
                <i className="bi bi-person me-1"></i>Nom d'utilisateur unique
              </small>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Téléphone</label>
                <input
                  type="tel"
                  className="form-control form-control-lg"
                  placeholder="06 12 34 56 78"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loading}
                />
                <small className="text-muted">
                  <i className="bi bi-lock-fill me-1"></i>Chiffré E2EE
                </small>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Date de naissance</label>
                <input
                  type="date"
                  className="form-control form-control-lg"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  disabled={loading}
                />
                <small className="text-muted">
                  <i className="bi bi-lock-fill me-1"></i>Chiffré E2EE
                </small>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">
                Mot de passe <span className="text-danger">*</span>
              </label>
              <input
                type="password"
                className="form-control form-control-lg"
                placeholder="Minimum 8 caractères"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <small className="text-muted">
                <i className="bi bi-key me-1"></i>
                Génère votre clé via Argon2id ({argon2Config.memoryMB}MB, {argon2Config.iterations} itérations)
              </small>
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold">
                Confirmer le mot de passe <span className="text-danger">*</span>
              </label>
              <input
                type="password"
                className="form-control form-control-lg"
                placeholder="Retaper le mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <button
              className="btn btn-primary btn-lg w-100 mb-3"
              onClick={handleRegister}
              disabled={loading || !argon2Ready}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Chiffrement Argon2id...
                </>
              ) : !argon2Ready ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Chargement Argon2...
                </>
              ) : (
                <>
                  <i className="bi bi-shield-check me-2"></i>
                  S'inscrire (Zero-Knowledge)
                </>
              )}
            </button>

            <div className="text-center">
              <Link to="/patient/login" className="text-decoration-none">
                Déjà un compte ? Se connecter
              </Link>
            </div>
          </div>

          <div className="card-footer bg-light">
            <div className="row text-center small">
              <div className="col-4">
                <i className="bi bi-shield-fill-check text-success d-block mb-1" style={{fontSize: '1.5rem'}}></i>
                <strong>Argon2id</strong>
                <div className="text-muted">Memory-Hard</div>
              </div>
              <div className="col-4">
                <i className="bi bi-key-fill text-primary d-block mb-1" style={{fontSize: '1.5rem'}}></i>
                <strong>AES-256</strong>
                <div className="text-muted">GCM Mode</div>
              </div>
              <div className="col-4">
                <i className="bi bi-eye-slash-fill text-warning d-block mb-1" style={{fontSize: '1.5rem'}}></i>
                <strong>Zero-Know</strong>
                <div className="text-muted">Serveur aveugle</div>
              </div>
            </div>
          </div>
        </div>

        {/* Card explicative Argon2 */}
        <div className="card mt-3 shadow">
          <div className="card-body">
            <h6 className="mb-3">
              <i className="bi bi-info-circle-fill me-2 text-info"></i>
              Pourquoi Argon2id ?
            </h6>
            <ul className="small mb-0">
              <li className="mb-2">
                <strong>Memory-Hard (64MB) :</strong> Résiste aux attaques par GPU/ASIC car nécessite beaucoup de mémoire
              </li>
              <li className="mb-2">
                <strong>Argon2id :</strong> Combine Argon2i (résistant side-channel) + Argon2d (résistant GPU)
              </li>
              <li className="mb-2">
                <strong>OWASP 2024 :</strong> Algorithme recommandé pour le stockage de mots de passe
              </li>
              <li>
                <strong>Vainqueur PHC :</strong> Gagnant de la Password Hashing Competition (2015)
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
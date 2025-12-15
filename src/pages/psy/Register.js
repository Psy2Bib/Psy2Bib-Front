import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  deriveKey, 
  generateSalt, 
  encryptData, 
  arrayBufferToBase64, 
  hashPassword,
  isArgon2Available,
  getArgon2Config 
} from '../../utils/crypto';

export default function PsyRegister() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [adeli, setAdeli] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [argon2Ready, setArgon2Ready] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkArgon2 = () => {
      if (isArgon2Available()) {
        setArgon2Ready(true);
        console.log('Argon2 prêt pour inscription psy:', getArgon2Config());
      } else {
        setTimeout(checkArgon2, 100);
      }
    };
    checkArgon2();
  }, []);

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword || !firstName || !lastName || !specialty) {
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
      setMessage('⏳ Chargement du module Argon2...');
      return;
    }

    if (localStorage.getItem(`psy:${email}`)) {
      setMessage('❌ Cet email est déjà utilisé');
      return;
    }

    setLoading(true);
    setMessage('🔐 Génération de la clé Argon2id (64MB RAM)...');

    try {
      // 1. Générer salt
      const salt = generateSalt();
      const saltBase64 = arrayBufferToBase64(salt);

      // 2. Dériver clé avec Argon2id
      setMessage('🔑 Dérivation Argon2id en cours...');
      const encryptionKey = await deriveKey(password, salt);

      // 3. Créer profil
      const profile = {
        firstName,
        lastName,
        email,
        specialty,
        adeli: adeli || null,
        registeredAt: new Date().toISOString(),
        encryptionMethod: 'Argon2id + AES-256-GCM'
      };

      // 4. Chiffrer avec AES-GCM
      setMessage('🔒 Chiffrement AES-256-GCM...');
      const encryptedProfile = await encryptData(profile, encryptionKey);

      // 5. Hash du mot de passe
      const passwordHash = await hashPassword(password);

      // 6. Stocker
      const userData = {
        email,
        passwordHash,
        salt: saltBase64,
        encryptedProfile,
        role: 'psy',
        createdAt: new Date().toISOString(),
        encryptionVersion: '2.0-argon2id'
      };

      localStorage.setItem(`psy:${email}`, JSON.stringify(userData));

      setMessage('✅ Inscription réussie ! Vos données sont chiffrées avec Argon2id + AES-256.');
      setTimeout(() => navigate('/psy/login'), 2000);

    } catch (error) {
      console.error('Erreur inscription:', error);
      setMessage('❌ Erreur: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const argon2Config = getArgon2Config();

  return (
    <div className="row">
      <div className="col-12 col-md-8 col-lg-6 mx-auto">
        <div className="card shadow-lg">
          <div className="card-header bg-success text-white text-center py-4">
            <i className="bi bi-person-badge-fill" style={{fontSize: '3rem'}}></i>
            <h2 className="mt-2 mb-0">Inscription Psychologue</h2>
            <p className="mb-0 small">
              🔐 Chiffrement Argon2id + AES-256-GCM
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
                message.includes('🔐') || message.includes('🔑') || message.includes('🔒') || message.includes('⏳') ? 'alert-info' : 
                'alert-danger'
              }`}>
                {message}
              </div>
            )}

            <div className="alert alert-warning small mb-4">
              <i className="bi bi-info-circle-fill me-2"></i>
              <strong>Espace professionnel sécurisé :</strong> Vos données sont chiffrées 
              localement avec <strong>Argon2id</strong> (64MB, résistant GPU) + <strong>AES-256-GCM</strong>. 
              Le serveur ne peut jamais les lire.
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">
                  Prénom <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="Sophie"
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
                  placeholder="Martin"
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
                Email Professionnel <span className="text-danger">*</span>
              </label>
              <input
                type="email"
                className="form-control form-control-lg"
                placeholder="dr.martin@cabinet.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              <small className="text-muted">
                <i className="bi bi-eye me-1"></i>Stocké en clair (authentification)
              </small>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">
                  Spécialité <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select form-select-lg"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Choisir une spécialité</option>
                  <option value="Thérapie cognitive-comportementale">TCC</option>
                  <option value="Psychanalyse">Psychanalyse</option>
                  <option value="Thérapie familiale">Thérapie familiale</option>
                  <option value="Psychologie du travail">Psychologie du travail</option>
                  <option value="Psychologie clinique">Psychologie clinique</option>
                </select>
                <small className="text-muted">
                  <i className="bi bi-lock-fill me-1"></i>Chiffré E2EE
                </small>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Numéro ADELI</label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="123456789"
                  value={adeli}
                  onChange={(e) => setAdeli(e.target.value)}
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
                Génère votre clé via Argon2id ({argon2Config.memoryMB}MB RAM)
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
              className="btn btn-success btn-lg w-100 mb-3"
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
              <Link to="/psy/login" className="text-decoration-none">
                Déjà un compte ? Se connecter
              </Link>
            </div>
          </div>

          <div className="card-footer bg-light">
            <div className="row text-center small">
              <div className="col-4">
                <i className="bi bi-shield-fill-check text-success d-block mb-1" style={{fontSize: '1.5rem'}}></i>
                <strong>Argon2id</strong>
                <div className="text-muted">64MB RAM</div>
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

        {/* Info Argon2 */}
        <div className="card mt-3 shadow">
          <div className="card-body">
            <h6 className="mb-3">
              <i className="bi bi-info-circle-fill me-2 text-info"></i>
              Configuration Argon2id (OWASP 2024)
            </h6>
            <table className="table table-sm small mb-0">
              <tbody>
                <tr>
                  <td><strong>Type</strong></td>
                  <td>Argon2id (hybrid)</td>
                </tr>
                <tr>
                  <td><strong>Mémoire</strong></td>
                  <td>{argon2Config.memoryMB} MB (memory-hard)</td>
                </tr>
                <tr>
                  <td><strong>Itérations</strong></td>
                  <td>{argon2Config.iterations} (time cost)</td>
                </tr>
                <tr>
                  <td><strong>Parallelism</strong></td>
                  <td>{argon2Config.parallelism} threads</td>
                </tr>
                <tr>
                  <td><strong>Hash Output</strong></td>
                  <td>{argon2Config.hashLength * 8} bits (AES-256)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
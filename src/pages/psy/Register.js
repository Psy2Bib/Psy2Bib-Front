import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { deriveKey, generateSalt, encryptData, arrayBufferToBase64, hashPassword } from '../../utils/crypto';

export default function PsyRegister() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword || !firstName || !lastName || !specialty) {
      setMessage('⚠️ Veuillez remplir tous les champs');
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

    if (localStorage.getItem(`psy:${email}`)) {
      setMessage('❌ Cet email est déjà utilisé');
      return;
    }

    setLoading(true);
    setMessage('🔐 Génération des clés de chiffrement...');

    try {
      const salt = generateSalt();
      const saltBase64 = arrayBufferToBase64(salt);
      const encryptionKey = await deriveKey(password, salt);

      const profile = {
        firstName,
        lastName,
        email,
        specialty,
        registeredAt: new Date().toISOString()
      };

      const encryptedProfile = await encryptData(profile, encryptionKey);
      const passwordHash = await hashPassword(password);

      const userData = {
        email,
        passwordHash,
        salt: saltBase64,
        encryptedProfile,
        role: 'psy',
        createdAt: new Date().toISOString()
      };

      localStorage.setItem(`psy:${email}`, JSON.stringify(userData));

      setMessage('✅ Inscription réussie ! Vos données sont chiffrées avec AES-256.');
      setTimeout(() => navigate('/psy/login'), 2000);

    } catch (error) {
      console.error('Erreur inscription:', error);
      setMessage('❌ Erreur lors de l\'inscription. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row">
      <div className="col-12 col-md-8 col-lg-6 mx-auto">
        <div className="card shadow-lg">
          <div className="card-header bg-success text-white text-center py-4">
            <i className="bi bi-person-badge-fill" style={{fontSize: '3rem'}}></i>
            <h2 className="mt-2 mb-0">Inscription Psychologue</h2>
            <p className="mb-0 small">🔐 Chiffrement Zero-Knowledge E2EE</p>
          </div>

          <div className="card-body p-4">
            {message && (
              <div className={`alert ${
                message.includes('✅') ? 'alert-success' : 
                message.includes('🔐') ? 'alert-info' : 
                'alert-danger'
              }`}>
                {message}
              </div>
            )}

            <div className="alert alert-warning small mb-4">
              <i className="bi bi-info-circle-fill me-2"></i>
              <strong>Espace professionnel sécurisé :</strong> Vos données sont chiffrées 
              localement avec AES-256. Le serveur ne peut jamais les lire.
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Prénom</label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="Dr. Sophie"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Nom</label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="Martin"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Email Professionnel</label>
              <input
                type="email"
                className="form-control form-control-lg"
                placeholder="dr.martin@cabinet.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Spécialité</label>
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
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Mot de passe</label>
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
                Génère votre clé de chiffrement (PBKDF2 100k itérations)
              </small>
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold">Confirmer le mot de passe</label>
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
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Chiffrement en cours...
                </>
              ) : (
                <>
                  <i className="bi bi-shield-check me-2"></i>
                  S'inscrire (E2EE)
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
                <strong>AES-256</strong>
                <div className="text-muted">Chiffrement</div>
              </div>
              <div className="col-4">
                <i className="bi bi-key-fill text-primary d-block mb-1" style={{fontSize: '1.5rem'}}></i>
                <strong>PBKDF2</strong>
                <div className="text-muted">100k itérations</div>
              </div>
              <div className="col-4">
                <i className="bi bi-eye-slash-fill text-warning d-block mb-1" style={{fontSize: '1.5rem'}}></i>
                <strong>Zero-Know</strong>
                <div className="text-muted">Serveur aveugle</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
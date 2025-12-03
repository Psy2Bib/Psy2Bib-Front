import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function PatientLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!email || !password) {
      setMessage('Veuillez remplir tous les champs');
      return;
    }

    const stored = localStorage.getItem(`patient:${email}`);
    
    if (stored) {
      const userData = JSON.parse(stored);
      if (userData.password === password) {
        localStorage.setItem('currentUser', JSON.stringify({ email, role: 'patient' }));
        setMessage('✓ Connexion réussie ! Redirection...');
        setTimeout(() => navigate('/patient/dashboard'), 1500);
      } else {
        setMessage('Mot de passe incorrect');
      }
    } else {
      setMessage('Compte non trouvé. Veuillez vous inscrire.');
    }
  };

  return (
    <div className="row">
      <div className="col-12 col-md-6 col-lg-5 mx-auto">
        <div className="card shadow-lg">
          <div className="card-header bg-primary text-white text-center py-4">
            <i className="bi bi-person-circle" style={{fontSize: '3rem'}}></i>
            <h2 className="mt-2 mb-0">Espace Patient</h2>
          </div>
          <div className="card-body p-4">
            {message && (
              <div className={`alert ${message.includes('✓') ? 'alert-success' : 'alert-danger'}`}>
                {message}
              </div>
            )}

            <div className="mb-3">
              <label className="form-label fw-bold">Email</label>
              <input
                type="email"
                className="form-control form-control-lg"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
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
              />
            </div>

            <button
              className="btn btn-primary btn-lg w-100 mb-3"
              onClick={handleLogin}
            >
              <i className="bi bi-box-arrow-in-right me-2"></i>
              Se connecter
            </button>

            <div className="text-center">
              <Link to="/patient/register" className="text-decoration-none">
                Pas encore de compte ? S'inscrire
              </Link>
            </div>
          </div>

          <div className="card-footer bg-light text-center">
            <small className="text-muted">
              <i className="bi bi-shield-lock me-1"></i>
              Connexion sécurisée
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}
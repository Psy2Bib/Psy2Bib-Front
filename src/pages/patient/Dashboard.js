import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { logout, getUser, isAuthenticated } from '../../utils/auth';
import { getMyAppointments } from '../../utils/api';
import { hasEncryptionKey } from '../../utils/crypto';

export default function PatientDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    nextAppointment: null,
    unreadMessages: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      // Vérifier si l'utilisateur est connecté
      if (!isAuthenticated()) {
        navigate('/patient/login');
        return;
      }

      const currentUser = getUser();
      
      if (!currentUser || currentUser.role !== 'PATIENT') {
        navigate('/patient/login');
        return;
      }

      setUser(currentUser);

      try {
        // Charger les rendez-vous depuis le backend
        const response = await getMyAppointments();
        const appointmentsData = response.appointments || [];
        setAppointments(appointmentsData);
        
        // Calculer les stats
        const now = new Date();
        const upcoming = appointmentsData
          .filter(apt => new Date(apt.scheduledStart) >= now)
          .sort((a, b) => new Date(a.scheduledStart) - new Date(b.scheduledStart));
        
        setStats({
          totalAppointments: appointmentsData.length,
          nextAppointment: upcoming[0] || null,
          unreadMessages: 0 // TODO: charger depuis l'API
        });
      } catch (error) {
        console.error('Erreur lors du chargement du dashboard:', error);
        if (error.response?.status === 401) {
          // Token expiré, rediriger vers login
          navigate('/patient/login');
        }
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/patient/login');
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="mb-0">
            <i className="bi bi-speedometer2 me-2 text-primary"></i>
            Tableau de bord Patient
          </h1>
          <p className="text-muted mb-0">
            Bienvenue, <strong>{user.profile?.firstName || user.pseudo || user.email}</strong>
            {hasEncryptionKey() && (
              <span className="badge bg-success ms-2">
                <i className="bi bi-shield-check me-1"></i>
                Chiffré E2EE
              </span>
            )}
          </p>
        </div>
        <button className="btn btn-outline-danger" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right me-2"></i>
          Déconnexion
        </button>
      </div>

      {/* Cartes de statistiques */}
      <div className="row mb-4">
        <div className="col-12 col-md-4 mb-3">
          <div className="card bg-gradient-primary text-white shadow">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-white-50 mb-1">Rendez-vous</h6>
                  <h2 className="mb-0">{stats.totalAppointments}</h2>
                </div>
                <i className="bi bi-calendar-check" style={{fontSize: '3rem', opacity: 0.3}}></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4 mb-3">
          <div className="card bg-gradient-info text-white shadow">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-white-50 mb-1">Messages non lus</h6>
                  <h2 className="mb-0">{stats.unreadMessages}</h2>
                </div>
                <i className="bi bi-envelope" style={{fontSize: '3rem', opacity: 0.3}}></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4 mb-3">
          <div className="card bg-gradient-success text-white shadow">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-white-50 mb-1">Consultations</h6>
                  <h2 className="mb-0">12</h2>
                </div>
                <i className="bi bi-graph-up" style={{fontSize: '3rem', opacity: 0.3}}></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accès rapide */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="bi bi-lightning-charge me-2"></i>
                Accès Rapide
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-6 col-md-3">
                  <Link to="/search" className="text-decoration-none">
                    <div className="card text-center hover-shadow" style={{cursor: 'pointer'}}>
                      <div className="card-body">
                        <i className="bi bi-search text-primary" style={{fontSize: '2.5rem'}}></i>
                        <p className="mt-2 mb-0 fw-bold">Trouver un psy</p>
                      </div>
                    </div>
                  </Link>
                </div>

                <div className="col-6 col-md-3">
                  <Link to="/appointments" className="text-decoration-none">
                    <div className="card text-center hover-shadow" style={{cursor: 'pointer'}}>
                      <div className="card-body">
                        <i className="bi bi-calendar-plus text-success" style={{fontSize: '2.5rem'}}></i>
                        <p className="mt-2 mb-0 fw-bold">Prendre RDV</p>
                      </div>
                    </div>
                  </Link>
                </div>

                <div className="col-6 col-md-3">
                  <Link to="/messages" className="text-decoration-none">
                    <div className="card text-center hover-shadow" style={{cursor: 'pointer'}}>
                      <div className="card-body">
                        <i className="bi bi-chat-dots text-info" style={{fontSize: '2.5rem'}}></i>
                        <p className="mt-2 mb-0 fw-bold">Messagerie</p>
                      </div>
                    </div>
                  </Link>
                </div>

                <div className="col-6 col-md-3">
                  <Link to="/visio" className="text-decoration-none">
                    <div className="card text-center hover-shadow" style={{cursor: 'pointer'}}>
                      <div className="card-body">
                        <i className="bi bi-camera-video text-warning" style={{fontSize: '2.5rem'}}></i>
                        <p className="mt-2 mb-0 fw-bold">Visio Avatar</p>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Prochain rendez-vous */}
      <div className="row">
        <div className="col-12 col-lg-6 mb-4">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="bi bi-calendar-event me-2"></i>
                Prochain rendez-vous
              </h5>
            </div>
            <div className="card-body">
              {stats.nextAppointment ? (
                <div>
                  <h5 className="mb-3">
                    {stats.nextAppointment.psy?.pseudo || 'Psychologue'}
                  </h5>
                  <p className="mb-2">
                    <i className="bi bi-calendar3 me-2 text-muted"></i>
                    {new Date(stats.nextAppointment.scheduledStart).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="mb-3">
                    <i className="bi bi-clock me-2 text-muted"></i>
                    {new Date(stats.nextAppointment.scheduledStart).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  <p className="mb-2">
                    <i className="bi bi-tag me-2 text-muted"></i>
                    Type: {stats.nextAppointment.type === 'ONLINE' ? 'Visio' : 'Cabinet'}
                  </p>
                  <p className="mb-2">
                    <i className="bi bi-info-circle me-2 text-muted"></i>
                    Statut: {stats.nextAppointment.status}
                  </p>
                  {stats.nextAppointment.type === 'ONLINE' && (
                    <Link to="/visio" className="btn btn-success w-100">
                      <i className="bi bi-camera-video me-2"></i>
                      Rejoindre avec Avatar 3D
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center text-muted py-4">
                  <i className="bi bi-calendar-x" style={{fontSize: '3rem'}}></i>
                  <p className="mt-3">Aucun rendez-vous prévu</p>
                  <Link to="/appointments" className="btn btn-primary">
                    Prendre rendez-vous
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6 mb-4">
          <div className="card shadow">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0">
                <i className="bi bi-clock-history me-2"></i>
                Activité Récente
              </h5>
            </div>
            <div className="card-body">
              <div className="list-group list-group-flush">
                <div className="list-group-item">
                  <small className="text-muted">Il y a 2 jours</small>
                  <p className="mb-0">
                    <i className="bi bi-shield-check text-success me-2"></i>
                    Consultation avec Dr. Martin (E2EE)
                  </p>
                </div>
                <div className="list-group-item">
                  <small className="text-muted">Il y a 5 jours</small>
                  <p className="mb-0">
                    <i className="bi bi-envelope-fill text-info me-2"></i>
                    Message chiffré envoyé à Dr. Dupont
                  </p>
                </div>
                <div className="list-group-item">
                  <small className="text-muted">Il y a 1 semaine</small>
                  <p className="mb-0">
                    <i className="bi bi-calendar-check text-primary me-2"></i>
                    Rendez-vous réservé
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bandeau sécurité */}
      <div className="alert alert-success shadow">
        <div className="d-flex align-items-center">
          <i className="bi bi-shield-fill-check me-3" style={{fontSize: '2rem'}}></i>
          <div>
            <strong>Vos données sont protégées</strong>
            <p className="mb-0 small">
              Chiffrement AES-256 • PBKDF2 100k itérations • Zero-Knowledge • 
              Le serveur ne peut jamais lire vos informations personnelles
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
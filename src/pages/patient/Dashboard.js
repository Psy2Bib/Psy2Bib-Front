import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { clearEncryptionKey, hasEncryptionKey } from '../../utils/crypto';
import { getMyAppointments } from '../../utils/api';

export default function PatientDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalFutureAppointments: 0,
    totalPastAppointments: 0,
    nextAppointment: null,
    unreadMessages: 0 // Nécessiterait un endpoint backend spécifique
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, [navigate]);

  const loadDashboardData = async () => {
    // 1. Vérification Auth
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!currentUser.email || currentUser.role?.toUpperCase() !== 'PATIENT' || !hasEncryptionKey()) {
      navigate('/patient/login');
      return;
    }
    setUser(currentUser);

    try {
      // 2. Récupération des RDV réels depuis l'API
      const appointmentsData = await getMyAppointments();
      // L'API retourne parfois { appointments: [...] } ou directement [...]
      const appointmentsList = Array.isArray(appointmentsData) ? appointmentsData : (appointmentsData.appointments || []);

      const now = new Date();

      // Séparer Passés / Futurs
      const past = appointmentsList.filter(apt => new Date(apt.date) < now);
      const future = appointmentsList.filter(apt => new Date(apt.date) >= now);

      // Trier les futurs par date croissante (le plus proche d'abord)
      future.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      // Trier les passés par date décroissante (le plus récent d'abord)
      past.sort((a, b) => new Date(b.date) - new Date(a.date));

      const nextApt = future.length > 0 ? future[0] : null;

      // 3. Mettre à jour les stats
      setStats({
        totalFutureAppointments: future.length,
        totalPastAppointments: past.length, // "Consultations" effectuées
        nextAppointment: nextApt,
        unreadMessages: 0 
      });

      // 4. Générer l'activité récente (Mix de RDV passés et futurs créés)
      // Pour l'instant on affiche les 5 derniers RDV (passés ou futurs proches)
      const allActivities = [...appointmentsList]
        .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)) // Idéalement on utiliserait createdAt
        .slice(0, 5)
        .map(apt => ({
          type: new Date(apt.date) < now ? 'past_consultation' : 'future_appointment',
          date: apt.date,
          psyName: apt.psy ? `${apt.psy.firstName} ${apt.psy.lastName}` : 'Psychologue',
          status: apt.status
        }));

      setRecentActivity(allActivities);

    } catch (err) {
      console.error("Erreur chargement dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearEncryptionKey();
    localStorage.removeItem('currentUser');
    navigate('/patient/login');
  };

  if (!user || loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="mb-0">
            <i className="bi bi-speedometer2 me-2 text-primary"></i>
            Tableau de bord Patient
          </h1>
          <p className="text-muted mb-0">
            Bienvenue, <strong>{user.profile?.firstName || user.email}</strong>
            <span className="badge bg-success ms-2">
              <i className="bi bi-shield-check me-1"></i>
              Chiffré E2EE
            </span>
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
                  <h6 className="text-white-50 mb-1">Rendez-vous à venir</h6>
                  <h2 className="mb-0">{stats.totalFutureAppointments}</h2>
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
                  <h6 className="text-white-50 mb-1">Consultations Passées</h6>
                  <h2 className="mb-0">{stats.totalPastAppointments}</h2>
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
          <div className="card shadow h-100">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="bi bi-calendar-event me-2"></i>
                Prochain rendez-vous
              </h5>
            </div>
            <div className="card-body">
              {stats.nextAppointment ? (
                <div>
                  <h5 className="mb-3">Dr. {stats.nextAppointment.psy?.firstName} {stats.nextAppointment.psy?.lastName}</h5>
                  <p className="mb-2">
                    <i className="bi bi-bookmark me-2 text-muted"></i>
                    {stats.nextAppointment.type === 'ONLINE' ? 'Consultation Vidéo' : 'Cabinet'}
                  </p>
                  <p className="mb-2">
                    <i className="bi bi-calendar3 me-2 text-muted"></i>
                    {new Date(stats.nextAppointment.date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="mb-3">
                    <i className="bi bi-clock me-2 text-muted"></i>
                    {new Date(stats.nextAppointment.date).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}
                  </p>
                  <button 
                    className="btn btn-success w-100"
                    onClick={() => navigate('/visio', { state: { appointment: stats.nextAppointment } })}
                  >
                    <i className="bi bi-camera-video me-2"></i>
                    Rejoindre avec Avatar 3D
                  </button>
                </div>
              ) : (
                <div className="text-center text-muted py-4">
                  <i className="bi bi-calendar-x" style={{fontSize: '3rem'}}></i>
                  <p className="mt-3">Aucun rendez-vous prévu</p>
                  <Link to="/search" className="btn btn-primary">
                    Trouver un psychologue
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6 mb-4">
          <div className="card shadow h-100">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0">
                <i className="bi bi-clock-history me-2"></i>
                Activité Récente
              </h5>
            </div>
            <div className="card-body">
              <div className="list-group list-group-flush">
                {recentActivity.length > 0 ? (
                  recentActivity.map((act, idx) => (
                    <div key={idx} className="list-group-item">
                      <div className="d-flex w-100 justify-content-between">
                        <small className="text-muted">
                          {new Date(act.date).toLocaleDateString()}
                        </small>
                        <small className={`badge bg-${act.status === 'CONFIRMED' ? 'success' : 'warning'}`}>
                          {act.status}
                        </small>
                      </div>
                      <p className="mb-1">
                        {act.type === 'past_consultation' ? (
                          <><i className="bi bi-check-circle-fill text-success me-2"></i>Consultation effectuée</>
                        ) : (
                          <><i className="bi bi-calendar-event text-primary me-2"></i>Rendez-vous planifié</>
                        )}
                         {' '}avec Dr. {act.psyName}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted mt-3">Aucune activité récente.</p>
                )}
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
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { logout, getUser, isAuthenticated, ensureAuthenticated } from '../../utils/auth';
import { getPsyAppointments, createAvailabilities } from '../../utils/api';
import { hasEncryptionKey } from '../../utils/crypto';

export default function PsyDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({
    totalPatients: 0,
    appointmentsToday: 0,
    unreadMessages: 0,
    weekRevenue: '0€'
  });
  const [loading, setLoading] = useState(true);
  const [newAvailability, setNewAvailability] = useState({
    date: '',
    startTime: '',
    endTime: ''
  });
  const [creatingAvailability, setCreatingAvailability] = useState(false);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // Vérifier et rafraîchir l'authentification si nécessaire
        const authenticated = await ensureAuthenticated();
        if (!authenticated) {
          navigate('/psy/login');
          return;
        }

        const currentUser = getUser();
        
        if (!currentUser || currentUser.role !== 'PSY') {
          navigate('/psy/login');
          return;
        }

        setUser(currentUser);

        // Charger les rendez-vous depuis le backend
        try {
          const response = await getPsyAppointments();
          const appointmentsData = Array.isArray(response) ? response : (response.appointments || []);
          setAppointments(appointmentsData);
          
          // Calculer les stats
          const now = new Date();
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const appointmentsToday = appointmentsData.filter(apt => {
            if (!apt.scheduledStart) return false;
            const aptDate = new Date(apt.scheduledStart);
            return aptDate >= today && aptDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
          });

          // Compter les patients uniques
          const uniquePatients = new Set(appointmentsData.map(apt => apt.patient?.id).filter(Boolean));

          setStats({
            totalPatients: uniquePatients.size,
            appointmentsToday: appointmentsToday.length,
            unreadMessages: 0, // TODO: charger depuis l'API
            weekRevenue: '0€' // TODO: calculer depuis les rendez-vous
          });
        } catch (error) {
          console.error('Erreur lors du chargement des rendez-vous:', error);
          // Continuer même si les rendez-vous ne se chargent pas
        }
      } catch (error) {
        console.error('Erreur lors du chargement du dashboard:', error);
        // Si erreur d'authentification, rediriger
        if (error.response?.status === 401 || error.message?.includes('Session')) {
          navigate('/psy/login');
        } else {
          setLoading(false);
        }
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/psy/login');
  };

  const handleCreateAvailability = async () => {
    if (!newAvailability.date || !newAvailability.startTime || !newAvailability.endTime) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    setCreatingAvailability(true);
    try {
      await createAvailabilities(newAvailability);
      alert('✅ Disponibilités créées avec succès !');
      setNewAvailability({ date: '', startTime: '', endTime: '' });
      // Recharger les rendez-vous pour mettre à jour les stats
      const response = await getPsyAppointments();
      const appointmentsData = Array.isArray(response) ? response : (response.appointments || []);
      setAppointments(appointmentsData);
    } catch (error) {
      console.error('Erreur lors de la création des disponibilités:', error);
      alert('❌ Erreur : ' + (error.message || 'Impossible de créer les disponibilités'));
    } finally {
      setCreatingAvailability(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Filtrer les rendez-vous d'aujourd'hui
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayAppointments = appointments.filter(apt => {
    if (!apt.scheduledStart) return false;
    const aptDate = new Date(apt.scheduledStart);
    return aptDate >= today && aptDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
  }).sort((a, b) => new Date(a.scheduledStart) - new Date(b.scheduledStart));

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="mb-0">
            <i className="bi bi-briefcase me-2 text-success"></i>
            Espace Professionnel
          </h1>
          <p className="text-muted mb-0">
            Bienvenue, <strong>Dr. {user.profile?.firstName || user.pseudo || user.email.split('@')[0]}</strong>
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

      {/* Statistiques */}
      <div className="row mb-4">
        <div className="col-12 col-md-3 mb-3">
          <div className="card bg-gradient-primary text-white shadow">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-white-50 mb-1">Patients</h6>
                  <h2 className="mb-0">{stats.totalPatients}</h2>
                </div>
                <i className="bi bi-people" style={{fontSize: '3rem', opacity: 0.3}}></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-3 mb-3">
          <div className="card bg-gradient-success text-white shadow">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-white-50 mb-1">RDV Aujourd'hui</h6>
                  <h2 className="mb-0">{stats.appointmentsToday}</h2>
                </div>
                <i className="bi bi-calendar-check" style={{fontSize: '3rem', opacity: 0.3}}></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-3 mb-3">
          <div className="card bg-gradient-info text-white shadow">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-white-50 mb-1">Messages</h6>
                  <h2 className="mb-0">{stats.unreadMessages}</h2>
                </div>
                <i className="bi bi-envelope" style={{fontSize: '3rem', opacity: 0.3}}></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-3 mb-3">
          <div className="card bg-gradient-warning text-white shadow">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-white-50 mb-1">Revenus/Semaine</h6>
                  <h2 className="mb-0">{stats.weekRevenue}</h2>
                </div>
                <i className="bi bi-currency-euro" style={{fontSize: '3rem', opacity: 0.3}}></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gestion disponibilités */}
      <div className="row mb-4">
        <div className="col-12 col-lg-6 mb-4">
          <div className="card shadow">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">
                <i className="bi bi-calendar-week me-2"></i>
                Créer des disponibilités
              </h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label fw-bold">Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={newAvailability.date}
                  onChange={(e) => setNewAvailability({ ...newAvailability, date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label fw-bold">Heure de début</label>
                  <input
                    type="time"
                    className="form-control"
                    value={newAvailability.startTime}
                    onChange={(e) => setNewAvailability({ ...newAvailability, startTime: e.target.value })}
                    step="1800"
                  />
                </div>
                <div className="col-6">
                  <label className="form-label fw-bold">Heure de fin</label>
                  <input
                    type="time"
                    className="form-control"
                    value={newAvailability.endTime}
                    onChange={(e) => setNewAvailability({ ...newAvailability, endTime: e.target.value })}
                    step="1800"
                  />
                </div>
              </div>
              <button 
                className="btn btn-success w-100" 
                onClick={handleCreateAvailability}
                disabled={creatingAvailability}
              >
                {creatingAvailability ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Création...
                  </>
                ) : (
                  <>
                    <i className="bi bi-plus-circle me-2"></i>
                    Créer les créneaux
                  </>
                )}
              </button>
              <small className="text-muted d-block mt-2">
                Les créneaux seront découpés en slots de 30 minutes automatiquement
              </small>
            </div>
          </div>
        </div>

        {/* Rendez-vous du jour */}
        <div className="col-12 col-lg-6 mb-4">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="bi bi-clock me-2"></i>
                Rendez-vous aujourd'hui
              </h5>
            </div>
            <div className="card-body">
              {todayAppointments.length === 0 ? (
                <div className="text-center text-muted py-4">
                  <i className="bi bi-calendar-x" style={{fontSize: '3rem'}}></i>
                  <p className="mt-3">Aucun rendez-vous aujourd'hui</p>
                </div>
              ) : (
                <div className="list-group">
                  {todayAppointments.map(apt => (
                    <div key={apt.id} className="list-group-item">
                      <div className="d-flex justify-content-between">
                        <div>
                          <h6 className="mb-1">
                            <i className="bi bi-shield-lock text-success me-2"></i>
                            Patient {apt.patient?.pseudo || 'Anonyme'}
                          </h6>
                          <small className="text-muted">
                            {apt.type === 'ONLINE' ? 'Visio' : 'Cabinet'} • {apt.status}
                          </small>
                        </div>
                        <div className="text-end">
                          <div className="fw-bold">
                            {apt.scheduledStart ? new Date(apt.scheduledStart).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : 'N/A'}
                          </div>
                          {apt.type === 'ONLINE' && apt.meetingId && (
                            <Link to={`/visio?meeting=${apt.meetingId}`} className="btn btn-sm btn-success mt-1">
                              <i className="bi bi-camera-video"></i> Rejoindre
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Accès rapide */}
      <div className="row">
        <div className="col-12">
          <div className="card shadow">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-lightning-charge me-2"></i>
                Accès Rapide
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-6 col-md-3">
                  <Link to="/messages" className="text-decoration-none">
                    <div className="card text-center hover-shadow" style={{cursor: 'pointer'}}>
                      <div className="card-body">
                        <i className="bi bi-chat-dots text-info" style={{fontSize: '2.5rem'}}></i>
                        <p className="mt-2 mb-0 fw-bold">Messagerie E2EE</p>
                      </div>
                    </div>
                  </Link>
                </div>

                <div className="col-6 col-md-3">
                  <Link to="/appointments" className="text-decoration-none">
                    <div className="card text-center hover-shadow" style={{cursor: 'pointer'}}>
                      <div className="card-body">
                        <i className="bi bi-calendar-event text-primary" style={{fontSize: '2.5rem'}}></i>
                        <p className="mt-2 mb-0 fw-bold">Agenda</p>
                      </div>
                    </div>
                  </Link>
                </div>

                <div className="col-6 col-md-3">
                  <div className="card text-center hover-shadow" style={{cursor: 'pointer'}}>
                    <div className="card-body">
                      <i className="bi bi-folder text-warning" style={{fontSize: '2.5rem'}}></i>
                      <p className="mt-2 mb-0 fw-bold">Dossiers Chiffrés</p>
                    </div>
                  </div>
                </div>

                <div className="col-6 col-md-3">
                  <div className="card text-center hover-shadow" style={{cursor: 'pointer'}}>
                    <div className="card-body">
                      <i className="bi bi-graph-up text-success" style={{fontSize: '2.5rem'}}></i>
                      <p className="mt-2 mb-0 fw-bold">Statistiques</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bandeau sécurité */}
      <div className="alert alert-success shadow mt-4">
        <div className="d-flex align-items-center">
          <i className="bi bi-shield-fill-check me-3" style={{fontSize: '2rem'}}></i>
          <div>
            <strong>Vos données sont protégées</strong>
            <p className="mb-0 small">
              Chiffrement AES-256 • Argon2id 64MB • Zero-Knowledge • 
              Le serveur ne peut jamais lire vos informations professionnelles
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

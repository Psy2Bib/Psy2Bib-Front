import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { clearEncryptionKey, hasEncryptionKey } from '../../utils/crypto';
import { getPsyAppointments, createAvailability, getAvailabilities } from '../../utils/api';

export default function PsyDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Formulaire d'ajout simplifié (Date + Heure)
  const [newSlot, setNewSlot] = useState({ date: '', time: '' });
  
  const [stats, setStats] = useState({
    totalPatients: 0,
    appointmentsToday: 0,
    unreadMessages: 0,
    weekRevenue: '0€'
  });

  useEffect(() => {
    loadDashboardData();
  }, [navigate]);

  const loadDashboardData = async () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    // Pour le Psy, on ne vérifie pas hasEncryptionKey() car son profil est public/non chiffré ZK
    if (!currentUser.email || (currentUser.role?.toUpperCase() !== 'PSY' && currentUser.role?.toUpperCase() !== 'PSYCHOLOGIST')) {
      navigate('/psy/login');
      return;
    }
    
    if (!currentUser.id) {
      console.error("Dashboard: currentUser.id est manquant !", currentUser);
      return;
    }
    console.log("PsyDashboard: Connected User ID:", currentUser.id);

    setUser(currentUser);

    try {
      // 1. Charger les RDV
      const apptsData = await getPsyAppointments();
      const apptsList = Array.isArray(apptsData) ? apptsData : (apptsData.appointments || []);
      setAppointments(apptsList);

      // 2. Charger les dispos
      const availsData = await getAvailabilities(currentUser.id);
      // L'API retourne { psyId, slots: [...] }
      const availsList = availsData.slots || (Array.isArray(availsData) ? availsData : []);
      setAvailability(availsList);

      // 3. Calculs Stats
      const uniquePatients = new Set(apptsList.map(a => a.patient?.id)).size;
      
      const today = new Date().toDateString();
      const todayAppts = apptsList.filter(a => new Date(a.date).toDateString() === today);
      
      
      setStats({
        totalPatients: uniquePatients,
        appointmentsToday: todayAppts.length,
        unreadMessages: 0, // TODO
        weekRevenue: 'N/A' // TODO Paiement
      });

    } catch (err) {
      console.error("Erreur dashboard psy:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearEncryptionKey();
    localStorage.removeItem('currentUser');
    navigate('/psy/login');
  };

  const handleAddSlot = async () => {
    if (!newSlot.date || !newSlot.time) {
      alert('Veuillez sélectionner une date et une heure');
      return;
    }

    try {

      
      await createAvailability(
        newSlot.date, 
        newSlot.time, 
        incrementTime(newSlot.time, 1), // +1h par défaut
        true // isRemote par défaut
      );
      
      alert('Créneau ajouté avec succès !');
      setNewSlot({ date: '', time: '' });
      loadDashboardData(); // Recharger
    } catch (err) {
      alert('Erreur ajout créneau: ' + err.message);
    }
  };

  // Helper pour ajouter 1h (format HH:mm)
  const incrementTime = (time, hours) => {
    const [h, m] = time.split(':').map(Number);
    const newH = (h + hours) % 24;
    return `${newH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  // Helper affichage RDV
  const getAppointmentsForToday = () => {
    const today = new Date().toDateString();
    return appointments.filter(a => new Date(a.date).toDateString() === today);
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
            <i className="bi bi-briefcase me-2 text-success"></i>
            Espace Professionnel
          </h1>
          <p className="text-muted mb-0">
            Bienvenue, <strong>Dr. {user.profile?.firstName || user.email?.split('@')[0]}</strong>
            <span className="badge bg-success ms-2">
              <i className="bi bi-shield-check me-1"></i>
              E2EE Actif
            </span>
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
                  <h6 className="text-white-50 mb-1">Patients Uniques</h6>
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
                  <h6 className="text-white-50 mb-1">Revenus</h6>
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
          <div className="card shadow h-100">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">
                <i className="bi bi-calendar-week me-2"></i>
                Ajouter une disponibilité
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-bold">Date</label>
                  <input 
                    type="date" 
                    className="form-control"
                    value={newSlot.date}
                    onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">Heure (Début)</label>
                  <select
                    className="form-select"
                    value={newSlot.time}
                    onChange={(e) => setNewSlot({ ...newSlot, time: e.target.value })}
                  >
                    <option value="">Choisir...</option>
                    <option value="08:00">08:00</option>
                    <option value="09:00">09:00</option>
                    <option value="10:00">10:00</option>
                    <option value="11:00">11:00</option>
                    <option value="13:00">13:00</option>
                    <option value="14:00">14:00</option>
                    <option value="15:00">15:00</option>
                    <option value="16:00">16:00</option>
                    <option value="17:00">17:00</option>
                    <option value="18:00">18:00</option>
                  </select>
                  <div className="form-text text-muted small mt-1">Durée auto: 1h</div>
                </div>
              </div>
              <button className="btn btn-success w-100 mb-3" onClick={handleAddSlot}>
                <i className="bi bi-plus-circle me-2"></i>
                Publier le créneau
              </button>

              <h6 className="border-bottom pb-2 mb-3">Mes créneaux LIBRES (futurs)</h6>
              <div className="list-group" style={{maxHeight: '250px', overflowY: 'auto'}}>
                {availability.length === 0 ? (
                  <div className="text-center text-muted py-3">
                    <i className="bi bi-calendar-x" style={{fontSize: '2rem'}}></i>
                    <p className="mt-2">Aucun créneau libre public trouvé.</p>
                  </div>
                ) : (
                  availability.map((slot, idx) => (
                    <div key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{new Date(slot.start).toLocaleDateString()}</strong> <br/>
                        {new Date(slot.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(slot.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <span className="badge bg-success">Libre</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Rendez-vous du jour */}
        <div className="col-12 col-lg-6 mb-4">
          <div className="card shadow h-100">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="bi bi-clock me-2"></i>
                Rendez-vous aujourd'hui
              </h5>
            </div>
            <div className="card-body">
              <div className="list-group">
                {getAppointmentsForToday().length > 0 ? (
                  getAppointmentsForToday().map(apt => (
                    <div key={apt.id} className="list-group-item">
                      <div className="d-flex justify-content-between">
                        <div>
                          <h6 className="mb-1">
                            <i className="bi bi-person-fill text-primary me-2"></i>
                            {apt.patient ? `${apt.patient.firstName} ${apt.patient.lastName}` : 'Patient Anonyme'}
                          </h6>
                          <small className="text-muted">
                            {apt.type === 'ONLINE' ? 'Visio' : 'Cabinet'}
                          </small>
                        </div>
                        <div className="text-end">
                          <div className="fw-bold">
                            {new Date(apt.date).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}
                          </div>
                          <button 
                            className="btn btn-sm btn-success mt-1"
                            onClick={() => navigate('/visio', { state: { appointment: apt } })}
                          >
                            <i className="bi bi-camera-video"></i> Rejoindre
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted py-5">
                    <i className="bi bi-calendar-check" style={{fontSize: '2rem'}}></i>
                    <p className="mt-3">Aucun rendez-vous prévu aujourd'hui.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accès rapide */}
      <div className="row">
        <div className="col-12">
          <div className="card shadow">
            <div className="card-header">
              <h5 className="mb-0">Accès Rapide</h5>
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
                        <p className="mt-2 mb-0 fw-bold">Agenda Complet</p>
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
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { clearEncryptionKey, hasEncryptionKey } from '../../utils/crypto';

export default function PsyDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [newSlot, setNewSlot] = useState({ day: '', time: '' });
  const [stats] = useState({
    totalPatients: 15,
    appointmentsToday: 3,
    unreadMessages: 5,
    weekRevenue: '1200€'
  });

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!currentUser.email || currentUser.role !== 'psy' || !hasEncryptionKey()) {
      navigate('/psy/login');
      return;
    }
    setUser(currentUser);

    const savedAvailability = JSON.parse(localStorage.getItem('psy_availability') || '[]');
    setAvailability(savedAvailability);
  }, [navigate]);

  const handleLogout = () => {
    clearEncryptionKey();
    localStorage.removeItem('currentUser');
    navigate('/psy/login');
  };

  const handleAddSlot = () => {
    if (!newSlot.day || !newSlot.time) {
      alert('Veuillez sélectionner un jour et une heure');
      return;
    }

    const slot = {
      id: Date.now(),
      day: newSlot.day,
      time: newSlot.time,
      available: true
    };

    const updated = [...availability, slot];
    setAvailability(updated);
    localStorage.setItem('psy_availability', JSON.stringify(updated));
    setNewSlot({ day: '', time: '' });
  };

  const handleRemoveSlot = (id) => {
    const updated = availability.filter(slot => slot.id !== id);
    setAvailability(updated);
    localStorage.setItem('psy_availability', JSON.stringify(updated));
  };

  const toggleSlotAvailability = (id) => {
    const updated = availability.map(slot =>
      slot.id === id ? { ...slot, available: !slot.available } : slot
    );
    setAvailability(updated);
    localStorage.setItem('psy_availability', JSON.stringify(updated));
  };

  if (!user) return null;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="mb-0">
            <i className="bi bi-briefcase me-2 text-success"></i>
            Espace Professionnel
          </h1>
          <p className="text-muted mb-0">
            Bienvenue, <strong>Dr. {user.profile?.firstName || user.email.split('@')[0]}</strong>
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
                Gérer mes disponibilités
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <select
                    className="form-select"
                    value={newSlot.day}
                    onChange={(e) => setNewSlot({ ...newSlot, day: e.target.value })}
                  >
                    <option value="">Jour</option>
                    <option value="Lundi">Lundi</option>
                    <option value="Mardi">Mardi</option>
                    <option value="Mercredi">Mercredi</option>
                    <option value="Jeudi">Jeudi</option>
                    <option value="Vendredi">Vendredi</option>
                    <option value="Samedi">Samedi</option>
                  </select>
                </div>
                <div className="col-6">
                  <select
                    className="form-select"
                    value={newSlot.time}
                    onChange={(e) => setNewSlot({ ...newSlot, time: e.target.value })}
                  >
                    <option value="">Heure</option>
                    <option value="09:00">09:00</option>
                    <option value="10:00">10:00</option>
                    <option value="11:00">11:00</option>
                    <option value="14:00">14:00</option>
                    <option value="15:00">15:00</option>
                    <option value="16:00">16:00</option>
                    <option value="17:00">17:00</option>
                  </select>
                </div>
              </div>
              <button className="btn btn-success w-100 mb-3" onClick={handleAddSlot}>
                <i className="bi bi-plus-circle me-2"></i>
                Ajouter un créneau
              </button>

              <div className="list-group">
                {availability.length === 0 ? (
                  <div className="text-center text-muted py-3">
                    <i className="bi bi-calendar-x" style={{fontSize: '2rem'}}></i>
                    <p className="mt-2">Aucun créneau défini</p>
                  </div>
                ) : (
                  availability.map(slot => (
                    <div key={slot.id} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{slot.day}</strong> à {slot.time}
                        <span className={`ms-2 badge ${slot.available ? 'bg-success' : 'bg-secondary'}`}>
                          {slot.available ? 'Disponible' : 'Occupé'}
                        </span>
                      </div>
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-primary"
                          onClick={() => toggleSlotAvailability(slot.id)}
                        >
                          <i className="bi bi-toggle-on"></i>
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          onClick={() => handleRemoveSlot(slot.id)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
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
              <div className="list-group">
                <div className="list-group-item">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6 className="mb-1">
                        <i className="bi bi-shield-lock text-success me-2"></i>
                        Patient A. (Anonyme)
                      </h6>
                      <small className="text-muted">Première consultation</small>
                    </div>
                    <div className="text-end">
                      <div className="fw-bold">10:00</div>
                      <Link to="/visio" className="btn btn-sm btn-success mt-1">
                        <i className="bi bi-camera-video"></i> Rejoindre
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="list-group-item">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6 className="mb-1">
                        <i className="bi bi-shield-lock text-success me-2"></i>
                        Patient B. (Anonyme)
                      </h6>
                      <small className="text-muted">Suivi mensuel</small>
                    </div>
                    <div className="text-end">
                      <div className="fw-bold">14:00</div>
                      <button className="btn btn-sm btn-outline-secondary mt-1" disabled>
                        <i className="bi bi-camera-video"></i> À venir
                      </button>
                    </div>
                  </div>
                </div>

                <div className="list-group-item">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6 className="mb-1">
                        <i className="bi bi-shield-lock text-success me-2"></i>
                        Patient C. (Anonyme)
                      </h6>
                      <small className="text-muted">Thérapie familiale</small>
                    </div>
                    <div className="text-end">
                      <div className="fw-bold">16:00</div>
                      <button className="btn btn-sm btn-outline-secondary mt-1" disabled>
                        <i className="bi bi-camera-video"></i> À venir
                      </button>
                    </div>
                  </div>
                </div>
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
    </div>
  );
}
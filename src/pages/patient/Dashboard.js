import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function PatientDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    nextAppointment: null,
    unreadMessages: 3
  });

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!currentUser.email || currentUser.role !== 'patient') {
      navigate('/patient/login');
      return;
    }
    setUser(currentUser);

    const savedAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    setAppointments(savedAppointments);
    
    const upcoming = savedAppointments.filter(apt => new Date(apt.date) >= new Date());
    setStats({
      totalAppointments: savedAppointments.length,
      nextAppointment: upcoming[0] || null,
      unreadMessages: 3
    });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/patient/login');
  };

  if (!user) return null;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="mb-0">Tableau de bord Patient</h1>
          <p className="text-muted">Bienvenue, {user.email}</p>
        </div>
        <button className="btn btn-outline-danger" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right me-2"></i>
          Déconnexion
        </button>
      </div>

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

      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow">
            <div className="card-header">
              <h5 className="mb-0">Accès Rapide</h5>
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
                        <p className="mt-2 mb-0 fw-bold">Visio</p>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
                  <h5 className="mb-3">{stats.nextAppointment.psychologist}</h5>
                  <p className="mb-2">
                    <i className="bi bi-bookmark me-2 text-muted"></i>
                    {stats.nextAppointment.specialty}
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
                    {stats.nextAppointment.time}
                  </p>
                  <Link to="/visio" className="btn btn-success w-100">
                    <i className="bi bi-camera-video me-2"></i>
                    Rejoindre la consultation
                  </Link>
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
                  <p className="mb-0">Consultation avec Dr. Martin</p>
                </div>
                <div className="list-group-item">
                  <small className="text-muted">Il y a 5 jours</small>
                  <p className="mb-0">Message envoyé à Dr. Dupont</p>
                </div>
                <div className="list-group-item">
                  <small className="text-muted">Il y a 1 semaine</small>
                  <p className="mb-0">Rendez-vous réservé</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
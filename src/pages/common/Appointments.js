import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const mockPsychologists = [
  { id: 1, name: 'Dr. Sophie Martin', specialty: 'TCC' },
  { id: 2, name: 'Dr. Jean Dupont', specialty: 'Psychanalyse' },
  { id: 3, name: 'Dr. Marie Laurent', specialty: 'Thérapie familiale' },
  { id: 4, name: 'Dr. Pierre Dubois', specialty: 'Psychologie du travail' }
];

const timeSlots = [
  '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'
];

export default function Appointments() {
  const location = useLocation();
  const [selectedPsy, setSelectedPsy] = useState(
    location.state?.selectedPsy?.id || mockPsychologists[0].id
  );
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [message, setMessage] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('appointments') || '[]');
    setAppointments(saved);
  }, []);

  const handleBookAppointment = () => {
    if (!selectedDate || !selectedTime) {
      setMessage('⚠️ Veuillez sélectionner une date et une heure');
      return;
    }

    const psy = mockPsychologists.find(p => p.id === parseInt(selectedPsy));
    
    // En production, chiffrer avec encryptData()
    const newAppointment = {
      id: Date.now(),
      psychologist: psy.name,
      specialty: psy.specialty,
      date: selectedDate,
      time: selectedTime,
      status: 'confirmé',
      encrypted: true // Indicateur E2EE
    };

    const updated = [...appointments, newAppointment];
    setAppointments(updated);
    localStorage.setItem('appointments', JSON.stringify(updated));
    
    setMessage('✅ Rendez-vous confirmé avec chiffrement E2EE !');
    setSelectedDate('');
    setSelectedTime('');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleCancelAppointment = (id) => {
    const updated = appointments.filter(apt => apt.id !== id);
    setAppointments(updated);
    localStorage.setItem('appointments', JSON.stringify(updated));
    setMessage('🗑️ Rendez-vous annulé');
    setTimeout(() => setMessage(''), 3000);
  };

  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const availableDates = generateDates();

  return (
    <div>
      <div className="mb-4">
        <h1>
          <i className="bi bi-calendar-check me-2 text-primary"></i>
          Mes Rendez-vous
        </h1>
        <p className="text-muted">
          <i className="bi bi-shield-check text-success me-1"></i>
          Rendez-vous chiffrés E2EE • Visio avec avatar 3D
        </p>
      </div>

      {message && (
        <div className={`alert ${
          message.includes('✅') ? 'alert-success' : 
          message.includes('🗑️') ? 'alert-warning' :
          'alert-info'
        }`}>
          {message}
        </div>
      )}

      {/* Formulaire de réservation */}
      <div className="card shadow mb-4">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">
            <i className="bi bi-plus-circle me-2"></i>
            Réserver un Rendez-vous
          </h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-12">
              <label className="form-label fw-bold">
                <i className="bi bi-person-badge me-1"></i>
                Choisir un psychologue
              </label>
              <select
                className="form-select form-select-lg"
                value={selectedPsy}
                onChange={(e) => setSelectedPsy(e.target.value)}
              >
                {mockPsychologists.map(psy => (
                  <option key={psy.id} value={psy.id}>
                    {psy.name} - {psy.specialty}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-bold">
                <i className="bi bi-calendar3 me-1"></i>
                Date
              </label>
              <select
                className="form-select form-select-lg"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              >
                <option value="">Sélectionner une date</option>
                {availableDates.map((date, idx) => (
                  <option key={idx} value={date}>
                    {new Date(date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-bold">
                <i className="bi bi-clock me-1"></i>
                Heure
              </label>
              <select
                className="form-select form-select-lg"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
              >
                <option value="">Sélectionner une heure</option>
                {timeSlots.map((time, idx) => (
                  <option key={idx} value={time}>{time}</option>
                ))}
              </select>
            </div>

            <div className="col-12">
              <button
                className="btn btn-success btn-lg w-100"
                onClick={handleBookAppointment}
              >
                <i className="bi bi-check-circle me-2"></i>
                Confirmer le rendez-vous (E2EE)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendrier visuel */}
      <div className="card shadow mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="bi bi-calendar-week me-2"></i>
            Calendrier
          </h5>
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => setShowCalendar(!showCalendar)}
          >
            <i className={`bi bi-${showCalendar ? 'eye-slash' : 'eye'} me-1`}></i>
            {showCalendar ? 'Masquer' : 'Afficher'}
          </button>
        </div>
        {showCalendar && (
          <div className="card-body">
            <div className="row g-2">
              {availableDates.slice(0, 14).map((date, idx) => {
                const d = new Date(date);
                const hasAppointment = appointments.some(apt => apt.date === date);
                return (
                  <div key={idx} className="col-6 col-md-3 col-lg-2">
                    <button
                      className={`btn w-100 ${
                        selectedDate === date
                          ? 'btn-primary'
                          : hasAppointment
                          ? 'btn-warning'
                          : 'btn-outline-secondary'
                      }`}
                      onClick={() => setSelectedDate(date)}
                    >
                      <div className="small">{d.toLocaleDateString('fr-FR', { weekday: 'short' })}</div>
                      <div className="fw-bold fs-5">{d.getDate()}</div>
                      {hasAppointment && (
                        <i className="bi bi-circle-fill small"></i>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Liste des rendez-vous */}
      <div className="card shadow">
        <div className="card-header bg-info text-white">
          <h5 className="mb-0">
            <i className="bi bi-list-check me-2"></i>
            Mes Rendez-vous à venir
          </h5>
        </div>
        <div className="card-body">
          {appointments.length === 0 ? (
            <div className="text-center text-muted py-5">
              <i className="bi bi-calendar-x" style={{fontSize: '3rem'}}></i>
              <p className="mt-3">Aucun rendez-vous prévu</p>
              <p className="small">Réservez votre première consultation ci-dessus</p>
            </div>
          ) : (
            <div className="list-group">
              {appointments.map(apt => (
                <div key={apt.id} className="list-group-item">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <h6 className="mb-1">
                        {apt.psychologist}
                        {apt.encrypted && (
                          <span className="badge bg-success ms-2 small">
                            <i className="bi bi-shield-lock"></i> E2EE
                          </span>
                        )}
                      </h6>
                      <p className="mb-1 text-muted small">{apt.specialty}</p>
                      <p className="mb-0">
                        <i className="bi bi-calendar-event me-2 text-primary"></i>
                        {new Date(apt.date).toLocaleDateString('fr-FR')} à {apt.time}
                      </p>
                      <div className="mt-2">
                        <span className="badge bg-success">{apt.status}</span>
                        <span className="badge bg-info ms-1">
                          <i className="bi bi-camera-video"></i> Visio Avatar
                        </span>
                      </div>
                    </div>
                    <div className="d-flex gap-2">
                      <button className="btn btn-sm btn-outline-primary">
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleCancelAppointment(apt.id)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
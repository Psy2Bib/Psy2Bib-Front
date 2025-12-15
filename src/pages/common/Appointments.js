import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getMyAppointments, searchAvailabilities, bookAppointment, cancelAppointment, searchPsychologists } from '../../utils/api';
import { isAuthenticated } from '../../utils/auth';

export default function Appointments() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedPsyId, setSelectedPsyId] = useState(
    location.state?.selectedPsy?.id || location.state?.selectedPsy?.userId || null
  );
  const [psychologists, setPsychologists] = useState([]);
  const [availabilities, setAvailabilities] = useState([]);
  const [selectedAvailability, setSelectedAvailability] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/patient/login');
      return;
    }

    loadData();
  }, [navigate]);

  useEffect(() => {
    if (selectedPsyId) {
      loadAvailabilities();
    }
  }, [selectedPsyId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Charger les psychologues
      const psyData = await searchPsychologists();
      setPsychologists(psyData || []);
      
      // Charger les rendez-vous
      const appointmentsData = await getMyAppointments();
      setAppointments(appointmentsData.appointments || []);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      setMessage('❌ Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailabilities = async () => {
    try {
      const data = await searchAvailabilities({
        psyId: selectedPsyId,
        onlyAvailable: true,
        dateFrom: new Date().toISOString(),
      });
      setAvailabilities(data.slots || []);
    } catch (error) {
      console.error('Erreur lors du chargement des disponibilités:', error);
      setMessage('❌ Erreur lors du chargement des disponibilités');
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedAvailability) {
      setMessage('⚠️ Veuillez sélectionner un créneau');
      return;
    }

    setBooking(true);
    try {
      await bookAppointment({
        availabilityId: selectedAvailability.id,
        type: 'ONLINE', // 'ONLINE' ou 'IN_PERSON' (selon AppointmentType enum)
      });
      
      setMessage('✅ Rendez-vous réservé avec succès !');
      setSelectedAvailability(null);
      
      // Recharger les données
      await loadData();
      await loadAvailabilities();
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Erreur lors de la réservation:', error);
      if (error.response?.status === 409) {
        setMessage('❌ Ce créneau a déjà été réservé');
      } else {
        setMessage('❌ Erreur lors de la réservation: ' + (error.message || 'Erreur inconnue'));
      }
    } finally {
      setBooking(false);
    }
  };

  const handleCancelAppointment = async (id) => {
    try {
      await cancelAppointment(id);
      setMessage('🗑️ Rendez-vous annulé');
      await loadData();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error);
      setMessage('❌ Erreur lors de l\'annulation');
    }
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
                value={selectedPsyId || ''}
                onChange={(e) => setSelectedPsyId(e.target.value)}
              >
                <option value="">Sélectionner un psychologue</option>
                {psychologists.map(psy => (
                  <option key={psy.id || psy.userId} value={psy.id || psy.userId}>
                    {psy.pseudo || psy.title || 'Psychologue'}
                    {psy.specialties && psy.specialties.length > 0 && ` - ${psy.specialties.join(', ')}`}
                  </option>
                ))}
              </select>
            </div>

            {selectedPsyId && (
              <div className="col-md-12">
                <label className="form-label fw-bold">
                  <i className="bi bi-calendar-check me-1"></i>
                  Choisir un créneau disponible
                </label>
                {availabilities.length === 0 ? (
                  <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    Aucun créneau disponible pour ce psychologue
                  </div>
                ) : (
                  <select
                    className="form-select form-select-lg"
                    value={selectedAvailability?.id || ''}
                    onChange={(e) => {
                      const avail = availabilities.find(a => a.id === e.target.value);
                      setSelectedAvailability(avail);
                    }}
                  >
                    <option value="">Sélectionner un créneau</option>
                    {availabilities.map(avail => (
                      <option key={avail.id} value={avail.id}>
                        {new Date(avail.start).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })} de {new Date(avail.start).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })} à {new Date(avail.end).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            <div className="col-12">
              <button
                className="btn btn-success btn-lg w-100"
                onClick={handleBookAppointment}
                disabled={!selectedAvailability || booking}
              >
                {booking ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Réservation en cours...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>
                    Confirmer le rendez-vous (E2EE)
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
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
                        {apt.psy?.pseudo || 'Psychologue'}
                        <span className="badge bg-success ms-2 small">
                          <i className="bi bi-shield-lock"></i> E2EE
                        </span>
                      </h6>
                      <p className="mb-0">
                        <i className="bi bi-calendar-event me-2 text-primary"></i>
                        {new Date(apt.scheduledStart).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })} de {new Date(apt.scheduledStart).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })} à {new Date(apt.scheduledEnd).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <div className="mt-2">
                        <span className={`badge ${
                          apt.status === 'CONFIRMED' ? 'bg-success' :
                          apt.status === 'PENDING' ? 'bg-warning' :
                          apt.status === 'CANCELLED' ? 'bg-danger' :
                          'bg-secondary'
                        }`}>
                          {apt.status}
                        </span>
                        <span className="badge bg-info ms-1">
                          <i className="bi bi-camera-video"></i> {apt.type === 'ONLINE' ? 'Visio' : 'Cabinet'}
                        </span>
                      </div>
                    </div>
                    <div className="d-flex gap-2">
                      {apt.status !== 'CANCELLED' && (
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleCancelAppointment(apt.id)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
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
  );
}
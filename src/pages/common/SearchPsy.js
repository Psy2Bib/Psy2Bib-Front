import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchPsychologists } from '../../utils/api';
import { isAuthenticated } from '../../utils/auth';

export default function SearchPsy() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('all');
  const [psychologists, setPsychologists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPsychologists();
  }, []);

  const loadPsychologists = async () => {
    try {
      setLoading(true);
      const data = await searchPsychologists();
      setPsychologists(data || []);
    } catch (err) {
      console.error('Erreur lors du chargement des psychologues:', err);
      setError('Erreur lors du chargement des psychologues');
    } finally {
      setLoading(false);
    }
  };

  const filteredPsychologists = psychologists.filter(psy => {
    const matchesSearch = 
      (psy.pseudo?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      (psy.title?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      (psy.description?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      (psy.specialties?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())) || false);
    const matchesSpecialty = filterSpecialty === 'all' || 
      (psy.specialties?.includes(filterSpecialty) || false);
    return matchesSearch && matchesSpecialty;
  });

  const specialties = [...new Set(psychologists.flatMap(p => p.specialties || []))];

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <i className="bi bi-exclamation-triangle me-2"></i>
        {error}
      </div>
    );
  }

  // Mock data pour compatibilité (à supprimer une fois le backend complet)
  const mockPsychologists = [
  {
    id: 1,
    name: 'Dr. Sophie Martin',
    specialty: 'Thérapie cognitive-comportementale',
    location: 'Paris 15ème',
    price: '70€',
    rating: 4.8,
    image: 'https://i.pravatar.cc/150?img=47',
    disponible: true,
    experience: '12 ans',
    languages: ['Français', 'Anglais']
  },
  {
    id: 2,
    name: 'Dr. Jean Dupont',
    specialty: 'Psychanalyse',
    location: 'Paris 8ème',
    price: '80€',
    rating: 4.9,
    image: 'https://i.pravatar.cc/150?img=12',
    disponible: true,
    experience: '15 ans',
    languages: ['Français']
  },
  {
    id: 3,
    name: 'Dr. Marie Laurent',
    specialty: 'Thérapie familiale',
    location: 'Neuilly-sur-Seine',
    price: '75€',
    rating: 4.7,
    image: 'https://i.pravatar.cc/150?img=48',
    disponible: false,
    experience: '10 ans',
    languages: ['Français', 'Espagnol']
  },
  {
    id: 4,
    name: 'Dr. Pierre Dubois',
    specialty: 'Psychologie du travail',
    location: 'Paris 9ème',
    price: '65€',
    rating: 4.6,
    image: 'https://i.pravatar.cc/150?img=13',
    disponible: true,
    experience: '8 ans',
    languages: ['Français']
  },
  {
    id: 5,
    name: 'Dr. Claire Moreau',
    specialty: 'Thérapie cognitive-comportementale',
    location: 'Paris 11ème',
    price: '70€',
    rating: 4.9,
    image: 'https://i.pravatar.cc/150?img=49',
    disponible: true,
    experience: '14 ans',
    languages: ['Français', 'Anglais', 'Allemand']
  },
  {
    id: 6,
    name: 'Dr. Thomas Blanc',
    specialty: 'Psychologie clinique',
    location: 'Paris 17ème',
    price: '75€',
    rating: 4.5,
    image: 'https://i.pravatar.cc/150?img=14',
    disponible: true,
    experience: '11 ans',
    languages: ['Français', 'Italien']
  }
];


  return (
    <div>
      <div className="mb-4">
        <h1>
          <i className="bi bi-search me-2 text-primary"></i>
          Trouver un Psychologue
        </h1>
        <p className="text-muted">
          Tous nos psychologues sont certifiés et respectent la confidentialité Zero-Knowledge
        </p>
      </div>
      
      {/* Filtres de recherche */}
      <div className="card shadow mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-8">
              <label className="form-label fw-bold small">
                <i className="bi bi-search me-1"></i>
                Recherche
              </label>
              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="Rechercher par nom, spécialité ou localisation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-bold small">
                <i className="bi bi-funnel me-1"></i>
                Spécialité
              </label>
              <select
                className="form-select form-select-lg"
                value={filterSpecialty}
                onChange={(e) => setFilterSpecialty(e.target.value)}
              >
                <option value="all">Toutes les spécialités</option>
                {specialties.map((spec, idx) => (
                  <option key={idx} value={spec}>{spec}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Résultats */}
      <div className="mb-3">
        <span className="text-muted">
          <i className="bi bi-person-check me-1"></i>
          {filteredPsychologists.length} psychologue(s) trouvé(s)
        </span>
      </div>

      {/* Liste des psychologues */}
      <div className="row">
        {filteredPsychologists.length > 0 ? filteredPsychologists.map(psy => (
          <div key={psy.id || psy.userId} className="col-12 col-md-6 col-lg-4 mb-4">
            <div className="card shadow-sm h-100 hover-shadow">
              <div className="card-body">
                <div className="d-flex align-items-center mb-3">
                  <div className="rounded-circle me-3 bg-primary text-white d-flex align-items-center justify-content-center"
                    style={{width: '60px', height: '60px', fontSize: '1.5rem'}}>
                    <i className="bi bi-person-badge"></i>
                  </div>
                  <div className="flex-grow-1">
                    <h5 className="mb-0">{psy.pseudo || psy.title || 'Psychologue'}</h5>
                    {psy.isVisible && (
                      <span className="badge bg-success small">Disponible</span>
                    )}
                  </div>
                </div>
                
                {psy.specialties && psy.specialties.length > 0 && (
                  <p className="text-muted mb-2">
                    <i className="bi bi-bookmark-fill me-2 text-primary"></i>
                    <strong>{psy.specialties.join(', ')}</strong>
                  </p>
                )}
                
                {psy.description && (
                  <p className="text-muted mb-2 small">
                    {psy.description.substring(0, 100)}...
                  </p>
                )}
                
                {psy.languages && psy.languages.length > 0 && (
                  <p className="text-muted mb-3 small">
                    <i className="bi bi-translate me-2 text-success"></i>
                    {psy.languages.join(', ')}
                  </p>
                )}
                
                {psy.hourlyRate && (
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <span className="text-primary fw-bold fs-5">
                      <i className="bi bi-currency-euro me-1"></i>
                      {psy.hourlyRate}€
                    </span>
                    <span className="small text-muted">/ heure</span>
                  </div>
                )}

                <div className="d-flex gap-2">
                  {psy.isVisible ? (
                    <>
                      <button
                        className="btn btn-primary btn-sm flex-grow-1"
                        onClick={() => {
                          if (!isAuthenticated()) {
                            navigate('/patient/login');
                          } else {
                            navigate('/appointments', { state: { selectedPsy: psy } });
                          }
                        }}
                      >
                        <i className="bi bi-calendar-plus me-1"></i>
                        Prendre RDV
                      </button>
                      <button className="btn btn-outline-secondary btn-sm">
                        <i className="bi bi-info-circle"></i>
                      </button>
                    </>
                  ) : (
                    <button className="btn btn-secondary btn-sm w-100" disabled>
                      <i className="bi bi-x-circle me-1"></i>
                      Non disponible
                    </button>
                  )}
                </div>

                <div className="mt-3 pt-3 border-top">
                  <div className="d-flex gap-1">
                    <span className="badge bg-success small">
                      <i className="bi bi-shield-check"></i> E2EE
                    </span>
                    <span className="badge bg-info small">
                      <i className="bi bi-camera-video"></i> Visio Avatar
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-12">
            <div className="alert alert-info text-center">
              <i className="bi bi-search me-2"></i>
              Aucun psychologue trouvé pour votre recherche.
            </div>
          </div>
        )}
      </div>

      {filteredPsychologists.length === 0 && psychologists.length > 0 && (
        <div className="alert alert-info text-center">
          <i className="bi bi-search me-2"></i>
          Aucun psychologue trouvé pour votre recherche.
        </div>
      )}

      {/* Informations */}
      <div className="card shadow mt-4">
        <div className="card-body">
          <h5 className="mb-3">
            <i className="bi bi-shield-lock-fill text-success me-2"></i>
            Confidentialité garantie
          </h5>
          <p className="text-muted mb-0">
            Toutes les consultations sont protégées par chiffrement Zero-Knowledge. 
            Vos échanges avec votre psychologue restent strictement confidentiels et 
            le serveur ne peut jamais y accéder.
          </p>
        </div>
      </div>
    </div>
  );
}
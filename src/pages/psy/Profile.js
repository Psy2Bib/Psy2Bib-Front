import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { updatePsyProfile, getMyPsyProfile } from '../../utils/api';
import { hasEncryptionKey } from '../../utils/crypto';

export default function PsyProfile() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    specialties: '',
    languages: '',
    hourlyRate: '',
    isVisible: true
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [navigate]);

  const loadProfile = async () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!currentUser.email || !hasEncryptionKey()) {
      navigate('/psy/login');
      return;
    }

    try {
      const profile = await getMyPsyProfile();
      if (profile) {
        setFormData({
          title: profile.title || '',
          description: profile.description || '',
          specialties: (profile.specialties || []).join(', '),
          languages: (profile.languages || []).join(', '),
          hourlyRate: profile.hourlyRate || '',
          isVisible: profile.isVisible ?? true
        });
      }
    } catch (err) {
      console.error('Erreur chargement profil:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        specialties: formData.specialties.split(',').map(s => s.trim()).filter(Boolean),
        languages: formData.languages.split(',').map(s => s.trim()).filter(Boolean),
        hourlyRate: Number(formData.hourlyRate) || 0,
        isVisible: formData.isVisible
      };

      await updatePsyProfile(payload);
      
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      // On met à jour le profil local pour l'affichage immédiat dans la topbar ou autre
      // Note: le backend gère User + PsychologistProfile, ici on merge
      currentUser.profile = { ...currentUser.profile, ...payload };
      localStorage.setItem('currentUser', JSON.stringify(currentUser));

      alert('Profil public mis à jour !');
      navigate('/psy/dashboard');
    } catch (err) {
      console.error(err);
      alert('Erreur: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="card shadow-lg">
            <div className="card-header bg-success text-white p-4">
              <h2 className="mb-1"><i className="bi bi-person-badge me-2"></i> Mon Profil Public</h2>
              <p className="mb-0 opacity-75">
                Ces informations seront visibles par les patients lors de la recherche.
              </p>
            </div>
            <div className="card-body p-4">
              
              <div className="mb-3">
                <label className="form-label fw-bold">Titre Professionnel</label>
                <input 
                  type="text" 
                  className="form-control" 
                  name="title" 
                  value={formData.title} 
                  onChange={handleChange}
                  placeholder="Ex: Psychologue Clinicien, Neuropsychologue..."
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">Description / Bio</label>
                <textarea 
                  className="form-control" 
                  name="description" 
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Présentez votre approche, votre parcours..."
                ></textarea>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-bold">Spécialités (séparées par virgules)</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    name="specialties" 
                    value={formData.specialties} 
                    onChange={handleChange}
                    placeholder="Ex: TCC, Anxiété, Dépression"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Langues parlées</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    name="languages" 
                    value={formData.languages} 
                    onChange={handleChange}
                    placeholder="Ex: Français, Anglais"
                  />
                </div>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label fw-bold">Tarif horaire (€)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    name="hourlyRate" 
                    value={formData.hourlyRate} 
                    onChange={handleChange}
                    placeholder="Ex: 60"
                  />
                </div>
                <div className="col-md-6 d-flex align-items-center pt-4">
                  <div className="form-check form-switch">
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      id="isVisibleSwitch"
                      name="isVisible"
                      checked={formData.isVisible}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="isVisibleSwitch">
                      Profil visible dans la recherche
                    </label>
                  </div>
                </div>
              </div>

              <div className="d-grid">
                <button 
                  className="btn btn-success btn-lg" 
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm"></span>
                  ) : (
                    <span><i className="bi bi-save me-2"></i>Enregistrer le profil</span>
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { encryptData, getEncryptionKey, hasEncryptionKey } from '../../utils/crypto';
import { updatePatientProfile } from '../../utils/api';

export default function PatientOnboarding() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    profession: '',
    goals: '',
    history: '',
    treatment: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!currentUser.email || !hasEncryptionKey()) {
      navigate('/patient/login');
      return;
    }

    // Pré-remplir le formulaire avec les données existantes du profil déchiffré
    if (currentUser.profile) {
      setFormData(prev => ({
        ...prev,
        age: currentUser.profile.age || '',
        gender: currentUser.profile.gender || '',
        profession: currentUser.profile.profession || '',
        goals: currentUser.profile.goals || '',
        history: currentUser.profile.history || '',
        treatment: currentUser.profile.treatment || ''
      }));
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!formData.age || !formData.goals) {
      alert('Veuillez remplir au moins l\'âge et vos objectifs.');
      return;
    }

    setLoading(true);
    try {
      const key = getEncryptionKey();
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      // Fusionner avec le profil existant
      const newProfile = {
        ...currentUser.profile,
        ...formData,
        onboardingCompleted: true,
        lastUpdated: new Date().toISOString()
      };

      console.log('Chiffrement du profil enrichi...', newProfile);

      // Chiffrement ZK
      const encryptedProfile = await encryptData(newProfile, key);

      // Envoi au back
      await updatePatientProfile({ encryptedProfile });

      // Mise à jour locale
      currentUser.profile = newProfile;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));

      alert('Profil mis à jour avec succès !');
      navigate('/patient/dashboard');
    } catch (err) {
      console.error('Erreur onboarding:', err);
      alert('Erreur lors de la sauvegarde sécurisée: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="card shadow-lg">
            <div className="card-header bg-primary text-white p-4">
              <h2 className="mb-1"><i className="bi bi-person-lines-fill me-2"></i> Compléter mon profil</h2>
              <p className="mb-0 opacity-75">
                Ces informations sont <strong>chiffrées de bout en bout</strong> (Zero-Knowledge). 
                Seul vous et votre psychologue (si vous l'autorisez) pourrez les lire.
              </p>
            </div>
            <div className="card-body p-4">
              
              <div className="row g-3 mb-4">
                <div className="col-md-4">
                  <label className="form-label fw-bold">Âge</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    name="age" 
                    value={formData.age} 
                    onChange={handleChange}
                    placeholder="Ex: 30"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-bold">Genre</label>
                  <select 
                    className="form-select" 
                    name="gender" 
                    value={formData.gender} 
                    onChange={handleChange}
                  >
                    <option value="">Choisir...</option>
                    <option value="Homme">Homme</option>
                    <option value="Femme">Femme</option>
                    <option value="Autre">Autre</option>
                    <option value="Non précisé">Je préfère ne pas dire</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-bold">Profession</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    name="profession" 
                    value={formData.profession} 
                    onChange={handleChange}
                    placeholder="Ex: Enseignant"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-bold">Quels sont vos objectifs principaux ?</label>
                <textarea 
                  className="form-control" 
                  name="goals" 
                  rows="3"
                  value={formData.goals}
                  onChange={handleChange}
                  placeholder="Ex: Gérer mon stress au travail, améliorer mon sommeil..."
                ></textarea>
              </div>

              <div className="mb-4">
                <label className="form-label fw-bold">Antécédents médicaux / psychologiques (Optionnel)</label>
                <textarea 
                  className="form-control" 
                  name="history" 
                  rows="3"
                  value={formData.history}
                  onChange={handleChange}
                  placeholder="Avez-vous déjà consulté ? Avez-vous des antécédents notables ?"
                ></textarea>
              </div>

              <div className="mb-4">
                <label className="form-label fw-bold">Traitement en cours (Optionnel)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  name="treatment" 
                  value={formData.treatment}
                  onChange={handleChange}
                  placeholder="Ex: Aucun"
                />
              </div>

              <div className="d-grid">
                <button 
                  className="btn btn-success btn-lg" 
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <span><span className="spinner-border spinner-border-sm me-2"></span>Chiffrement et Envoi...</span>
                  ) : (
                    <span><i className="bi bi-lock-fill me-2"></i>Enregistrer et Chiffrer</span>
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


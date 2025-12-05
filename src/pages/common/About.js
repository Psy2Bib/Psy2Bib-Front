import React from 'react';

export default function About() {
  return (
    <div className="row">
      <div className="col-12">
        <div className="card shadow-lg">
          <div className="card-body p-5">
            <h1 className="mb-4">
              <i className="bi bi-shield-lock-fill text-primary me-3"></i>
              À propos de Psy2Bib
            </h1>
            
            <div className="mb-5">
              <h3 className="text-primary mb-3">Notre Mission</h3>
              <p className="lead">
                Psy2Bib révolutionne l'accès aux psychologues en offrant une plateforme 
                <strong className="text-success"> 100% anonyme et sécurisée</strong> grâce au 
                chiffrement Zero-Knowledge.
              </p>
              <p>
                Nous garantissons que vos données psychologiques restent strictement privées : 
                le serveur ne peut <strong>jamais</strong> les lire, même en cas de compromission.
              </p>
            </div>

            <div className="row mb-5">
              <div className="col-md-4 mb-3">
                <div className="card bg-gradient-primary text-white h-100">
                  <div className="card-body text-center p-4">
                    <i className="bi bi-shield-check" style={{fontSize: '3rem'}}></i>
                    <h5 className="mt-3">Zero-Knowledge</h5>
                    <p className="small">
                      Chiffrement AES-256 • PBKDF2 100k itérations • 
                      Serveur aveugle incapable de lire vos données
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="col-md-4 mb-3">
                <div className="card bg-gradient-success text-white h-100">
                  <div className="card-body text-center p-4">
                    <i className="bi bi-camera-video" style={{fontSize: '3rem'}}></i>
                    <h5 className="mt-3">Visio Avatar 3D</h5>
                    <p className="small">
                      Consultations avec avatar animé • 
                      MediaPipe tracking • Votre vrai visage n'est jamais transmis
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="col-md-4 mb-3">
                <div className="card bg-gradient-info text-white h-100">
                  <div className="card-body text-center p-4">
                    <i className="bi bi-chat-dots" style={{fontSize: '3rem'}}></i>
                    <h5 className="mt-3">Messagerie E2EE</h5>
                    <p className="small">
                      Messages chiffrés de bout en bout • 
                      Le serveur ne relaie que des blobs opaques
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-5">
              <h3 className="text-primary mb-3">Architecture Technique</h3>
              
              <div className="card bg-light mb-3">
                <div className="card-body">
                  <h5 className="fw-bold">
                    <i className="bi bi-diagram-3 me-2 text-success"></i>
                    Pipeline de Chiffrement
                  </h5>
                  <pre className="bg-white p-3 rounded small">
{`[Navigateur Client]
        |
Mot de passe → PBKDF2(salt, 100k) → Clé AES-256
        |
        ↓
AES-GCM (chiffrement local)
        |
        ↓
Blobs chiffrés
        |
        ↓
[Serveur NestJS "aveugle"]
Stocke uniquement des données chiffrées`}
                  </pre>
                  <p className="text-muted mb-0 small">
                    <i className="bi bi-info-circle me-1"></i>
                    La clé AES ne quitte <strong>JAMAIS</strong> votre navigateur
                  </p>
                </div>
              </div>

              <div className="card bg-light">
                <div className="card-body">
                  <h5 className="fw-bold">
                    <i className="bi bi-camera-video-fill me-2 text-primary"></i>
                    Pipeline Visio Avatar
                  </h5>
                  <pre className="bg-white p-3 rounded small">
{`Webcam
   ↓
[MediaPipe] Face Landmarks
   ↓
[Avatar Engine WebGL]
   ↓
Frames Avatar (aucun pixel réel)
   ↓
WebRTC + DTLS-SRTP
   ↓
Transmission sécurisée`}
                  </pre>
                  <p className="text-muted mb-0 small">
                    <i className="bi bi-info-circle me-1"></i>
                    Le flux WebRTC ne contient <strong>aucun élément biométrique</strong>
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-5">
              <h3 className="text-primary mb-3">Nos Valeurs</h3>
              <div className="row">
                <div className="col-md-6">
                  <ul className="list-unstyled">
                    <li className="mb-3">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      <strong>Confidentialité absolue</strong> : Vos données ne quittent jamais votre appareil en clair
                    </li>
                    <li className="mb-3">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      <strong>Anonymat garanti</strong> : Avatar vidéo pour préserver votre identité
                    </li>
                    <li className="mb-3">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      <strong>Transparence</strong> : Code source documenté, architecture expliquée
                    </li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <ul className="list-unstyled">
                    <li className="mb-3">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      <strong>Accessibilité</strong> : Soins psychologiques pour tous
                    </li>
                    <li className="mb-3">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      <strong>Innovation</strong> : Technologies de pointe au service de la santé mentale
                    </li>
                    <li className="mb-3">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      <strong>Qualité</strong> : Psychologues certifiés et expérimentés
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="alert alert-success shadow">
              <div className="d-flex align-items-center">
                <i className="bi bi-trophy-fill me-3" style={{fontSize: '2.5rem'}}></i>
                <div>
                  <h5 className="mb-1">Challenge Startup 2025</h5>
                  <p className="mb-0">
                    Projet conforme au whitepaper et cahier des charges • 
                    Architecture Zero-Knowledge prouvée • 
                    Visio Avatar fonctionnel
                  </p>
                </div>
              </div>
            </div>

            <div className="alert alert-info">
              <i className="bi bi-info-circle-fill me-2"></i>
              <strong>Mode Démo :</strong> Cette version utilise localStorage pour simuler 
              le backend. En production, toutes les données chiffrées sont stockées dans 
              PostgreSQL avec Row Level Security (RLS).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
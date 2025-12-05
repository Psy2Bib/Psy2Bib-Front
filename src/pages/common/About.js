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
                chiffrement Zero-Knowledge avec <strong>Argon2id</strong>.
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
                    <h5 className="mt-3">Argon2id</h5>
                    <p className="small">
                      Algorithme memory-hard (64MB) • Résistant GPU/ASIC • 
                      Recommandé OWASP 2024
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
                      AES-256-GCM • Le serveur ne voit que des blobs opaques
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
                    Pipeline de Chiffrement Argon2id + AES-256
                  </h5>
                  <pre className="bg-white p-3 rounded small">
{`[Navigateur Client]
        |
Mot de passe
        ↓
┌─────────────────────────────────────┐
│  ARGON2ID (Memory-Hard)             │
│  • Type: Argon2id (hybrid)          │
│  • Mémoire: 64 MB                   │
│  • Itérations: 3                    │
│  • Parallelism: 4                   │
│  • Output: 256 bits                 │
└─────────────────────────────────────┘
        ↓
    Clé AES-256
        ↓
┌─────────────────────────────────────┐
│  AES-256-GCM (Authenticated)        │
│  • IV: 12 bytes (random)            │
│  • Tag: 128 bits (authentification) │
└─────────────────────────────────────┘
        ↓
  Blobs chiffrés
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

              {/* Comparaison PBKDF2 vs Argon2 */}
              <div className="card bg-light mb-3">
                <div className="card-body">
                  <h5 className="fw-bold">
                    <i className="bi bi-graph-up-arrow me-2 text-primary"></i>
                    Pourquoi Argon2id plutôt que PBKDF2 ?
                  </h5>
                  <div className="table-responsive">
                    <table className="table table-bordered small">
                      <thead className="table-dark">
                        <tr>
                          <th>Critère</th>
                          <th>PBKDF2</th>
                          <th className="table-success">Argon2id ✓</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><strong>Résistance GPU</strong></td>
                          <td className="table-warning">Moyenne (CPU-bound)</td>
                          <td className="table-success">Excellente (memory-hard 64MB)</td>
                        </tr>
                        <tr>
                          <td><strong>Résistance ASIC</strong></td>
                          <td className="table-danger">Faible</td>
                          <td className="table-success">Excellente</td>
                        </tr>
                        <tr>
                          <td><strong>Side-channel</strong></td>
                          <td className="table-warning">Non protégé</td>
                          <td className="table-success">Protégé (hybrid)</td>
                        </tr>
                        <tr>
                          <td><strong>Standard</strong></td>
                          <td>NIST (2000)</td>
                          <td className="table-success">PHC Winner (2015), OWASP 2024</td>
                        </tr>
                        <tr>
                          <td><strong>Temps dérivation</strong></td>
                          <td>~500ms (100k iter)</td>
                          <td>~1s (64MB)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
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
              <h3 className="text-primary mb-3">Configuration Argon2id</h3>
              <div className="row">
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-header bg-success text-white">
                      <i className="bi bi-gear-fill me-2"></i>
                      Paramètres utilisés
                    </div>
                    <div className="card-body">
                      <table className="table table-sm mb-0">
                        <tbody>
                          <tr>
                            <td><strong>Type</strong></td>
                            <td>Argon2id (type 2)</td>
                          </tr>
                          <tr>
                            <td><strong>Mémoire (m)</strong></td>
                            <td>65536 KB (64 MB)</td>
                          </tr>
                          <tr>
                            <td><strong>Itérations (t)</strong></td>
                            <td>3</td>
                          </tr>
                          <tr>
                            <td><strong>Parallelism (p)</strong></td>
                            <td>4</td>
                          </tr>
                          <tr>
                            <td><strong>Hash length</strong></td>
                            <td>32 bytes (256 bits)</td>
                          </tr>
                          <tr>
                            <td><strong>Salt</strong></td>
                            <td>16 bytes (random)</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card h-100">
                    <div className="card-header bg-info text-white">
                      <i className="bi bi-book me-2"></i>
                      Références
                    </div>
                    <div className="card-body">
                      <ul className="small mb-0">
                        <li className="mb-2">
                          <strong>OWASP Password Storage Cheat Sheet 2024</strong><br/>
                          <span className="text-muted">Recommande Argon2id comme premier choix</span>
                        </li>
                        <li className="mb-2">
                          <strong>RFC 9106 (2021)</strong><br/>
                          <span className="text-muted">Spécification officielle Argon2</span>
                        </li>
                        <li className="mb-2">
                          <strong>Password Hashing Competition (2015)</strong><br/>
                          <span className="text-muted">Argon2 vainqueur parmi 24 candidats</span>
                        </li>
                        <li>
                          <strong>NIST SP 800-63B</strong><br/>
                          <span className="text-muted">Accepte Argon2 pour l'authentification</span>
                        </li>
                      </ul>
                    </div>
                  </div>
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
                      <strong>Innovation</strong> : Argon2id + AES-256-GCM, standards 2024
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
                    Architecture Zero-Knowledge avec <strong>Argon2id</strong> • 
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
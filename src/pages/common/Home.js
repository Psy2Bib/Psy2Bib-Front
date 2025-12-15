import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className='text-center'>
      <div className='mb-5'>
        <i className='bi bi-shield-lock-fill text-primary' style={{fontSize: '5rem'}}></i>
      </div>
      
      <h1 className='mb-3 display-4 fw-bold'>
        Bienvenue sur <span className='text-primary'>Psy2Bib</span>
      </h1>
      
      <p className='lead mb-4 text-muted'>
        Plateforme de consultation psychologique <strong>100% anonyme</strong> 
        avec chiffrement Zero-Knowledge
      </p>
      
      <div className='alert alert-success shadow-sm mb-5 d-inline-block'>
        <i className='bi bi-shield-check me-2'></i>
        <strong>Sécurité maximale :</strong> Vos données sont chiffrées localement (AES-256) • 
        Le serveur ne peut jamais les lire
      </div>

      <div className='d-flex justify-content-center gap-3 flex-wrap mb-5'>
        <Link className='btn btn-primary btn-lg px-5 shadow' to='/patient/login'>
          <i className='bi bi-person-circle me-2'></i>
          Espace Patient
        </Link>
        <Link className='btn btn-success btn-lg px-5 shadow' to='/psy/login'>
          <i className='bi bi-person-badge me-2'></i>
          Espace Psychologue
        </Link>
      </div>

      {/* Fonctionnalités principales */}
      <div className='row mt-5 pt-5'>
        <div className='col-md-4 mb-4'>
          <div className='card shadow-sm h-100 hover-shadow'>
            <div className='card-body text-center p-4'>
              <i className='bi bi-shield-lock-fill text-primary' style={{fontSize: '3rem'}}></i>
              <h5 className='mt-3 fw-bold'>Zero-Knowledge</h5>
              <p className='text-muted'>
                Chiffrement E2EE avec AES-256. Le serveur ne peut jamais 
                accéder à vos données personnelles.
              </p>
              <div className='badge bg-primary'>PBKDF2 100k itérations</div>
            </div>
          </div>
        </div>

        <div className='col-md-4 mb-4'>
          <div className='card shadow-sm h-100 hover-shadow'>
            <div className='card-body text-center p-4'>
              <i className='bi bi-camera-video-fill text-success' style={{fontSize: '3rem'}}></i>
              <h5 className='mt-3 fw-bold'>Visio Avatar 3D</h5>
              <p className='text-muted'>
                Consultations en visioconférence avec avatar animé. 
                Votre vrai visage n'est jamais transmis.
              </p>
              <div className='badge bg-success'>MediaPipe + WebRTC</div>
            </div>
          </div>
        </div>

        <div className='col-md-4 mb-4'>
          <div className='card shadow-sm h-100 hover-shadow'>
            <div className='card-body text-center p-4'>
              <i className='bi bi-chat-dots-fill text-info' style={{fontSize: '3rem'}}></i>
              <h5 className='mt-3 fw-bold'>Messagerie Chiffrée</h5>
              <p className='text-muted'>
                Messages chiffrés de bout en bout. Communication 
                sécurisée entre patient et psychologue.
              </p>
              <div className='badge bg-info'>E2EE Messages</div>
            </div>
          </div>
        </div>
      </div>

      {/* Informations techniques */}
      <div className='row mt-5'>
        <div className='col-12'>
          <div className='card shadow-lg'>
            <div className='card-body p-5'>
              <h3 className='mb-4'>
                <i className='bi bi-gear-fill me-2 text-primary'></i>
                Architecture Zero-Knowledge
              </h3>
              
              <div className='row text-start'>
                <div className='col-md-6 mb-3'>
                  <h5 className='text-success'>
                    <i className='bi bi-check-circle-fill me-2'></i>
                    Ce que nous protégeons
                  </h5>
                  <ul className='list-unstyled ms-4'>
                    <li className='mb-2'>✓ Identité complète du patient</li>
                    <li className='mb-2'>✓ Notes du psychologue</li>
                    <li className='mb-2'>✓ Historique des rendez-vous</li>
                    <li className='mb-2'>✓ Messages patient ↔ psy</li>
                    <li className='mb-2'>✓ Flux vidéo réel (remplacé par avatar)</li>
                  </ul>
                </div>

                <div className='col-md-6 mb-3'>
                  <h5 className='text-primary'>
                    <i className='bi bi-cpu-fill me-2'></i>
                    Technologies utilisées
                  </h5>
                  <ul className='list-unstyled ms-4'>
                    <li className='mb-2'>🔐 AES-GCM 256 bits (chiffrement)</li>
                    <li className='mb-2'>🔑Argon2 (dérivation clé)</li>
                    <li className='mb-2'>🎭 MediaPipe (tracking facial)</li>
                    <li className='mb-2'>📹 WebRTC + DTLS-SRTP (visio)</li>
                    <li className='mb-2'>🛡️ CSP + RLS PostgreSQL (sécurité)</li>
                  </ul>
                </div>
              </div>

              <div className='alert alert-warning mt-4'>
                <i className='bi bi-info-circle-fill me-2'></i>
                <strong>Serveur aveugle :</strong> Le backend NestJS ne possède aucune clé 
                de déchiffrement. Toutes vos données sont des blobs opaques pour le serveur.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to action */}
      <div className='mt-5 pt-5 pb-5'>
        <h3 className='mb-4'>Prêt à commencer ?</h3>
        <div className='d-flex justify-content-center gap-3'>
          <Link className='btn btn-outline-primary btn-lg' to='/about'>
            <i className='bi bi-info-circle me-2'></i>
            En savoir plus
          </Link>
          <Link className='btn btn-primary btn-lg' to='/patient/register'>
            <i className='bi bi-person-plus me-2'></i>
            Créer un compte
          </Link>
        </div>
      </div>
    </div>
  );
}
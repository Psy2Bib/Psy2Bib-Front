import React from 'react';

export default function Footer() {
  return (
    <footer className='py-5 mt-5 border-top'>
      <div className='container'>
        <div className='row'>
          <div className='col-md-4 mb-3'>
            <h5 className='fw-bold text-primary'>
              <i className='bi bi-shield-lock-fill me-2'></i>
              Psy2Bib
            </h5>
            <p className='text-muted small'>
              Plateforme de consultation psychologique 100% anonyme 
              avec chiffrement Zero-Knowledge.
            </p>
            <div className='d-flex gap-2'>
              <span className='badge bg-success'>AES-256</span>
              <span className='badge bg-primary'>Argon2</span>
              <span className='badge bg-info'>E2EE</span>
            </div>
          </div>

          <div className='col-md-4 mb-3'>
            <h6 className='fw-bold'>Sécurité</h6>
            <ul className='list-unstyled small'>
              <li className='mb-2'>
                <i className='bi bi-shield-check text-success me-2'></i>
                Chiffrement Zero-Knowledge
              </li>
              <li className='mb-2'>
                <i className='bi bi-key text-primary me-2'></i>
                Argon2
              </li>
              <li className='mb-2'>
                <i className='bi bi-eye-slash text-warning me-2'></i>
                Serveur aveugle (NestJS)
              </li>
              <li>
                <i className='bi bi-camera-video text-info me-2'></i>
                Visio Avatar 3D anonyme
              </li>
            </ul>
          </div>

          <div className='col-md-4 mb-3'>
            <h6 className='fw-bold'>Technologies</h6>
            <ul className='list-unstyled small'>
              <li className='mb-2'>⚛️ React + Vite</li>
              <li className='mb-2'>🔐 Web Crypto API</li>
              <li className='mb-2'>🎭 MediaPipe Face Tracking</li>
              <li className='mb-2'>📹 WebRTC + DTLS-SRTP</li>
              <li>🛡️ PostgreSQL + RLS</li>
            </ul>
          </div>
        </div>

        <hr className='my-4' />

        <div className='row align-items-center'>
          <div className='col-md-6 text-center text-md-start'>
            <small className='text-muted'>
              © {new Date().getFullYear()} Psy2Bib — 
              <span className='badge bg-success ms-2'>
                <i className='bi bi-shield-fill-check'></i> Zero-Knowledge
              </span>
            </small>
          </div>

          <div className='col-md-6 text-center text-md-end'>
            <small className='text-muted'>
              <i className='bi bi-github me-1'></i>
              Challenge Startup • Conformité Whitepaper
            </small>
          </div>
        </div>
      </div>
    </footer>
  );
}
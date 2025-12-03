import React from 'react';

export default function About() {
  return (
    <div className="row">
      <div className="col-12">
        <div className="card shadow-lg">
          <div className="card-body p-5">
            <h1 className="mb-4 text-primary">À propos de Psy2Bib</h1>
            
            <div className="mb-4">
              <h3 className="text-secondary">Notre Mission</h3>
              <p className="lead">
                Psy2Bib est une plateforme innovante qui facilite la connexion entre patients 
                et psychologues qualifiés. Notre objectif est de rendre les soins de santé 
                mentale accessibles à tous.
              </p>
            </div>

            <div className="row mb-4">
              <div className="col-md-4">
                <div className="card bg-gradient-primary text-white mb-3">
                  <div className="card-body text-center">
                    <i className="bi bi-calendar-check" style={{fontSize: '3rem'}}></i>
                    <h5 className="mt-3">Réservation Simple</h5>
                    <p>Prenez rendez-vous en quelques clics</p>
                  </div>
                </div>
              </div>
              
              <div className="col-md-4">
                <div className="card bg-gradient-info text-white mb-3">
                  <div className="card-body text-center">
                    <i className="bi bi-camera-video" style={{fontSize: '3rem'}}></i>
                    <h5 className="mt-3">Visio Sécurisée</h5>
                    <p>Consultations en ligne avec avatar</p>
                  </div>
                </div>
              </div>
              
              <div className="col-md-4">
                <div className="card bg-gradient-success text-white mb-3">
                  <div className="card-body text-center">
                    <i className="bi bi-chat-dots" style={{fontSize: '3rem'}}></i>
                    <h5 className="mt-3">Messagerie</h5>
                    <p>Communiquez facilement avec votre psy</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-secondary">Nos Valeurs</h3>
              <ul className="list-unstyled">
                <li className="mb-2">✓ <strong>Confidentialité</strong> : Vos données sont protégées</li>
                <li className="mb-2">✓ <strong>Accessibilité</strong> : Des soins pour tous</li>
                <li className="mb-2">✓ <strong>Innovation</strong> : Technologie au service de la santé</li>
                <li className="mb-2">✓ <strong>Qualité</strong> : Psychologues certifiés et expérimentés</li>
              </ul>
            </div>

            <div className="alert alert-info">
              <strong>Note :</strong> Cette version est une démonstration locale sans backend. 
              Les données sont stockées temporairement dans votre navigateur.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
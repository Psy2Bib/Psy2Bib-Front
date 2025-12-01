import React from 'react';
export default function Landing() {
  return (
    <div className='bg-gradient-primary text-white text-center p-5'>
      <h1 className='display-4'>Bienvenue sur Psy2Bib</h1>
      <p className='lead'>Plateforme sécurisée pour vos rendez-vous psychologiques avec confidentialité Zero-Knowledge.</p>
      <a href='/register' className='btn btn-light btn-lg me-3'>Créer un compte</a>
      <a href='/login' className='btn btn-outline-light btn-lg'>Se connecter</a>
    </div>
  );
}
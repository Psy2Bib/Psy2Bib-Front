import React from 'react';
export default function Dashboard() {
  return (
    <div className='container mt-5'>
      <h2>Bienvenue sur votre Dashboard</h2>
      <p>Recherchez un psychologue et gérez vos rendez-vous.</p>
      <a href='/psychologists' className='btn btn-primary'>Voir les psychologues</a>
    </div>
  );
}
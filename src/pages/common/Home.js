import React from 'react';
import { Link } from 'react-router-dom';
export default function Home(){
  return (
    <div className='text-center'>
      <h1 className='mb-3'>Bienvenue sur Psy2Bib</h1>
      <p className='lead'>Test local : inscription & connexion sans backend.</p>
      <div className='d-flex justify-content-center gap-2'>
        <Link className='btn btn-primary' to='/patient/login'>Espace Patient</Link>
        <Link className='btn btn-secondary' to='/psy/login'>Espace Psychologue</Link>
      </div>
    </div>
  );
}
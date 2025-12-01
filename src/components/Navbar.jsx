import React from 'react';
export default function Navbar() {
  return (
    <nav className='navbar navbar-expand-lg navbar-dark bg-dark'>
      <div className='container'>
        <a className='navbar-brand' href='/'>Psy2Bib</a>
        <div>
          <a className='btn btn-primary me-2' href='/login'>Connexion</a>
          <a className='btn btn-secondary' href='/register'>Inscription</a>
        </div>
      </div>
    </nav>
  );
}
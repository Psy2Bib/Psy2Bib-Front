import React, { useState } from 'react';
export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const handleRegister = (e) => {
    e.preventDefault();
    alert(`Compte créé pour ${email}`);
  };
  return (
    <div className='container mt-5'>
      <div className='card p-4'>
        <h3>Inscription</h3>
        <form onSubmit={handleRegister}>
          <div className='mb-3'>
            <input type='email' className='form-control' placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className='mb-3'>
            <input type='password' className='form-control' placeholder='Mot de passe' value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button className='btn btn-primary' type='submit'>Créer un compte</button>
        </form>
      </div>
    </div>
  );
}
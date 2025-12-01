import React, { useState } from 'react';
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const handleLogin = (e) => {
    e.preventDefault();
    alert(`Connecté avec ${email}`);
  };
  return (
    <div className='container mt-5'>
      <div className='card p-4'>
        <h3>Connexion</h3>
        <form onSubmit={handleLogin}>
          <div className='mb-3'>
            <input type='email' className='form-control' placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className='mb-3'>
            <input type='password' className='form-control' placeholder='Mot de passe' value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button className='btn btn-primary' type='submit'>Se connecter</button>
        </form>
      </div>
    </div>
  );
}
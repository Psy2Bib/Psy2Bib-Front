import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
export default function PatientRegister(){
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [message,setMessage]=useState('');
  const navigate=useNavigate();
  const handleRegister=()=>{
    if(email && password){
      localStorage.setItem(`patient:${email}`, JSON.stringify({email,password}));
      setMessage('Inscription rÃ©ussie ! Redirection...');
      setTimeout(()=>navigate('/patient/login'),1500);
    } else setMessage('Veuillez remplir tous les champs');
  };
  return (
    <div className='row'>
      <div className='col-12 col-md-6 mx-auto'>
        <div className='card card-body shadow'>
          <h2 className='mb-3'>Inscription Patient</h2>
          {message && <div className='alert alert-info'>{message}</div>}
          <input className='form-control mb-2' placeholder='Email' value={email} onChange={e=>setEmail(e.target.value)} />
          <input className='form-control mb-3' type='password' placeholder='Mot de passe' value={password} onChange={e=>setPassword(e.target.value)} />
          <button className='btn btn-success' onClick={handleRegister}>S'inscrire</button>
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/common/Home';
import About from './pages/common/About';
import SearchPsy from './pages/common/SearchPsy';
import Appointments from './pages/common/Appointments';
import Messages from './pages/common/Messages';
import Visio from './pages/common/Visio';
import PatientLogin from './pages/patient/Login';
import PatientRegister from './pages/patient/Register';
import PatientDashboard from './pages/patient/Dashboard';
import PsyLogin from './pages/psy/Login';
import PsyRegister from './pages/psy/Register';
import PsyDashboard from './pages/psy/Dashboard';
import Topbar from './components/Topbar';
import Footer from './components/Footer';

export default function App(){
  return (
    <>
      <Topbar />
      <div className='container mt-4'>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/about' element={<About />} />
          <Route path='/search' element={<SearchPsy />} />
          <Route path='/appointments' element={<Appointments />} />
          <Route path='/messages' element={<Messages />} />
          <Route path='/visio' element={<Visio />} />
          <Route path='/patient/login' element={<PatientLogin />} />
          <Route path='/patient/register' element={<PatientRegister />} />
          <Route path='/patient/dashboard' element={<PatientDashboard />} />
          <Route path='/psy/login' element={<PsyLogin />} />
          <Route path='/psy/register' element={<PsyRegister />} />
          <Route path='/psy/dashboard' element={<PsyDashboard />} />
          <Route path='*' element={<Navigate to='/' />} />
        </Routes>
      </div>
      <Footer />
    </>
  );
}
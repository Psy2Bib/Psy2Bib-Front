import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Psychologists from './pages/Psychologists';
import Appointment from './pages/Appointment';
import Messaging from './pages/Messaging';
import VideoCall from './pages/VideoCall';
export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Landing />} />
        <Route path='/register' element={<Register />} />
        <Route path='/login' element={<Login />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/psychologists' element={<Psychologists />} />
        <Route path='/appointment' element={<Appointment />} />
        <Route path='/messaging' element={<Messaging />} />
        <Route path='/video' element={<VideoCall />} />
      </Routes>
    </BrowserRouter>
  );
}
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated, getUserRole } from './utils/auth';
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

/**
 * Composant de protection de route
 * Redirige vers la page de login si l'utilisateur n'est pas authentifié
 */
const ProtectedRoute = ({ children, requiredRole = null }) => {
  if (!isAuthenticated()) {
    // Rediriger vers le login approprié selon le rôle requis
    if (requiredRole === 'PSY') {
      return <Navigate to="/psy/login" replace />;
    }
    return <Navigate to="/patient/login" replace />;
  }

  // Vérifier le rôle si requis
  if (requiredRole) {
    const userRole = getUserRole();
    if (userRole !== requiredRole) {
      // Rediriger vers le dashboard approprié
      if (userRole === 'PATIENT') {
        return <Navigate to="/patient/dashboard" replace />;
      } else if (userRole === 'PSY') {
        return <Navigate to="/psy/dashboard" replace />;
      }
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

/**
 * Composant de route publique
 * Redirige vers le dashboard si l'utilisateur est déjà connecté
 */
const PublicRoute = ({ children, redirectTo = null }) => {
  if (isAuthenticated()) {
    const role = getUserRole();
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }
    // Rediriger selon le rôle
    if (role === 'PATIENT') {
      return <Navigate to="/patient/dashboard" replace />;
    } else if (role === 'PSY') {
      return <Navigate to="/psy/dashboard" replace />;
    }
  }
  return children;
};

export default function App() {
  return (
    <>
      <Topbar />
      <div className="container mt-4">
        <Routes>
          {/* Routes publiques */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/search" element={<SearchPsy />} />

          {/* Routes publiques avec redirection si connecté */}
          <Route
            path="/patient/login"
            element={
              <PublicRoute redirectTo="/patient/dashboard">
                <PatientLogin />
              </PublicRoute>
            }
          />
          <Route
            path="/patient/register"
            element={
              <PublicRoute redirectTo="/patient/dashboard">
                <PatientRegister />
              </PublicRoute>
            }
          />
          <Route
            path="/psy/login"
            element={
              <PublicRoute redirectTo="/psy/dashboard">
                <PsyLogin />
              </PublicRoute>
            }
          />
          <Route
            path="/psy/register"
            element={
              <PublicRoute redirectTo="/psy/dashboard">
                <PsyRegister />
              </PublicRoute>
            }
          />

          {/* Routes protégées - Patient */}
          <Route
            path="/patient/dashboard"
            element={
              <ProtectedRoute requiredRole="PATIENT">
                <PatientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/appointments"
            element={
              <ProtectedRoute>
                <Appointments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            }
          />
          <Route
            path="/visio"
            element={
              <ProtectedRoute>
                <Visio />
              </ProtectedRoute>
            }
          />

          {/* Routes protégées - Psychologue */}
          <Route
            path="/psy/dashboard"
            element={
              <ProtectedRoute requiredRole="PSY">
                <PsyDashboard />
              </ProtectedRoute>
            }
          />

          {/* Route 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Footer />
    </>
  );
}

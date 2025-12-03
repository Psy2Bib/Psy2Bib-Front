import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Topbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    setUser(currentUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setUser(null);
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold text-primary" to="/">
          <i className="bi bi-heart-pulse-fill me-2"></i>
          Psy2Bib
        </Link>
        
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            {user ? (
              <>
                {user.role === 'patient' && (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/search">
                        <i className="bi bi-search me-1"></i>
                        Trouver un psy
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/appointments">
                        <i className="bi bi-calendar-check me-1"></i>
                        Mes RDV
                      </Link>
                    </li>
                  </>
                )}
                
                {user.role === 'psy' && (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/appointments">
                        <i className="bi bi-calendar-event me-1"></i>
                        Agenda
                      </Link>
                    </li>
                  </>
                )}
                
                <li className="nav-item">
                  <Link className="nav-link" to="/messages">
                    <i className="bi bi-chat-dots me-1"></i>
                    Messagerie
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/visio">
                    <i className="bi bi-camera-video me-1"></i>
                    Visio
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/about">
                    <i className="bi bi-info-circle me-1"></i>
                    À propos
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/search">
                    <i className="bi bi-search me-1"></i>
                    Trouver un psy
                  </Link>
                </li>
              </>
            )}
          </ul>

          <ul className="navbar-nav">
            {user ? (
              <>
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    id="userMenu"
                    role="button"
                    data-bs-toggle="dropdown"
                  >
                    <i className="bi bi-person-circle me-1"></i>
                    {user.email.split('@')[0]}
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <Link
                        className="dropdown-item"
                        to={user.role === 'patient' ? '/patient/dashboard' : '/psy/dashboard'}
                      >
                        <i className="bi bi-speedometer2 me-2"></i>
                        Dashboard
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item text-danger" onClick={handleLogout}>
                        <i className="bi bi-box-arrow-right me-2"></i>
                        Déconnexion
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/patient/login">
                    <i className="bi bi-person me-1"></i>
                    Patient
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link text-success" to="/psy/login">
                    <i className="bi bi-person-badge me-1"></i>
                    Psychologue
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
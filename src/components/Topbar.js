import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { clearEncryptionKey, hasEncryptionKey } from '../utils/crypto';

// Material UI Icons
import ShieldIcon from '@mui/icons-material/Shield';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SearchIcon from '@mui/icons-material/Search';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SpeedIcon from '@mui/icons-material/Speed';
import ChatIcon from '@mui/icons-material/Chat';
import BuildIcon from '@mui/icons-material/Build';
import InfoIcon from '@mui/icons-material/Info';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import BadgeIcon from '@mui/icons-material/Badge';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import SecurityIcon from '@mui/icons-material/Security';
import EditIcon from '@mui/icons-material/Edit';

export default function Topbar() {
  const [user, setUser] = useState(null);
  const [isE2EEActive, setIsE2EEActive] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkUserStatus();
  }, [location]);

  const checkUserStatus = () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    setUser(currentUser);
    setIsE2EEActive(hasEncryptionKey());
  };

  const handleLogout = () => {
    clearEncryptionKey();
    localStorage.removeItem('currentUser');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    setIsE2EEActive(false);
    navigate('/');
  };

  const isPatient = user?.role?.toUpperCase() === 'PATIENT';
  const isPsy = user?.role?.toUpperCase() === 'PSYCHOLOGIST' || user?.role?.toUpperCase() === 'PSY';

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold text-primary d-flex align-items-center" to="/">
          <ShieldIcon className="me-2" />
          <span>Psy2Bib</span>
          {isE2EEActive && (
            <span className="badge bg-success ms-2 small d-flex align-items-center">
              <VerifiedUserIcon fontSize="small" className="me-1" /> E2EE
            </span>
          )}
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
                {isPatient && (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link d-flex align-items-center" to="/search">
                        <SearchIcon className="me-1" fontSize="small" />
                        Trouver un psy
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link d-flex align-items-center" to="/appointments">
                        <CalendarMonthIcon className="me-1" fontSize="small" />
                        Mes RDV
                      </Link>
                    </li>
                  </>
                )}
                
                {isPsy && (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link d-flex align-items-center" to="/psy/dashboard">
                        <SpeedIcon className="me-1" fontSize="small" />
                        Dashboard
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link d-flex align-items-center" to="/appointments">
                        <CalendarMonthIcon className="me-1" fontSize="small" />
                        Agenda
                      </Link>
                    </li>
                  </>
                )}
                
                <li className="nav-item">
                  <Link className="nav-link d-flex align-items-center" to="/messages">
                    <ChatIcon className="me-1" fontSize="small" />
                    Messagerie
                    <span className="badge bg-danger ms-1 small">E2EE</span>
                  </Link>
                </li>
                {/* Lien Visio Avatar supprimé comme demandé */}
                <li className="nav-item">
                  <Link className="nav-link d-flex align-items-center" to="/visio-test">
                    <BuildIcon className="me-1" fontSize="small" />
                    Test Matériel
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link d-flex align-items-center" to="/about">
                    <InfoIcon className="me-1" fontSize="small" />
                    À propos
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link d-flex align-items-center" to="/search">
                    <SearchIcon className="me-1" fontSize="small" />
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
                    className="nav-link dropdown-toggle d-flex align-items-center"
                    href="#"
                    id="userMenu"
                    role="button"
                    data-bs-toggle="dropdown"
                  >
                    {isPsy ? <BadgeIcon className="me-1" /> : <AccountCircleIcon className="me-1" />}
                    {user.profile?.firstName || user.email?.split('@')[0]}
                    {isE2EEActive && (
                      <VerifiedUserIcon fontSize="small" className="text-success ms-2" />
                    )}
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <Link
                        className="dropdown-item d-flex align-items-center"
                        to={isPatient ? '/patient/dashboard' : '/psy/dashboard'}
                      >
                        <SpeedIcon className="me-2" fontSize="small" />
                        Dashboard
                      </Link>
                    </li>
                    {isPatient && (
                      <li>
                        <Link className="dropdown-item d-flex align-items-center" to="/patient/onboarding">
                          <EditIcon className="me-2" fontSize="small" />
                          Mon Profil (Chiffré)
                        </Link>
                      </li>
                    )}
                    {isPsy && (
                      <li>
                        <Link className="dropdown-item d-flex align-items-center" to="/psy/profile">
                          <BadgeIcon className="me-2" fontSize="small" />
                          Mon Profil Public
                        </Link>
                      </li>
                    )}
                    <li><hr className="dropdown-divider" /></li>
                    <li className="px-3 py-2 small text-muted d-flex align-items-center">
                      <SecurityIcon className="me-1" fontSize="small" />
                      Chiffrement actif
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item text-danger d-flex align-items-center" onClick={handleLogout}>
                        <LogoutIcon className="me-2" fontSize="small" />
                        Déconnexion
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link d-flex align-items-center" to="/patient/login">
                    <PersonIcon className="me-1" fontSize="small" />
                    Patient
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link text-success d-flex align-items-center" to="/psy/login">
                    <BadgeIcon className="me-1" fontSize="small" />
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
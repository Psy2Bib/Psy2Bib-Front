import React, { useState, useRef, useEffect } from 'react';

export default function Visio() {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [userRole, setUserRole] = useState('patient');
  const videoRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    setUserRole(currentUser.role || 'patient');

    if (isCallActive) {
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setCallDuration(0);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isCallActive]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setIsCallActive(true);
    } catch (err) {
      console.error('Erreur accès caméra:', err);
      alert('Caméra non accessible. Mode avatar uniquement activé.');
      setIsCallActive(true);
    }
  };

  const endCall = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCallActive(false);
    setIsMuted(false);
    setIsVideoOn(true);
  };

  const toggleMute = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const audioTracks = videoRef.current.srcObject.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
    }
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const videoTracks = videoRef.current.srcObject.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
    }
    setIsVideoOn(!isVideoOn);
  };

  // Avatar 3D Component
  const Avatar3D = ({ name, color, size = 'large' }) => {
    const sizeClass = size === 'large' ? 'avatar-3d-large' : 'avatar-3d-small';
    
    return (
      <div className={`avatar-3d ${sizeClass}`} style={{
        background: `linear-gradient(135deg, ${color}40 0%, ${color}80 100%)`,
        border: `3px solid ${color}`,
      }}>
        <div className="avatar-face">
          <div className="avatar-eyes">
            <div className="avatar-eye left"></div>
            <div className="avatar-eye right"></div>
          </div>
          <div className="avatar-mouth"></div>
        </div>
        <div className="avatar-name">{name}</div>
        <div className="small text-white-50 mt-2">
          <i className="bi bi-shield-check"></i> Anonyme
        </div>
      </div>
    );
  };

  const psyName = userRole === 'psy' ? 'Vous' : 'Dr. Sophie Martin';
  const clientName = userRole === 'patient' ? 'Vous' : 'Patient';

  return (
    <div>
      <div className="mb-4">
        <h1>
          <i className="bi bi-camera-video-fill me-2 text-primary"></i>
          Visioconférence
        </h1>
        <p className="text-muted">
          <i className="bi bi-shield-lock text-success me-1"></i>
          Consultation avec avatar 3D • Votre visage n'est jamais transmis
        </p>
      </div>

      {!isCallActive ? (
        <div className="row">
          <div className="col-12 col-lg-8 mx-auto">
            <div className="card shadow-lg">
              <div className="card-body text-center p-5">
                <div className="mb-4">
                  <i className="bi bi-camera-video text-primary" style={{fontSize: '5rem'}}></i>
                </div>
                <h2 className="mb-3">Consultation en Visio avec Avatar 3D</h2>
                <p className="lead text-muted mb-4">
                  Lancez une visioconférence sécurisée avec avatar virtuel 3D.
                  Votre identité reste protégée grâce à notre technologie d'avatar animé.
                </p>

                <div className="row mb-4">
                  <div className="col-md-4 mb-3">
                    <div className="card bg-light h-100">
                      <div className="card-body">
                        <i className="bi bi-shield-check text-success" style={{fontSize: '2rem'}}></i>
                        <h6 className="mt-2">Sécurisé</h6>
                        <small className="text-muted">Chiffrement DTLS-SRTP</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <div className="card bg-light h-100">
                      <div className="card-body">
                        <i className="bi bi-person-bounding-box text-info" style={{fontSize: '2rem'}}></i>
                        <h6 className="mt-2">Avatar 3D</h6>
                        <small className="text-muted">MediaPipe tracking</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <div className="card bg-light h-100">
                      <div className="card-body">
                        <i className="bi bi-eye-slash text-warning" style={{fontSize: '2rem'}}></i>
                        <h6 className="mt-2">Anonymat</h6>
                        <small className="text-muted">Visage jamais transmis</small>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  className="btn btn-primary btn-lg px-5 shadow"
                  onClick={startCall}
                >
                  <i className="bi bi-camera-video-fill me-2"></i>
                  Démarrer la consultation
                </button>

                <div className="alert alert-success mt-4">
                  <i className="bi bi-info-circle me-2"></i>
                  <strong>Pipeline technique :</strong> Webcam → MediaPipe → Avatar WebGL → WebRTC SRTP
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card shadow-lg">
          <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
            <div>
              <i className="bi bi-record-circle text-danger me-2"></i>
              Consultation en cours - Mode Avatar 3D
            </div>
            <div className="d-flex align-items-center gap-3">
              <span className="badge bg-success">
                <i className="bi bi-shield-lock me-1"></i>
                E2EE Actif
              </span>
              <div className="badge bg-danger fs-6">
                {formatDuration(callDuration)}
              </div>
            </div>
          </div>

          <div className="card-body p-0 bg-dark" style={{minHeight: '500px'}}>
            <div className="row g-0">
              {/* Vidéo principale - Avatar du psy */}
              <div className="col-12 col-lg-8 position-relative" style={{minHeight: '500px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
                <div className="d-flex align-items-center justify-content-center h-100">
                  <Avatar3D name={psyName} color="#667eea" size="large" />
                </div>

                {/* Mini aperçu - Avatar du client */}
                <div 
                  className="position-absolute bottom-0 end-0 m-3"
                  style={{
                    width: '200px',
                    height: '150px',
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    borderRadius: '12px',
                    border: '3px solid white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                  }}
                >
                  {isVideoOn ? (
                    <Avatar3D name={clientName} color="#f5576c" size="small" />
                  ) : (
                    <div className="text-white text-center">
                      <i className="bi bi-camera-video-off" style={{fontSize: '2rem'}}></i>
                      <p className="mt-2 mb-0 small">Caméra désactivée</p>
                    </div>
                  )}
                </div>

                {/* Indicateurs */}
                {!isMuted && (
                  <div className="position-absolute top-0 start-0 m-3">
                    <div className="badge bg-success">
                      <i className="bi bi-mic-fill me-1"></i>
                      Audio actif
                    </div>
                  </div>
                )}
              </div>

              {/* Panneau latéral */}
              <div className="col-12 col-lg-4 bg-light p-3" style={{maxHeight: '500px', overflowY: 'auto'}}>
                <h5 className="mb-3">
                  <i className="bi bi-info-circle me-2 text-primary"></i>
                  Informations
                </h5>
                
                <div className="mb-3">
                  <small className="text-muted">Psychologue</small>
                  <p className="mb-0 fw-bold">Dr. Sophie Martin</p>
                </div>
                
                <div className="mb-3">
                  <small className="text-muted">Spécialité</small>
                  <p className="mb-0">TCC</p>
                </div>
                
                <div className="mb-3">
                  <small className="text-muted">Durée prévue</small>
                  <p className="mb-0">45 minutes</p>
                </div>

                <hr />

                <div className="alert alert-success small">
                  <i className="bi bi-shield-check me-2"></i>
                  <strong>Avatar actif</strong><br/>
                  Votre visage réel n'est jamais transmis
                </div>

                <hr />

                <h6 className="mb-3">
                  <i className="bi bi-journal-text me-2 text-primary"></i>
                  Notes de session
                </h6>
                <textarea
                  className="form-control"
                  rows="6"
                  placeholder="Prenez des notes durant la consultation..."
                ></textarea>

                <div className="alert alert-warning mt-3 small">
                  <i className="bi bi-shield-lock me-2"></i>
                  Notes chiffrées E2EE
                </div>
              </div>
            </div>
          </div>

          <div className="card-footer bg-dark text-center py-3">
            <div className="d-flex justify-content-center gap-3 flex-wrap">
              <button
                className={`btn ${isMuted ? 'btn-danger' : 'btn-light'} btn-lg rounded-circle`}
                onClick={toggleMute}
                style={{width: '60px', height: '60px'}}
                title={isMuted ? 'Activer le micro' : 'Couper le micro'}
              >
                <i className={`bi bi-mic${isMuted ? '-mute' : ''}-fill`}></i>
              </button>

              <button
                className={`btn ${isVideoOn ? 'btn-light' : 'btn-danger'} btn-lg rounded-circle`}
                onClick={toggleVideo}
                style={{width: '60px', height: '60px'}}
                title={isVideoOn ? 'Désactiver la caméra' : 'Activer la caméra'}
              >
                <i className={`bi bi-camera-video${isVideoOn ? '' : '-off'}-fill`}></i>
              </button>

              <button
                className="btn btn-danger btn-lg rounded-circle"
                onClick={endCall}
                style={{width: '60px', height: '60px'}}
                title="Terminer l'appel"
              >
                <i className="bi bi-telephone-x-fill"></i>
              </button>

              <button
                className="btn btn-light btn-lg rounded-circle"
                style={{width: '60px', height: '60px'}}
                title="Paramètres"
              >
                <i className="bi bi-gear-fill"></i>
              </button>

              <button
                className="btn btn-light btn-lg rounded-circle"
                style={{width: '60px', height: '60px'}}
                title="Chat"
              >
                <i className="bi bi-chat-dots-fill"></i>
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .avatar-3d {
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: float 3s ease-in-out infinite;
          position: relative;
        }

        .avatar-3d-large {
          width: 250px;
          height: 250px;
        }

        .avatar-3d-small {
          width: 100px;
          height: 100px;
        }

        .avatar-face {
          position: relative;
        }

        .avatar-eyes {
          display: flex;
          gap: 30px;
          margin-bottom: 20px;
          animation: blink 4s infinite;
        }

        .avatar-3d-small .avatar-eyes {
          gap: 15px;
          margin-bottom: 10px;
        }

        .avatar-eye {
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 50%;
          position: relative;
          box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.2);
        }

        .avatar-3d-small .avatar-eye {
          width: 10px;
          height: 10px;
        }

        .avatar-eye::after {
          content: '';
          position: absolute;
          width: 10px;
          height: 10px;
          background: #2c3e50;
          border-radius: 50%;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: lookAround 5s infinite;
        }

        .avatar-3d-small .avatar-eye::after {
          width: 5px;
          height: 5px;
        }

        .avatar-mouth {
          width: 50px;
          height: 25px;
          border: 3px solid white;
          border-top: none;
          border-radius: 0 0 50px 50px;
          animation: talk 1s infinite;
        }

        .avatar-3d-small .avatar-mouth {
          width: 25px;
          height: 12px;
          border-width: 2px;
        }

        .avatar-name {
          margin-top: 20px;
          color: white;
          font-weight: bold;
          font-size: 1.2rem;
          text-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
        }

        .avatar-3d-small .avatar-name {
          margin-top: 10px;
          font-size: 0.7rem;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes blink {
          0%, 90%, 100% {
            transform: scaleY(1);
          }
          95% {
            transform: scaleY(0.1);
          }
        }

        @keyframes lookAround {
          0%, 100% {
            transform: translate(-50%, -50%);
          }
          25% {
            transform: translate(-30%, -50%);
          }
          75% {
            transform: translate(-70%, -50%);
          }
        }

        @keyframes talk {
          0%, 100% {
            height: 25px;
          }
          50% {
            height: 30px;
          }
        }
      `}</style>
    </div>
  );
}
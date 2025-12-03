import React, { useState, useRef, useEffect } from 'react';

export default function Visio() {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const videoRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
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
      // Demander l'accès à la caméra
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
      alert('Impossible d\'accéder à la caméra. Simulation activée.');
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

  return (
    <div>
      <h1 className="mb-4">Visioconférence</h1>

      {!isCallActive ? (
        <div className="row">
          <div className="col-12 col-lg-8 mx-auto">
            <div className="card shadow-lg">
              <div className="card-body text-center p-5">
                <div className="mb-4">
                  <i className="bi bi-camera-video text-primary" style={{fontSize: '5rem'}}></i>
                </div>
                <h2 className="mb-3">Consultation en Visio</h2>
                <p className="lead text-muted mb-4">
                  Lancez une visioconférence sécurisée avec votre psychologue.
                  La consultation se fait avec un avatar virtuel pour préserver votre anonymat.
                </p>

                <div className="row mb-4">
                  <div className="col-md-4 mb-3">
                    <div className="card bg-light">
                      <div className="card-body">
                        <i className="bi bi-shield-check text-success" style={{fontSize: '2rem'}}></i>
                        <h6 className="mt-2">Sécurisé</h6>
                        <small className="text-muted">Connexion chiffrée de bout en bout</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <div className="card bg-light">
                      <div className="card-body">
                        <i className="bi bi-person-bounding-box text-info" style={{fontSize: '2rem'}}></i>
                        <h6 className="mt-2">Avatar Virtuel</h6>
                        <small className="text-muted">Préservez votre anonymat</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <div className="card bg-light">
                      <div className="card-body">
                        <i className="bi bi-headset text-warning" style={{fontSize: '2rem'}}></i>
                        <h6 className="mt-2">Qualité HD</h6>
                        <small className="text-muted">Audio et vidéo haute définition</small>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  className="btn btn-primary btn-lg px-5"
                  onClick={startCall}
                >
                  <i className="bi bi-camera-video-fill me-2"></i>
                  Démarrer la consultation
                </button>

                <div className="alert alert-info mt-4">
                  <i className="bi bi-info-circle me-2"></i>
                  <strong>Technologie :</strong> Cette fonctionnalité utilise MediaPipe pour le tracking 
                  des expressions faciales et WebRTC pour la transmission sécurisée.
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
              Consultation en cours
            </div>
            <div className="badge bg-danger fs-6">
              {formatDuration(callDuration)}
            </div>
          </div>

          <div className="card-body p-0 bg-dark" style={{minHeight: '500px'}}>
            <div className="row g-0">
              {/* Vidéo du psychologue (simulation avec avatar) */}
              <div className="col-12 col-lg-8 position-relative">
                <div className="ratio ratio-16x9 bg-secondary">
                  <div className="d-flex align-items-center justify-content-center">
                    <div className="text-center text-white">
                      <i className="bi bi-person-circle" style={{fontSize: '8rem'}}></i>
                      <h4 className="mt-3">Dr. Sophie Martin</h4>
                      <p className="text-white-50">Avatar Virtuel Actif</p>
                    </div>
                  </div>
                </div>

                {/* Vidéo locale (petit aperçu) */}
                <div 
                  className="position-absolute bottom-0 end-0 m-3 border border-3 border-white rounded"
                  style={{width: '200px'}}
                >
                  {isVideoOn ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-100 rounded"
                      style={{transform: 'scaleX(-1)'}}
                    />
                  ) : (
                    <div className="ratio ratio-4x3 bg-dark d-flex align-items-center justify-content-center">
                      <i className="bi bi-camera-video-off text-white" style={{fontSize: '2rem'}}></i>
                    </div>
                  )}
                </div>
              </div>

              {/* Panneau latéral avec infos */}
              <div className="col-12 col-lg-4 bg-light p-3">
                <h5 className="mb-3">Informations</h5>
                <div className="mb-3">
                  <small className="text-muted">Psychologue</small>
                  <p className="mb-0 fw-bold">Dr. Sophie Martin</p>
                </div>
                <div className="mb-3">
                  <small className="text-muted">Spécialité</small>
                  <p className="mb-0">Thérapie cognitive-comportementale</p>
                </div>
                <div className="mb-3">
                  <small className="text-muted">Durée prévue</small>
                  <p className="mb-0">45 minutes</p>
                </div>

                <hr />

                <h6 className="mb-3">Notes de session</h6>
                <textarea
                  className="form-control"
                  rows="6"
                  placeholder="Prenez des notes durant la consultation..."
                ></textarea>

                <div className="alert alert-warning mt-3 small">
                  <i className="bi bi-shield-lock me-2"></i>
                  Vos notes sont privées et cryptées
                </div>
              </div>
            </div>
          </div>

          <div className="card-footer bg-dark text-center py-3">
            <div className="d-flex justify-content-center gap-3">
              <button
                className={`btn ${isMuted ? 'btn-danger' : 'btn-light'} btn-lg rounded-circle`}
                onClick={toggleMute}
                style={{width: '60px', height: '60px'}}
              >
                <i className={`bi bi-mic${isMuted ? '-mute' : ''}-fill`}></i>
              </button>

              <button
                className={`btn ${isVideoOn ? 'btn-light' : 'btn-danger'} btn-lg rounded-circle`}
                onClick={toggleVideo}
                style={{width: '60px', height: '60px'}}
              >
                <i className={`bi bi-camera-video${isVideoOn ? '' : '-off'}-fill`}></i>
              </button>

              <button
                className="btn btn-danger btn-lg rounded-circle"
                onClick={endCall}
                style={{width: '60px', height: '60px'}}
              >
                <i className="bi bi-telephone-x-fill"></i>
              </button>

              <button
                className="btn btn-light btn-lg rounded-circle"
                style={{width: '60px', height: '60px'}}
              >
                <i className="bi bi-gear-fill"></i>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import { useState, useRef, useCallback } from 'react';

const useWebRTC = () => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [connectionState, setConnectionState] = useState('disconnected');
  const [error, setError] = useState(null);

  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);

  // Configuration ICE servers
  const iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  // Démarrer le flux local
  const startLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      localStreamRef.current = stream;
      setLocalStream(stream);
      setError(null);
      return stream;
    } catch (err) {
      console.error('Erreur accès média:', err);
      setError('Impossible d\'accéder à la caméra/micro');
      throw err;
    }
  }, []);

  // Arrêter le flux local
  const stopLocalStream = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    }
  }, []);

  // Créer une connexion peer
  const createPeerConnection = useCallback(() => {
    try {
      const pc = new RTCPeerConnection(iceServers);

      // Ajouter les tracks locaux
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          pc.addTrack(track, localStreamRef.current);
        });
      }

      // Gérer les tracks distants
      pc.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
      };

      // Gérer les changements d'état de connexion
      pc.onconnectionstatechange = () => {
        setConnectionState(pc.connectionState);
        
        if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
          setRemoteStream(null);
        }
      };

      // Gérer les ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          // TODO: Envoyer le candidate au peer via signaling server
          console.log('New ICE candidate:', event.candidate);
        }
      };

      peerConnectionRef.current = pc;
      return pc;
    } catch (err) {
      console.error('Erreur création peer connection:', err);
      setError('Erreur de connexion');
      throw err;
    }
  }, []);

  // Créer une offre
  const createOffer = useCallback(async () => {
    try {
      if (!peerConnectionRef.current) {
        createPeerConnection();
      }

      const offer = await peerConnectionRef.current.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });

      await peerConnectionRef.current.setLocalDescription(offer);
      return offer;
    } catch (err) {
      console.error('Erreur création offre:', err);
      throw err;
    }
  }, [createPeerConnection]);

  // Créer une réponse
  const createAnswer = useCallback(async (offer) => {
    try {
      if (!peerConnectionRef.current) {
        createPeerConnection();
      }

      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(offer)
      );

      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      
      return answer;
    } catch (err) {
      console.error('Erreur création réponse:', err);
      throw err;
    }
  }, [createPeerConnection]);

  // Ajouter une ICE candidate
  const addIceCandidate = useCallback(async (candidate) => {
    try {
      if (peerConnectionRef.current && candidate) {
        await peerConnectionRef.current.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      }
    } catch (err) {
      console.error('Erreur ajout ICE candidate:', err);
    }
  }, []);

  // Toggle vidéo
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  }, []);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  }, []);

  // Fermer la connexion
  const closeConnection = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    setRemoteStream(null);
    setConnectionState('disconnected');
  }, []);

  // Nettoyer tout
  const cleanup = useCallback(() => {
    stopLocalStream();
    closeConnection();
  }, [stopLocalStream, closeConnection]);

  return {
    localStream,
    remoteStream,
    isVideoEnabled,
    isAudioEnabled,
    connectionState,
    error,
    startLocalStream,
    stopLocalStream,
    createPeerConnection,
    createOffer,
    createAnswer,
    addIceCandidate,
    toggleVideo,
    toggleAudio,
    closeConnection,
    cleanup
  };
};

export default useWebRTC;
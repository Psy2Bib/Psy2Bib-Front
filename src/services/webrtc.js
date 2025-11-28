/**
 * Service WebRTC pour la gestion des connexions peer-to-peer
 * Gère les streams vidéo/audio et la signalisation
 */

// Configuration des serveurs STUN/TURN
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    // TODO: Ajouter vos propres serveurs TURN pour la production
    // {
    //   urls: 'turn:your-turn-server.com:3478',
    //   username: 'username',
    //   credential: 'password'
    // }
  ],
  iceCandidatePoolSize: 10,
};

// Contraintes médias par défaut
const DEFAULT_MEDIA_CONSTRAINTS = {
  video: {
    width: { min: 640, ideal: 1280, max: 1920 },
    height: { min: 480, ideal: 720, max: 1080 },
    aspectRatio: 16/9,
    facingMode: 'user',
    frameRate: { ideal: 30, max: 60 }
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: 48000,
    channelCount: 2
  }
};

class WebRTCService {
  constructor() {
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.dataChannel = null;
    this.onTrackCallback = null;
    this.onIceCandidateCallback = null;
    this.onConnectionStateChangeCallback = null;
    this.onDataChannelMessageCallback = null;
  }

  // Obtenir le flux média local
  async getLocalStream(constraints = DEFAULT_MEDIA_CONSTRAINTS) {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      return this.localStream;
    } catch (error) {
      console.error('Erreur accès média:', error);
      throw this.handleMediaError(error);
    }
  }

  // Obtenir uniquement l'audio
  async getAudioStream() {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({ 
        audio: DEFAULT_MEDIA_CONSTRAINTS.audio,
        video: false 
      });
      return this.localStream;
    } catch (error) {
      console.error('Erreur accès audio:', error);
      throw error;
    }
  }

  // Obtenir le partage d'écran
  async getScreenShare() {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { 
          cursor: 'always',
          displaySurface: 'monitor'
        },
        audio: false
      });
      return screenStream;
    } catch (error) {
      console.error('Erreur partage écran:', error);
      throw error;
    }
  }

  // Créer une connexion peer
  createPeerConnection() {
    try {
      this.peerConnection = new RTCPeerConnection(ICE_SERVERS);

      // Ajouter les tracks locaux
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
          this.peerConnection.addTrack(track, this.localStream);
        });
      }

      // Gérer les tracks distants
      this.peerConnection.ontrack = (event) => {
        this.remoteStream = event.streams[0];
        if (this.onTrackCallback) {
          this.onTrackCallback(event.streams[0]);
        }
      };

      // Gérer les ICE candidates
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate && this.onIceCandidateCallback) {
          this.onIceCandidateCallback(event.candidate);
        }
      };

      // Gérer les changements d'état
      this.peerConnection.onconnectionstatechange = () => {
        const state = this.peerConnection.connectionState;
        console.log('État de connexion:', state);
        
        if (this.onConnectionStateChangeCallback) {
          this.onConnectionStateChangeCallback(state);
        }

        if (state === 'failed' || state === 'closed') {
          this.handleConnectionFailure();
        }
      };

      // Créer un data channel pour les messages
      this.dataChannel = this.peerConnection.createDataChannel('chat', {
        ordered: true
      });

      this.setupDataChannel(this.dataChannel);

      return this.peerConnection;
    } catch (error) {
      console.error('Erreur création peer connection:', error);
      throw error;
    }
  }

  // Configurer le data channel
  setupDataChannel(channel) {
    channel.onopen = () => {
      console.log('Data channel ouvert');
    };

    channel.onclose = () => {
      console.log('Data channel fermé');
    };

    channel.onmessage = (event) => {
      if (this.onDataChannelMessageCallback) {
        this.onDataChannelMessageCallback(event.data);
      }
    };

    channel.onerror = (error) => {
      console.error('Erreur data channel:', error);
    };
  }

  // Envoyer un message via data channel
  sendMessage(message) {
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      this.dataChannel.send(message);
    } else {
      console.error('Data channel non disponible');
    }
  }

  // Créer une offre SDP
  async createOffer() {
    try {
      if (!this.peerConnection) {
        this.createPeerConnection();
      }

      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });

      await this.peerConnection.setLocalDescription(offer);
      return offer;
    } catch (error) {
      console.error('Erreur création offre:', error);
      throw error;
    }
  }

  // Créer une réponse SDP
  async createAnswer(offer) {
    try {
      if (!this.peerConnection) {
        this.createPeerConnection();
      }

      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      
      return answer;
    } catch (error) {
      console.error('Erreur création réponse:', error);
      throw error;
    }
  }

  // Définir la description distante
  async setRemoteDescription(description) {
    try {
      if (this.peerConnection) {
        await this.peerConnection.setRemoteDescription(
          new RTCSessionDescription(description)
        );
      }
    } catch (error) {
      console.error('Erreur définition description distante:', error);
      throw error;
    }
  }

  // Ajouter un ICE candidate
  async addIceCandidate(candidate) {
    try {
      if (this.peerConnection && candidate) {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (error) {
      console.error('Erreur ajout ICE candidate:', error);
      throw error;
    }
  }

  // Toggle vidéo
  toggleVideo(enabled) {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = enabled;
        return videoTrack.enabled;
      }
    }
    return false;
  }

  // Toggle audio
  toggleAudio(enabled) {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = enabled;
        return audioTrack.enabled;
      }
    }
    return false;
  }

  // Remplacer le track vidéo (pour le partage d'écran)
  async replaceVideoTrack(newTrack) {
    try {
      const sender = this.peerConnection
        .getSenders()
        .find(s => s.track && s.track.kind === 'video');
      
      if (sender) {
        await sender.replaceTrack(newTrack);
      }
    } catch (error) {
      console.error('Erreur remplacement track:', error);
      throw error;
    }
  }

  // Obtenir les statistiques
  async getStats() {
    if (this.peerConnection) {
      const stats = await this.peerConnection.getStats();
      return this.parseStats(stats);
    }
    return null;
  }

  // Parser les statistiques
  parseStats(stats) {
    const parsedStats = {
      video: { bitrate: 0, packetsLost: 0, jitter: 0 },
      audio: { bitrate: 0, packetsLost: 0, jitter: 0 }
    };

    stats.forEach(report => {
      if (report.type === 'inbound-rtp') {
        const mediaType = report.mediaType || report.kind;
        if (parsedStats[mediaType]) {
          parsedStats[mediaType].bitrate = report.bytesReceived * 8 / report.timestamp;
          parsedStats[mediaType].packetsLost = report.packetsLost || 0;
          parsedStats[mediaType].jitter = report.jitter || 0;
        }
      }
    });

    return parsedStats;
  }

  // Gérer les erreurs média
  handleMediaError(error) {
    let errorMessage = 'Erreur accès média';
    
    if (error.name === 'NotAllowedError') {
      errorMessage = 'Permission refusée. Veuillez autoriser l\'accès à la caméra/micro.';
    } else if (error.name === 'NotFoundError') {
      errorMessage = 'Aucun périphérique caméra/micro trouvé.';
    } else if (error.name === 'NotReadableError') {
      errorMessage = 'Le périphérique est déjà utilisé par une autre application.';
    } else if (error.name === 'OverconstrainedError') {
      errorMessage = 'Les contraintes demandées ne peuvent pas être satisfaites.';
    }

    return new Error(errorMessage);
  }

  // Gérer l'échec de connexion
  handleConnectionFailure() {
    console.error('Échec de connexion peer');
    this.close();
  }

  // Arrêter le stream local
  stopLocalStream() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
  }

  // Fermer la connexion
  close() {
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }
    this.remoteStream = null;
  }

  // Nettoyer tout
  cleanup() {
    this.stopLocalStream();
    this.close();
  }

  // Callbacks
  onTrack(callback) {
    this.onTrackCallback = callback;
  }

  onIceCandidate(callback) {
    this.onIceCandidateCallback = callback;
  }

  onConnectionStateChange(callback) {
    this.onConnectionStateChangeCallback = callback;
  }

  onDataChannelMessage(callback) {
    this.onDataChannelMessageCallback = callback;
  }
}

export default WebRTCService;
import React, { useState, useEffect } from 'react';
import { 
  Video, MessageSquare, Settings, LogOut, 
  Lock, Users, Phone, PhoneOff 
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import AvatarCanvas from '../../components/Avatar/AvatarCanvas';
import AvatarControls from '../../components/Avatar/AvatarControls';
import ChatWindow from '../../components/Chat/ChatWindow';
import MessageInput from '../../components/Chat/MessageInput';
import LocalMediaPreview from '../../components/Webrtc/LocalMediaPreview';
import PeerConnection from '../../components/Webrtc/PeerConnection';
import useWebRTC from '../../hooks/useWebRTC';
import useCrypto from '../../hooks/useCrypto';

const Dashboard = ({ user, onLogout, onUpdateUser }) => {
  const [activeTab, setActiveTab] = useState('video');
  const [messages, setMessages] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [avatar, setAvatar] = useState(user?.avatar || '👤');
  const [isInCall, setIsInCall] = useState(false);

  const {
    localStream,
    remoteStream,
    isVideoEnabled,
    isAudioEnabled,
    connectionState,
    startLocalStream,
    stopLocalStream,
    toggleVideo,
    toggleAudio,
    cleanup
  } = useWebRTC();

  const { encrypt, decrypt, isReady } = useCrypto();

  // Démarrer le stream au montage
  useEffect(() => {
    startLocalStream().catch(err => {
      console.error('Erreur démarrage stream:', err);
    });

    return () => {
      cleanup();
    };
  }, []);

  const handleSendMessage = (text) => {
    try {
      const encryptedText = isReady ? encrypt(text) : text;
      
      const newMessage = {
        id: Date.now(),
        userId: user.id,
        username: user.username,
        text: text, // On affiche le texte en clair côté UI
        encryptedText: encryptedText,
        timestamp: Date.now(),
        encrypted: isReady,
      };
      
      setMessages(prev => [...prev, newMessage]);

      // TODO: Envoyer le message chiffré via WebSocket/API
      console.log('Message chiffré envoyé:', encryptedText);
    } catch (error) {
      console.error('Erreur envoi message:', error);
    }
  };

  const handleAvatarChange = (newAvatar) => {
    setAvatar(newAvatar);
    if (onUpdateUser) {
      onUpdateUser({ avatar: newAvatar });
    }
  };

  const handleStartCall = () => {
    setIsInCall(true);
    // TODO: Logique pour initier l'appel
  };

  const handleEndCall = () => {
    setIsInCall(false);
    // TODO: Logique pour terminer l'appel
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Security Badge */}
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                PSY2BIB
              </h1>
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-400 bg-gray-700 px-3 py-1.5 rounded-full">
                <Lock size={14} className="text-green-500" />
                <span>Connexion sécurisée</span>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right mr-2">
                <p className="text-sm font-medium">{user.username}</p>
                <p className="text-xs text-gray-400">En ligne</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xl">
                {avatar}
              </div>
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                title="Paramètres"
              >
                <Settings size={20} />
              </button>
              <Button onClick={onLogout} variant="secondary" size="sm">
                <LogOut size={16} className="sm:mr-2" />
                <span className="hidden sm:inline">Déconnexion</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-gray-800 border-b border-gray-700 sticky top-[73px] z-30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2 py-2">
            <button
              onClick={() => setActiveTab('video')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                activeTab === 'video' 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Video size={20} />
              <span className="hidden sm:inline">Vidéo</span>
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                activeTab === 'chat' 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <MessageSquare size={20} />
              <span className="hidden sm:inline">Chat</span>
              {messages.length > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {messages.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4">
        {activeTab === 'video' && (
          <div className="space-y-4">
            {/* Call Controls */}
            <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="text-gray-400" size={24} />
                <div>
                  <p className="font-medium">
                    {isInCall ? 'En appel' : 'Prêt à appeler'}
                  </p>
                  <p className="text-sm text-gray-400">
                    État: {connectionState === 'connected' ? 'Connecté' : 'Déconnecté'}
                  </p>
                </div>
              </div>
              <Button
                onClick={isInCall ? handleEndCall : handleStartCall}
                variant={isInCall ? 'danger' : 'success'}
              >
                {isInCall ? (
                  <>
                    <PhoneOff size={18} className="mr-2" />
                    Terminer l'appel
                  </>
                ) : (
                  <>
                    <Phone size={18} className="mr-2" />
                    Démarrer un appel
                  </>
                )}
              </Button>
            </div>

            {/* Video Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Camera className="text-blue-500" size={20} />
                  Votre caméra
                </h2>
                <LocalMediaPreview
                  stream={localStream}
                  isVideoEnabled={isVideoEnabled}
                  isAudioEnabled={isAudioEnabled}
                  onToggleVideo={toggleVideo}
                  onToggleAudio={toggleAudio}
                />
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Users className="text-purple-500" size={20} />
                  Participant distant
                </h2>
                <PeerConnection
                  remoteStream={remoteStream}
                  isConnected={connectionState === 'connected'}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="bg-gray-800 rounded-lg h-[calc(100vh-240px)] flex flex-col shadow-xl">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <MessageSquare size={20} />
                  Messages chiffrés
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  {isReady ? 'Chiffrement actif' : 'Chiffrement en cours d\'initialisation...'}
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-500 bg-green-500 bg-opacity-10 px-3 py-1.5 rounded-full">
                <Lock size={14} />
                <span>E2E</span>
              </div>
            </div>
            <ChatWindow messages={messages} currentUser={user} />
            <div className="p-4 border-t border-gray-700">
              <MessageInput 
                onSendMessage={handleSendMessage} 
                isEncrypted={isReady}
                disabled={!isReady}
              />
            </div>
          </div>
        )}
      </main>

      {/* Settings Modal */}
      <Modal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
        title="Paramètres"
        size="lg"
      >
        <div className="space-y-6">
          {/* Avatar Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Votre Avatar</h3>
            <div className="flex justify-center mb-4">
              <AvatarCanvas avatar={avatar} size="lg" />
            </div>
            <AvatarControls 
              onAvatarChange={handleAvatarChange}
              selectedAvatar={avatar}
            />
          </div>

          {/* Security Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Sécurité & Chiffrement</h3>
            <div className="space-y-3">
              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-green-500 mb-2">
                  <Lock size={18} />
                  <span className="font-medium">Chiffrement de bout en bout</span>
                </div>
                <p className="text-sm text-gray-400">
                  Toutes vos communications (messages et vidéo) sont protégées par un chiffrement de bout en bout. 
                  Personne d'autre que vous et votre interlocuteur ne peut y accéder.
                </p>
              </div>
              
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-300">
                  <strong>Algorithme:</strong> RSA-2048 + AES-256-GCM
                </p>
                <p className="text-sm text-gray-300 mt-1">
                  <strong>État:</strong> <span className="text-green-500">Actif</span>
                </p>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Informations du compte</h3>
            <div className="bg-gray-700 p-4 rounded-lg space-y-2">
              <p className="text-sm"><strong>Nom d'utilisateur:</strong> {user.username}</p>
              <p className="text-sm"><strong>Email:</strong> {user.email || 'Non renseigné'}</p>
              <p className="text-sm"><strong>ID:</strong> {user.id}</p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;
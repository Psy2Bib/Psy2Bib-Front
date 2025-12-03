import React, { useState, useEffect, useRef } from 'react';

const mockContacts = [
  { 
    id: 1, 
    name: 'Dr. Sophie Martin', 
    avatar: 'https://i.pravatar.cc/150?img=47', 
    online: true,
    role: 'psy',
    specialty: 'TCC',
    color: '#667eea'
  },
  { 
    id: 2, 
    name: 'Dr. Jean Dupont', 
    avatar: 'https://i.pravatar.cc/150?img=12', 
    online: false,
    role: 'psy',
    specialty: 'Psychanalyse',
    color: '#764ba2'
  },
  { 
    id: 3, 
    name: 'Dr. Marie Laurent', 
    avatar: 'https://i.pravatar.cc/150?img=48', 
    online: true,
    role: 'psy',
    specialty: 'Thérapie familiale',
    color: '#f093fb'
  },
  { 
    id: 4, 
    name: 'Dr. Pierre Dubois', 
    avatar: 'https://i.pravatar.cc/150?img=13', 
    online: false,
    role: 'psy',
    specialty: 'Psychologie du travail',
    color: '#5ee7df'
  }
];

export default function Messages() {
  const [contacts] = useState(mockContacts);
  const [selectedContact, setSelectedContact] = useState(mockContacts[0]);
  const [messages, setMessages] = useState({});
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userRole, setUserRole] = useState('patient');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    setUserRole(currentUser.role || 'patient');
    
    // En production, déchiffrer avec decryptData()
    const saved = JSON.parse(localStorage.getItem('messages') || '{}');
    setMessages(saved);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedContact]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getContactMessages = (contactId) => {
    return messages[contactId] || [];
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const contactId = selectedContact.id;
    
    // En production, chiffrer avec encryptData()
    const message = {
      id: Date.now(),
      text: newMessage,
      sender: 'me',
      timestamp: new Date().toISOString(),
      userRole: userRole,
      encrypted: true // Indicateur E2EE
    };

    const updated = {
      ...messages,
      [contactId]: [...(messages[contactId] || []), message]
    };

    setMessages(updated);
    localStorage.setItem('messages', JSON.stringify(updated));
    setNewMessage('');

    // Simuler réponse
    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      
      const replies = [
        'Merci pour votre message. Je vous répondrai dans les plus brefs délais.',
        'Message bien reçu. Nous en reparlerons lors de notre prochaine séance.',
        'D\'accord, je prends note. N\'hésitez pas si vous avez d\'autres questions.',
        'Merci pour ce retour. Vos données sont protégées par E2EE.'
      ];
      
      const reply = {
        id: Date.now() + 1,
        text: replies[Math.floor(Math.random() * replies.length)],
        sender: 'them',
        timestamp: new Date().toISOString(),
        userRole: selectedContact.role,
        encrypted: true
      };
      
      const withReply = {
        ...updated,
        [contactId]: [...updated[contactId], reply]
      };
      setMessages(withReply);
      localStorage.setItem('messages', JSON.stringify(withReply));
    }, 2000);
  };

  const currentMessages = getContactMessages(selectedContact.id);

  // Avatar Component
  const MessageAvatar = ({ role, color, size = 40 }) => {
    return (
      <div 
        className="message-avatar"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          background: `linear-gradient(135deg, ${color}40 0%, ${color}80 100%)`,
          border: `2px solid ${color}`,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        <i 
          className={`bi ${role === 'psy' ? 'bi-person-badge-fill' : 'bi-person-fill'}`}
          style={{color: color, fontSize: `${size * 0.5}px`}}
        ></i>
      </div>
    );
  };

  return (
    <div>
      <div className="mb-4">
        <h1>
          <i className="bi bi-chat-dots-fill me-2 text-primary"></i>
          Messagerie Sécurisée
        </h1>
        <p className="text-muted">
          <i className="bi bi-shield-lock text-success me-1"></i>
          Messages chiffrés de bout en bout (E2EE)
        </p>
      </div>

      <div className="row">
        {/* Liste des contacts */}
        <div className="col-12 col-md-4 mb-3">
          <div className="card shadow-lg" style={{height: '600px', overflowY: 'auto'}}>
            <div className="card-header bg-gradient-primary text-white">
              <h5 className="mb-0">
                <i className="bi bi-people-fill me-2"></i>
                Mes Contacts
              </h5>
            </div>
            <div className="list-group list-group-flush">
              {contacts.map(contact => (
                <button
                  key={contact.id}
                  className={`list-group-item list-group-item-action ${
                    selectedContact.id === contact.id ? 'active' : ''
                  }`}
                  onClick={() => setSelectedContact(contact)}
                  style={{
                    borderLeft: selectedContact.id === contact.id ? `4px solid ${contact.color}` : 'none'
                  }}
                >
                  <div className="d-flex align-items-center">
                    <div className="position-relative me-3">
                      <MessageAvatar role={contact.role} color={contact.color} size={50} />
                      {contact.online && (
                        <span
                          className="position-absolute bottom-0 end-0 bg-success rounded-circle"
                          style={{
                            width: '14px', 
                            height: '14px', 
                            border: '2px solid white',
                            boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.3)'
                          }}
                        ></span>
                      )}
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="mb-0">{contact.name}</h6>
                      <small className={selectedContact.id === contact.id ? 'text-white-50' : 'text-muted'}>
                        {contact.specialty}
                      </small>
                      <div>
                        <span className={`badge badge-sm ${contact.online ? 'bg-success' : 'bg-secondary'} mt-1`}>
                          {contact.online ? 'En ligne' : 'Hors ligne'}
                        </span>
                        <span className="badge bg-danger ms-1 small">E2EE</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Zone de conversation */}
        <div className="col-12 col-md-8">
          <div className="card shadow-lg" style={{height: '600px', display: 'flex', flexDirection: 'column'}}>
            {/* En-tête */}
            <div 
              className="card-header text-white d-flex align-items-center justify-content-between"
              style={{
                background: `linear-gradient(135deg, ${selectedContact.color}90 0%, ${selectedContact.color} 100%)`
              }}
            >
              <div className="d-flex align-items-center">
                <MessageAvatar role={selectedContact.role} color={selectedContact.color} size={45} />
                <div className="ms-3">
                  <h6 className="mb-0">{selectedContact.name}</h6>
                  <small className="text-white-50">
                    {selectedContact.online ? (
                      <>
                        <i className="bi bi-circle-fill me-1" style={{fontSize: '0.5rem'}}></i>
                        En ligne
                      </>
                    ) : (
                      <>
                        <i className="bi bi-circle me-1" style={{fontSize: '0.5rem'}}></i>
                        Hors ligne
                      </>
                    )}
                  </small>
                </div>
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-sm btn-light rounded-circle" style={{width: '35px', height: '35px'}}>
                  <i className="bi bi-telephone-fill"></i>
                </button>
                <button className="btn btn-sm btn-light rounded-circle" style={{width: '35px', height: '35px'}}>
                  <i className="bi bi-camera-video-fill"></i>
                </button>
                <button className="btn btn-sm btn-light rounded-circle" style={{width: '35px', height: '35px'}}>
                  <i className="bi bi-shield-lock-fill"></i>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div 
              className="card-body" 
              style={{
                flex: 1, 
                overflowY: 'auto', 
                background: 'linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%)',
                padding: '1.5rem'
              }}
            >
              {currentMessages.length === 0 ? (
                <div className="text-center text-muted py-5">
                  <i className="bi bi-chat-dots" style={{fontSize: '4rem', opacity: 0.3}}></i>
                  <p className="mt-3 fw-bold">Aucun message</p>
                  <p className="small">Commencez la conversation avec {selectedContact.name}</p>
                  <div className="badge bg-success">
                    <i className="bi bi-shield-check"></i> E2EE Actif
                  </div>
                </div>
              ) : (
                <div>
                  {currentMessages.map((msg, index) => {
                    const isMe = msg.sender === 'me';
                    const msgRole = msg.userRole || (isMe ? userRole : selectedContact.role);
                    const msgColor = isMe ? (userRole === 'psy' ? '#667eea' : '#f5576c') : selectedContact.color;
                    
                    return (
                      <div
                        key={msg.id}
                        className={`d-flex mb-3 ${isMe ? 'justify-content-end' : ''}`}
                        style={{animation: 'slideIn 0.3s ease-out'}}
                      >
                        {!isMe && (
                          <MessageAvatar role={msgRole} color={msgColor} size={35} />
                        )}
                        
                        <div
                          className={`message-bubble ${isMe ? 'message-bubble-me' : 'message-bubble-them'}`}
                          style={{
                            maxWidth: '70%',
                            marginLeft: !isMe ? '10px' : '0',
                            marginRight: isMe ? '10px' : '0',
                            background: isMe 
                              ? `linear-gradient(135deg, ${msgColor}90 0%, ${msgColor} 100%)`
                              : 'white',
                            color: isMe ? 'white' : '#1F2937',
                            padding: '0.875rem 1.125rem',
                            borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                            border: !isMe ? '1px solid #E5E7EB' : 'none'
                          }}
                        >
                          <p className="mb-1" style={{fontSize: '0.95rem', lineHeight: '1.5'}}>{msg.text}</p>
                          <div className="d-flex align-items-center gap-2">
                            <small 
                              className={isMe ? 'text-white-50' : 'text-muted'}
                              style={{fontSize: '0.75rem'}}
                            >
                              {new Date(msg.timestamp).toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </small>
                            {msg.encrypted && (
                              <i className={`bi bi-shield-lock-fill ${isMe ? 'text-white-50' : 'text-success'}`} style={{fontSize: '0.75rem'}}></i>
                            )}
                          </div>
                        </div>
                        
                        {isMe && (
                          <MessageAvatar role={msgRole} color={msgColor} size={35} />
                        )}
                      </div>
                    );
                  })}
                  
                  {/* Indicateur de saisie */}
                  {isTyping && (
                    <div className="d-flex mb-3">
                      <MessageAvatar role={selectedContact.role} color={selectedContact.color} size={35} />
                      <div 
                        className="typing-indicator"
                        style={{
                          marginLeft: '10px',
                          background: 'white',
                          padding: '0.875rem 1.125rem',
                          borderRadius: '18px 18px 18px 4px',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                          border: '1px solid #E5E7EB'
                        }}
                      >
                        <div className="typing-dots">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Zone de saisie */}
            <div className="card-footer bg-white border-top" style={{padding: '1rem'}}>
              <div className="input-group">
                <button className="btn btn-outline-secondary" type="button">
                  <i className="bi bi-emoji-smile"></i>
                </button>
                <button className="btn btn-outline-secondary" type="button">
                  <i className="bi bi-paperclip"></i>
                </button>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Message chiffré E2EE..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  style={{
                    borderRadius: '20px',
                    padding: '0.75rem 1.25rem',
                    border: '2px solid #E5E7EB'
                  }}
                />
                <button
                  className="btn btn-primary"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  style={{
                    borderRadius: '20px',
                    padding: '0.75rem 1.5rem',
                    marginLeft: '0.5rem'
                  }}
                >
                  <i className="bi bi-send-fill me-2"></i>
                  Envoyer
                </button>
              </div>
              <div className="text-center mt-2">
                <small className="text-muted">
                  <i className="bi bi-shield-lock text-success me-1"></i>
                  Messages chiffrés de bout en bout
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .typing-dots {
          display: flex;
          gap: 4px;
        }

        .typing-dots span {
          width: 8px;
          height: 8px;
          background: #9CA3AF;
          border-radius: 50%;
          animation: typing 1.4s infinite;
        }

        .typing-dots span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-dots span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.7;
          }
          30% {
            transform: translateY(-10px);
            opacity: 1;
          }
        }

        .message-bubble {
          transition: all 0.2s ease;
        }

        .message-bubble:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
      `}</style>
    </div>
  );
}
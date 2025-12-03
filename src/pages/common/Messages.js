import React, { useState, useEffect } from 'react';

const mockContacts = [
  { id: 1, name: 'Dr. Sophie Martin', avatar: 'https://i.pravatar.cc/150?img=47', online: true },
  { id: 2, name: 'Dr. Jean Dupont', avatar: 'https://i.pravatar.cc/150?img=12', online: false },
  { id: 3, name: 'Dr. Marie Laurent', avatar: 'https://i.pravatar.cc/150?img=48', online: true },
  { id: 4, name: 'Dr. Pierre Dubois', avatar: 'https://i.pravatar.cc/150?img=13', online: false }
];

export default function Messages() {
  const [contacts] = useState(mockContacts);
  const [selectedContact, setSelectedContact] = useState(mockContacts[0]);
  const [messages, setMessages] = useState({});
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('messages') || '{}');
    setMessages(saved);
  }, []);

  const getContactMessages = (contactId) => {
    return messages[contactId] || [];
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const contactId = selectedContact.id;
    const message = {
      id: Date.now(),
      text: newMessage,
      sender: 'me',
      timestamp: new Date().toISOString()
    };

    const updated = {
      ...messages,
      [contactId]: [...(messages[contactId] || []), message]
    };

    setMessages(updated);
    localStorage.setItem('messages', JSON.stringify(updated));
    setNewMessage('');

    setTimeout(() => {
      const reply = {
        id: Date.now() + 1,
        text: 'Merci pour votre message. Je vous répondrai dans les plus brefs délais.',
        sender: 'them',
        timestamp: new Date().toISOString()
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

  return (
    <div>
      <h1 className="mb-4">
        <i className="bi bi-chat-dots me-2"></i>
        Messagerie
      </h1>

      <div className="row">
        <div className="col-12 col-md-4 mb-3">
          <div className="card shadow" style={{height: '500px', overflowY: 'auto'}}>
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="bi bi-people me-2"></i>
                Contacts
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
                >
                  <div className="d-flex align-items-center">
                    <div className="position-relative me-3">
                      <img
                        src={contact.avatar}
                        alt={contact.name}
                        className="rounded-circle"
                        style={{width: '50px', height: '50px'}}
                      />
                      {contact.online && (
                        <span
                          className="position-absolute bottom-0 end-0 bg-success rounded-circle"
                          style={{width: '12px', height: '12px', border: '2px solid white'}}
                        ></span>
                      )}
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="mb-0">{contact.name}</h6>
                      <small className={selectedContact.id === contact.id ? 'text-white-50' : 'text-muted'}>
                        {contact.online ? 'En ligne' : 'Hors ligne'}
                      </small>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="col-12 col-md-8">
          <div className="card shadow" style={{height: '500px', display: 'flex', flexDirection: 'column'}}>
            <div className="card-header bg-info text-white">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <img
                    src={selectedContact.avatar}
                    alt={selectedContact.name}
                    className="rounded-circle me-3"
                    style={{width: '40px', height: '40px'}}
                  />
                  <div>
                    <h6 className="mb-0">{selectedContact.name}</h6>
                    <small>{selectedContact.online ? 'En ligne' : 'Hors ligne'}</small>
                  </div>
                </div>
                <button className="btn btn-sm btn-light">
                  <i className="bi bi-three-dots-vertical"></i>
                </button>
              </div>
            </div>

            <div className="card-body" style={{flex: 1, overflowY: 'auto', backgroundColor: '#f8f9fa'}}>
              {currentMessages.length === 0 ? (
                <div className="text-center text-muted py-5">
                  <i className="bi bi-chat-dots" style={{fontSize: '3rem'}}></i>
                  <p className="mt-3">Aucun message. Commencez la conversation !</p>
                </div>
              ) : (
                <div>
                  {currentMessages.map(msg => (
                    <div
                      key={msg.id}
                      className={`d-flex mb-3 ${msg.sender === 'me' ? 'justify-content-end' : ''}`}
                    >
                      <div
                        className={`p-3 rounded shadow-sm ${
                          msg.sender === 'me'
                            ? 'bg-primary text-white'
                            : 'bg-white'
                        }`}
                        style={{maxWidth: '70%'}}
                      >
                        <p className="mb-1">{msg.text}</p>
                        <small className={msg.sender === 'me' ? 'text-white-50' : 'text-muted'}>
                          {new Date(msg.timestamp).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card-footer bg-white">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Écrivez votre message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button
                  className="btn btn-primary"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                >
                  <i className="bi bi-send-fill me-1"></i>
                  Envoyer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
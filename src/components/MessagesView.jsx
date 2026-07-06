import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Phone, Video, Send, Search, Circle, Smile } from 'lucide-react';

export default function MessagesView() {
  const { 
    conversations, 
    fetchConversations, 
    activeChatContact, 
    selectContact, 
    chatMessages, 
    sendChatMessage, 
    onlineUsers,
    initiateCall 
  } = useApp();
  
  const { user, token } = useAuth();
  
  const [typedMessage, setTypedMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const chatBottomRef = useRef(null);

  // Auto-fetch conversations on mount
  useEffect(() => {
    fetchConversations();
  }, [token]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;
    
    sendChatMessage(typedMessage.trim());
    setTypedMessage('');
  };

  const handleStartCall = (type) => {
    if (!activeChatContact) return;
    initiateCall(activeChatContact.id, activeChatContact.name, activeChatContact.avatar, type);
  };

  // Filter conversations by search term
  const filteredConversations = conversations.filter(c => 
    c.contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="glass-panel animate-fade-in" style={{
      display: 'flex',
      width: '100%',
      maxWidth: '900px',
      height: 'calc(100vh - 110px)',
      overflow: 'hidden',
      borderRadius: 'var(--radius-lg)'
    }}>
      
      {/* Left Pane - Contact List */}
      <div style={{
        width: '320px',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}>
        {/* Search */}
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ position: 'relative' }}>
            <Search 
              size={16} 
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-secondary)'
              }}
            />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search chat users..." 
              style={{ paddingLeft: '36px', borderRadius: 'var(--radius-full)' }}
            />
          </div>
        </div>

        {/* Conversations Scroll List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          {filteredConversations.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              No chats found
            </div>
          ) : (
            filteredConversations.map(c => {
              const isSelected = activeChatContact?.id === c.contact.id;
              const isOnline = onlineUsers.has(c.contact.id);
              
              return (
                <div
                  key={c.contact.id}
                  onClick={() => selectContact(c.contact)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    background: isSelected ? 'var(--bg-input)' : 'transparent',
                    transition: 'background var(--transition-fast)',
                    position: 'relative'
                  }}
                  className={isSelected ? '' : 'sidebar-btn-hover'}
                >
                  {/* Contact Avatar + Status dot */}
                  <div style={{ position: 'relative' }}>
                    {c.contact.avatar ? (
                      <img 
                        src={c.contact.avatar} 
                        style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-full)', objectFit: 'cover' }} 
                        alt={c.contact.name} 
                      />
                    ) : (
                      <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--accent-gradient)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700
                      }}>
                        {c.contact.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    
                    {/* Online status green dot */}
                    {isOnline && (
                      <div style={{
                        position: 'absolute',
                        bottom: '2px',
                        right: '2px',
                        width: '12px',
                        height: '12px',
                        borderRadius: 'var(--radius-full)',
                        background: '#10b981',
                        border: '2px solid var(--bg-secondary)'
                      }} />
                    )}
                  </div>

                  {/* Message Preview details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{c.contact.name}</span>
                    </div>
                    <p style={{
                      fontSize: '0.8rem',
                      color: c.unreadCount > 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
                      fontWeight: c.unreadCount > 0 ? 700 : 400,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {c.lastMessage}
                    </p>
                  </div>

                  {/* Unread badge */}
                  {c.unreadCount > 0 && (
                    <span style={{
                      background: 'var(--accent-gradient)',
                      color: 'white',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-full)',
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)'
                    }}>
                      {c.unreadCount}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Pane - Chat Window */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-secondary)',
        height: '100%'
      }}>
        {activeChatContact ? (
          <>
            {/* Header info / Call triggers */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 24px',
              borderBottom: '1px solid var(--border-color)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {activeChatContact.avatar ? (
                  <img src={activeChatContact.avatar} style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-full)', objectFit: 'cover' }} alt={activeChatContact.name} />
                ) : (
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--accent-gradient)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700
                  }}>
                    {activeChatContact.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{activeChatContact.name}</h4>
                  <span style={{ fontSize: '0.75rem', color: onlineUsers.has(activeChatContact.id) ? '#10b981' : 'var(--text-secondary)', fontWeight: 600 }}>
                    {onlineUsers.has(activeChatContact.id) ? 'Online now' : 'Offline'}
                  </span>
                </div>
              </div>

              {/* Call Controls */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleStartCall('voice')}
                  className="btn-circle btn-text"
                  title="Start Audio Call"
                >
                  <Phone size={18} style={{ color: 'var(--accent-color)' }} />
                </button>
                <button
                  onClick={() => handleStartCall('video')}
                  className="btn-circle btn-text"
                  title="Start Video Call"
                >
                  <Video size={18} style={{ color: 'var(--accent-color)' }} />
                </button>
              </div>
            </div>

            {/* Live Message History Scroll */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {chatMessages.map(msg => {
                const isSelf = msg.senderId === user.id;
                
                return (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      justifyContent: isSelf ? 'flex-end' : 'flex-start',
                      width: '100%'
                    }}
                  >
                    <div style={{
                      background: isSelf ? 'var(--accent-gradient)' : 'var(--bg-input)',
                      color: isSelf ? 'white' : 'var(--text-primary)',
                      padding: '10px 16px',
                      borderRadius: isSelf 
                        ? '18px 18px 4px 18px' 
                        : '18px 18px 18px 4px',
                      maxWidth: '70%',
                      fontSize: '0.95rem',
                      lineHeight: '1.4',
                      boxShadow: 'var(--shadow-sm)',
                      wordBreak: 'break-word'
                    }}>
                      {msg.content}
                    </div>
                  </div>
                );
              })}
              <div ref={chatBottomRef} />
            </div>

            {/* Input message form footer */}
            <form onSubmit={handleSendMessage} style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              gap: '12px',
              alignItems: 'center'
            }}>
              <button type="button" className="btn-circle btn-text">
                <Smile size={20} />
              </button>
              
              <input
                type="text"
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
                placeholder="Type your message here..."
                style={{
                  flex: 1,
                  borderRadius: 'var(--radius-full)',
                  padding: '10px 20px'
                }}
              />

              <button
                type="submit"
                disabled={!typedMessage.trim()}
                className="btn-circle btn-primary"
                style={{ width: '42px', height: '42px', flexShrink: 0 }}
              >
                <Send size={16} />
              </button>
            </form>
          </>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            gap: '16px',
            color: 'var(--text-secondary)'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-input)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-color)'
            }}>
              <Smile size={36} />
            </div>
            <h3>Select a contact to begin chatting</h3>
            <p style={{ fontSize: '0.85rem' }}>Start audio or video calls directly once in a conversation.</p>
          </div>
        )}
      </div>

    </div>
  );
}

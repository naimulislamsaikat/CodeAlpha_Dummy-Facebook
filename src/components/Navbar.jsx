import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Sun, Moon, Search, LogOut, MessageSquare, Compass, User } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { darkMode, setDarkMode, navigateToTab, conversations } = useApp();

  const totalUnread = conversations.reduce((acc, curr) => acc + (curr.unreadCount || 0), 0);

  return (
    <nav className="glass-panel" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 24px',
      borderRadius: '0',
      borderLeft: 'none',
      borderRight: 'none',
      borderTop: 'none',
      zIndex: 200,
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '64px'
    }}>
      {/* Brand logo */}
      <div 
        onClick={() => navigateToTab('feed')} 
        style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
      >
        <span 
          className="gradient-text" 
          style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em' }}
        >
          SocialAlpha
        </span>
      </div>

      {/* Search Input */}
      <div style={{ position: 'relative', width: '320px', display: 'none', md: 'block' }} className="nav-search-bar">
        <Search 
          size={18} 
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
          placeholder="Search creators, pages, tags..." 
          style={{ paddingLeft: '38px', borderRadius: 'var(--radius-full)' }}
        />
      </div>

      {/* Nav Options */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Tab icons */}
        <button 
          className="btn-circle btn-text" 
          onClick={() => navigateToTab('reels')}
          title="Watch Reels"
        >
          <Compass size={20} />
        </button>

        <button 
          className="btn-circle btn-text" 
          onClick={() => navigateToTab('messages')}
          title="Chat Messages"
          style={{ position: 'relative' }}
        >
          <MessageSquare size={20} />
          {totalUnread > 0 && (
            <span style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              background: 'var(--accent-gradient)',
              color: 'white',
              fontSize: '0.65rem',
              fontWeight: 700,
              width: '18px',
              height: '18px',
              borderRadius: 'var(--radius-full)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid var(--bg-secondary)'
            }}>
              {totalUnread}
            </span>
          )}
        </button>

        {/* Theme Toggle */}
        <button 
          className="btn-circle btn-text" 
          onClick={() => setDarkMode(!darkMode)}
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* User shortcut */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderLeft: '1px solid var(--border-color)', paddingLeft: '14px' }}>
            <div 
              onClick={() => navigateToTab('profile', user.id)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
            >
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-full)', objectFit: 'cover' }}
                />
              ) : (
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--accent-gradient)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: '0.85rem'
                }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span style={{ fontSize: '0.9rem', fontWeight: 600, display: 'none', sm: 'inline' }} className="user-nav-name">
                {user.name.split(' ')[0]}
              </span>
            </div>
            
            <button 
              className="btn-circle btn-text" 
              onClick={logout}
              title="Sign Out"
              style={{ color: '#ef4444' }}
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

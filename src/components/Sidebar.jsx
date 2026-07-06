import React from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Home, Tv, Film, MessageSquare, Flag, User, LayoutGrid } from 'lucide-react';

export default function Sidebar() {
  const { activeTab, navigateToTab, conversations } = useApp();
  const { user } = useAuth();

  const totalUnread = conversations.reduce((acc, curr) => acc + (curr.unreadCount || 0), 0);

  const menuItems = [
    { id: 'feed', name: 'Home Feed', icon: Home },
    { id: 'reels', name: 'Short Reels', icon: Film },
    { id: 'watch', name: 'Watch Videos', icon: Tv },
    { 
      id: 'messages', 
      name: 'Messages', 
      icon: MessageSquare,
      badge: totalUnread > 0 ? totalUnread : null
    },
    { id: 'pages', name: 'Commercial Pages', icon: Flag },
    { id: 'profile', name: 'My Profile', icon: User, targetId: user?.id }
  ];

  return (
    <aside className="glass-panel sidebar-container" style={{
      width: '260px',
      borderRadius: '0',
      borderLeft: 'none',
      borderTop: 'none',
      borderBottom: 'none',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      height: 'calc(100vh - 64px)',
      position: 'sticky',
      top: '64px',
      flexShrink: 0
    }}>
      <div style={{
        padding: '8px 12px 16px 12px',
        color: 'var(--text-secondary)',
        fontSize: '0.8rem',
        fontWeight: 700,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <LayoutGrid size={14} /> Menu Directory
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id || (item.id === 'profile' && activeTab === 'profile');
          
          return (
            <button
              key={item.id}
              onClick={() => navigateToTab(item.id, item.targetId)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: '12px',
                background: isActive ? 'var(--accent-gradient)' : 'transparent',
                color: isActive ? 'white' : 'var(--text-secondary)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.95rem',
                transition: 'all var(--transition-fast)',
                position: 'relative'
              }}
              className={isActive ? '' : 'sidebar-btn-hover'}
            >
              <Icon size={18} />
              <span>{item.name}</span>

              {item.badge && (
                <span style={{
                  position: 'absolute',
                  right: '16px',
                  background: isActive ? 'white' : 'var(--accent-gradient)',
                  color: isActive ? 'var(--accent-color)' : 'white',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)'
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {user && (
        <div style={{
          marginTop: 'auto',
          padding: '12px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-input)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          border: '1px solid var(--border-color)'
        }}>
          {user.avatar ? (
            <img 
              src={user.avatar} 
              alt={user.name} 
              style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-full)', objectFit: 'cover' }}
            />
          ) : (
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--accent-gradient)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600
            }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.name}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Verified Client
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

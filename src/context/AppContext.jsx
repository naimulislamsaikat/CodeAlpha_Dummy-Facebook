import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const { token, user } = useAuth();
  
  // Navigation & UI States
  const [activeTab, setActiveTab] = useState('feed'); // 'feed', 'reels', 'watch', 'messages', 'pages', 'profile', 'page-detail'
  const [selectedPageId, setSelectedPageId] = useState(null);
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true' || 
      (!('darkMode' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Database / State Cache
  const [feedPosts, setFeedPosts] = useState([]);
  const [reels, setReels] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [activeChatContact, setActiveChatContact] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [conversations, setConversations] = useState([]);

  // Calling System State
  // activeCall can be null, or:
  // { type: 'voice'|'video', state: 'dialing'|'ringing'|'connected', partnerId, partnerName, partnerAvatar, isIncoming: bool }
  const [activeCall, setActiveCall] = useState(null);

  // WebSockets Ref
  const wsRef = useRef(null);
  // Ref mirror of activeChatContact to avoid re-creating WS on contact change
  const activeChatContactRef = useRef(null);
  const activeCallRef = useRef(null);

  // Apply dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  // WebSocket Connection Lifecycle
  useEffect(() => {
    activeCallRef.current = activeCall;
  }, [activeCall]);

  useEffect(() => {
    if (!token || !user) {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setOnlineUsers(new Set());
      return;
    }

    // Connect to WebSocket server.
    // In dev mode the frontend is served from Vite on 5173, while the backend runs on 5000.
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = import.meta.env.DEV ? '127.0.0.1:5000' : window.location.host;
    const wsUrl = `${protocol}//${wsHost}`;

    console.log('Connecting WebSockets to:', wsUrl);
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      // Authenticate socket connection
      ws.send(JSON.stringify({ type: 'auth', token }));
    };

    ws.onerror = (error) => {
      console.error('WebSocket connection error:', error);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // 1. Presence Sync
        if (data.type === 'presence') {
          setOnlineUsers(prev => {
            const next = new Set(prev);
            if (data.isOnline) {
              next.add(data.userId);
            } else {
              next.delete(data.userId);
            }
            return next;
          });
        }

        // 2. Incoming Chat Messages
        if (data.type === 'chat-message') {
          const msg = data.message;
          // Use ref to avoid stale closure - check if sender is our active contact
          const currentContact = activeChatContactRef.current;
          if (currentContact && (msg.senderId === currentContact.id || msg.receiverId === currentContact.id)) {
            setChatMessages(prev => [...prev, msg]);
          }
          // Refresh conversations list to update unread badge / sorting
          fetchConversations();
        }

        if (data.type === 'chat-message-sent') {
          const msg = data.message;
          setChatMessages(prev => [...prev, msg]);
          fetchConversations();
        }

        // 3. Call Signaling Signals
        if (data.type === 'call-user') {
          // If already in a call, reject automatically (busy)
          if (activeCallRef.current) {
            ws.send(JSON.stringify({
              type: 'call-rejected',
              targetId: data.fromId
            }));
            return;
          }
          // Query user details of caller
          fetch(`/api/users/profile/${data.fromId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          .then(res => res.json())
          .then(caller => {
            setActiveCall({
              type: data.callType || 'video',
              state: 'ringing',
              partnerId: caller.id,
              partnerName: caller.name,
              partnerAvatar: caller.avatar,
              isIncoming: true
            });
          });
        }

        if (data.type === 'call-accepted') {
          setActiveCall(prev => {
            if (!prev) return null;
            return { ...prev, state: 'connected' };
          });
        }

        if (data.type === 'call-rejected' || data.type === 'call-failed') {
          alert(data.reason || 'Call rejected or user busy');
          setActiveCall(null);
        }

        if (data.type === 'call-hungup') {
          setActiveCall(null);
        }

      } catch (err) {
        console.error('WebSocket message parse error:', err);
      }
    };

    ws.onclose = () => {
      console.log('WebSockets connection closed');
    };

    return () => {
      ws.close();
    };
  }, [token, user]);

  // Load Feed Posts
  const fetchFeedPosts = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/posts/feed', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const posts = await res.json();
        setFeedPosts(posts);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Load Reels
  const fetchReels = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/reels', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const items = await res.json();
        setReels(items);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Load Conversational Chats
  const fetchConversations = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/messages/conversations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const list = await res.json();
        setConversations(list);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Select Chat Room Contact
  const selectContact = async (contact) => {
    setActiveChatContact(contact);
    activeChatContactRef.current = contact;
    if (!token) return;
    try {
      const res = await fetch(`/api/messages/history/${contact.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const messages = await res.json();
        setChatMessages(messages);
      }
      // Refresh list to clear unread indicator
      fetchConversations();
    } catch (e) {
      console.error(e);
    }
  };

  // Send Direct Message
  const sendChatMessage = (content) => {
    if (!activeChatContact || !content.trim() || !wsRef.current) return;
    wsRef.current.send(JSON.stringify({
      type: 'chat-message',
      receiverId: activeChatContact.id,
      content: content.trim()
    }));
  };

  // --- Call Control Actions ---
  const initiateCall = (partnerId, partnerName, partnerAvatar, type = 'video') => {
    if (!wsRef.current) return;
    
    // Set dialing state locally
    setActiveCall({
      type,
      state: 'dialing',
      partnerId,
      partnerName,
      partnerAvatar,
      isIncoming: false
    });

    // Notify receiver
    wsRef.current.send(JSON.stringify({
      type: 'call-user',
      targetId: partnerId,
      callType: type
    }));
  };

  const acceptCall = () => {
    if (!activeCall || !wsRef.current) return;
    
    setActiveCall(prev => ({ ...prev, state: 'connected' }));
    
    wsRef.current.send(JSON.stringify({
      type: 'call-accepted',
      targetId: activeCall.partnerId
    }));
  };

  const rejectCall = () => {
    if (!activeCall || !wsRef.current) return;
    
    wsRef.current.send(JSON.stringify({
      type: 'call-rejected',
      targetId: activeCall.partnerId,
      reason: 'Call declined'
    }));

    setActiveCall(null);
  };

  const hangupCall = () => {
    if (!activeCall || !wsRef.current) return;
    
    wsRef.current.send(JSON.stringify({
      type: 'call-hungup',
      targetId: activeCall.partnerId
    }));

    setActiveCall(null);
  };

  // Change tabs / clear routing states
  const navigateToTab = (tab, targetId = null) => {
    setActiveTab(tab);
    if (tab === 'page-detail') {
      setSelectedPageId(targetId);
    } else if (tab === 'profile') {
      setSelectedProfileId(targetId || user?.id);
    } else {
      setSelectedPageId(null);
      setSelectedProfileId(null);
    }
  };

  // Handle Likes
  const toggleLikePost = async (postId, isReel = false) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/posts/like/${postId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Update local arrays for snappy updates
        const updateItem = (item) => {
          if (item.id === postId) {
            return { ...item, liked: data.liked, likesCount: data.likesCount };
          }
          return item;
        };

        if (isReel) {
          setReels(prev => prev.map(updateItem));
        } else {
          setFeedPosts(prev => prev.map(updateItem));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Delete Post
  const deletePost = async (postId) => {
    if (!token) return;
    // Optimistic update - remove immediately from UI
    setFeedPosts(prev => prev.filter(p => p.id !== postId));
    setReels(prev => prev.filter(p => p.id !== postId));
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        // If deletion failed, reload posts to restore state
        console.error('Delete failed, reloading posts...');
        fetchFeedPosts();
      }
    } catch (e) {
      console.error(e);
      fetchFeedPosts(); // Restore on error
    }
  };

  // Share Post
  const sharePost = async (postId) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/posts/share/${postId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchFeedPosts();
        alert('Post shared successfully on your feed!');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AppContext.Provider value={{
      activeTab,
      selectedPageId,
      selectedProfileId,
      darkMode,
      setDarkMode,
      feedPosts,
      reels,
      onlineUsers,
      activeChatContact,
      chatMessages,
      conversations,
      activeCall,
      fetchFeedPosts,
      fetchReels,
      fetchConversations,
      selectContact,
      sendChatMessage,
      initiateCall,
      acceptCall,
      rejectCall,
      hangupCall,
      navigateToTab,
      toggleLikePost,
      sharePost,
      deletePost
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import PostCard from './PostCard';
import { Image, Film, Plus, Send, X, Globe, Lock, ChevronLeft, ChevronRight, Volume2 } from 'lucide-react';

export default function Feed() {
  const { feedPosts, fetchFeedPosts, onlineUsers } = useApp();
  const { user, token } = useAuth();
  
  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState('');
  const [postType, setPostType] = useState('post'); // 'post' or 'reel'
  const [managedPages, setManagedPages] = useState([]);
  const [selectedAuthor, setSelectedAuthor] = useState('user'); // 'user' or pageId
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const [storyComposerOpen, setStoryComposerOpen] = useState(false);
  const [stories, setStories] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('facebook-stories');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      const now = Date.now();
      return parsed.filter(story => story.expiresAt > now);
    } catch (e) {
      console.error(e);
      return [];
    }
  });
  const [storyDraft, setStoryDraft] = useState({
    text: '',
    emoji: '',
    song: '',
    mediaFile: null,
    mediaPreview: '',
    mediaType: 'image'
  });
  const storyFileInputRef = useRef(null);

  // Load user's managed pages to let them post as a Page
  useEffect(() => {
    fetchFeedPosts();
    
    if (token) {
      fetch('/api/pages', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        // Filter pages owned by current user
        const owned = data.filter(p => p.ownerId === user?.id);
        setManagedPages(owned);
      })
      .catch(e => console.error(e));
    }
  }, [token, user]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setMediaFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('facebook-stories', JSON.stringify(stories));
    }
  }, [stories]);

  const handleStoryFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setStoryDraft(prev => ({
        ...prev,
        mediaFile: file,
        mediaPreview: reader.result,
        mediaType: file.type.startsWith('video/') ? 'video' : 'image'
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleStorySubmit = (e) => {
    e.preventDefault();
    const text = storyDraft.text.trim();
    const emoji = storyDraft.emoji.trim();
    const song = storyDraft.song.trim();

    if (!text && !emoji && !song && !storyDraft.mediaFile) return;

    const newStory = {
      id: `story-${Date.now()}`,
      name: user?.name || 'You',
      avatar: user?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      bg: storyDraft.mediaPreview || 'https://images.unsplash.com/photo-1494253109108-2e30c049369b?w=800&h=1400&fit=crop',
      mediaType: storyDraft.mediaFile ? storyDraft.mediaType : 'text',
      mediaUrl: storyDraft.mediaPreview || '',
      caption: text,
      emoji,
      song,
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000
    };

    setStories(prev => [newStory, ...prev]);
    setStoryDraft({ text: '', emoji: '', song: '', mediaFile: null, mediaPreview: '', mediaType: 'image' });
    setStoryComposerOpen(false);
    setActiveStoryIndex(0);
    if (storyFileInputRef.current) storyFileInputRef.current.value = '';
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !mediaFile) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('type', postType);
      
      if (selectedAuthor !== 'user') {
        formData.append('isPagePost', 'true');
        formData.append('pageId', selectedAuthor);
      } else {
        formData.append('isPagePost', 'false');
      }

      if (mediaFile) {
        formData.append('media', mediaFile);
      }

      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        setContent('');
        setMediaFile(null);
        setMediaPreview('');
        setPostType('post');
        fetchFeedPosts();
        alert('Published successfully!');
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create post');
      }
    } catch (err) {
      console.error(err);
      alert('Error creating post');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Story Viewer State
  const [activeStoryIndex, setActiveStoryIndex] = useState(null); // null = closed
  const [storyProgress, setStoryProgress] = useState(0); // 0-100
  const storyTimerRef = useRef(null);
  const STORY_DURATION = 5000; // 5 seconds per story

  const openStory = (index) => {
    setActiveStoryIndex(index);
    setStoryProgress(0);
  };

  const closeStory = () => {
    setActiveStoryIndex(null);
    setStoryProgress(0);
    if (storyTimerRef.current) clearInterval(storyTimerRef.current);
  };

  const goNextStory = () => {
    if (activeStoryIndex < stories.length - 1) {
      setActiveStoryIndex(prev => prev + 1);
      setStoryProgress(0);
    } else {
      closeStory();
    }
  };

  const goPrevStory = () => {
    if (activeStoryIndex > 0) {
      setActiveStoryIndex(prev => prev - 1);
      setStoryProgress(0);
    }
  };

  // Auto-advance timer
  useEffect(() => {
    if (activeStoryIndex === null) return;
    setStoryProgress(0);
    if (storyTimerRef.current) clearInterval(storyTimerRef.current);

    const step = 100 / (STORY_DURATION / 50); // update every 50ms
    storyTimerRef.current = setInterval(() => {
      setStoryProgress(prev => {
        if (prev >= 100) {
          clearInterval(storyTimerRef.current);
          goNextStory();
          return 100;
        }
        return prev + step;
      });
    }, 50);

    return () => clearInterval(storyTimerRef.current);
  }, [activeStoryIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (activeStoryIndex === null) return;
    const handleKey = (e) => {
      if (e.key === 'ArrowRight') goNextStory();
      if (e.key === 'ArrowLeft') goPrevStory();
      if (e.key === 'Escape') closeStory();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeStoryIndex]);


  const activeStory = activeStoryIndex !== null ? stories[activeStoryIndex] : null;

  return (
    <div className="feed-container animate-fade-in">
      {storyComposerOpen && (
        <div className="story-composer-overlay" onClick={() => setStoryComposerOpen(false)}>
          <div className="story-composer-card" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Create a Story</h3>
                <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Visible for 24 hours to your friends</p>
              </div>
              <button type="button" onClick={() => setStoryComposerOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleStorySubmit}>
              <textarea
                value={storyDraft.text}
                onChange={(e) => setStoryDraft(prev => ({ ...prev, text: e.target.value }))}
                placeholder="What do you want to share?"
                rows={3}
                style={{ width: '100%', resize: 'none', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '12px', marginBottom: '12px' }}
              />

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                {['😊', '❤️', '✨', '🎵'].map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    className="story-emoji-btn"
                    onClick={() => setStoryDraft(prev => ({ ...prev, emoji: prev.emoji + emoji }))}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              <input
                value={storyDraft.song}
                onChange={(e) => setStoryDraft(prev => ({ ...prev, song: e.target.value }))}
                placeholder="Song or vibe (optional)"
                style={{ width: '100%', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '10px 12px', marginBottom: '12px' }}
              />

              <input
                ref={storyFileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleStoryFileChange}
                style={{ display: 'none' }}
              />

              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                <button type="button" onClick={() => storyFileInputRef.current?.click()} className="btn-text" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Image size={16} /> Add image or video
                </button>
                <button type="button" onClick={() => setStoryDraft(prev => ({ ...prev, mediaFile: null, mediaPreview: '', mediaType: 'image' }))} className="btn-text">
                  Clear media
                </button>
              </div>

              {storyDraft.mediaPreview && (
                <div className="story-composer-preview" style={{ marginBottom: '16px' }}>
                  {storyDraft.mediaType === 'video' ? (
                    <video src={storyDraft.mediaPreview} controls style={{ width: '100%', maxHeight: '220px', objectFit: 'contain', background: '#000' }} />
                  ) : (
                    <img src={storyDraft.mediaPreview} alt="Story preview" style={{ width: '100%', maxHeight: '220px', objectFit: 'cover' }} />
                  )}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Share with friends for 24 hours</span>
                <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Send size={16} /> Share story
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== STORY VIEWER MODAL ===== */}
      {activeStoryIndex !== null && activeStory && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.92)',
            zIndex: 500,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            backdropFilter: 'blur(16px)',
            paddingTop: '24px'
          }}
          onClick={closeStory}
        >
          {/* Story card container */}
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '400px',
              height: 'min(700px, 90vh)',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 32px 80px rgba(0,0,0,0.8)'
            }}
          >
            {/* Background image */}
            {activeStory.mediaType === 'video' && activeStory.mediaUrl ? (
              <video src={activeStory.mediaUrl} autoPlay muted loop style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            ) : activeStory.mediaUrl ? (
              <img
                src={activeStory.mediaUrl}
                alt="Story"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <img
                src={activeStory.bg}
                alt="Story"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            )}

            {/* Dark gradient overlays */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 35%, transparent 65%, rgba(0,0,0,0.6) 100%)'
            }} />

            {/* Top: progress bars */}
            <div style={{
              position: 'absolute', top: '14px', left: '14px', right: '14px',
              display: 'flex', gap: '4px'
            }}>
              {stories.map((_, i) => (
                <div key={i} style={{
                  flex: 1, height: '3px', borderRadius: '2px',
                  background: 'rgba(255,255,255,0.3)', overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    borderRadius: '2px',
                    background: 'white',
                    width: i < activeStoryIndex ? '100%' : i === activeStoryIndex ? `${storyProgress}%` : '0%',
                    transition: i === activeStoryIndex ? 'none' : 'none'
                  }} />
                </div>
              ))}
            </div>

            {/* Top: author info + close button */}
            <div style={{
              position: 'absolute', top: '32px', left: '14px', right: '14px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img
                  src={activeStory.avatar}
                  alt={activeStory.name}
                  style={{
                    width: '42px', height: '42px', borderRadius: '50%',
                    border: '2px solid white', objectFit: 'cover'
                  }}
                />
                <div>
                  <div style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem', textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>
                    {activeStory.name}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.75rem' }}>Just now</div>
                </div>
              </div>
              <button
                onClick={closeStory}
                style={{
                  background: 'rgba(0,0,0,0.4)', border: 'none', borderRadius: '50%',
                  width: '36px', height: '36px', color: 'white', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backdropFilter: 'blur(4px)'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Left click zone - go prev */}
            <div
              onClick={goPrevStory}
              style={{
                position: 'absolute', left: 0, top: 0, bottom: 0, width: '40%',
                cursor: activeStoryIndex > 0 ? 'w-resize' : 'default',
                zIndex: 10
              }}
            />

            {/* Right click zone - go next */}
            <div
              onClick={goNextStory}
              style={{
                position: 'absolute', right: 0, top: 0, bottom: 0, width: '40%',
                cursor: 'e-resize', zIndex: 10
              }}
            />

            {/* Left arrow button */}
            {activeStoryIndex > 0 && (
              <button
                onClick={goPrevStory}
                style={{
                  position: 'absolute', left: '-56px', top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255,255,255,0.15)', border: 'none',
                  borderRadius: '50%', width: '44px', height: '44px',
                  color: 'white', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  backdropFilter: 'blur(4px)', zIndex: 20
                }}
              >
                <ChevronLeft size={22} />
              </button>
            )}

            {/* Right arrow button */}
            {activeStoryIndex < stories.length - 1 && (
              <button
                onClick={goNextStory}
                style={{
                  position: 'absolute', right: '-56px', top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255,255,255,0.15)', border: 'none',
                  borderRadius: '50%', width: '44px', height: '44px',
                  color: 'white', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  backdropFilter: 'blur(4px)', zIndex: 20
                }}
              >
                <ChevronRight size={22} />
              </button>
            )}

            {(activeStory.caption || activeStory.emoji || activeStory.song) && (
              <div style={{
                position: 'absolute', left: '20px', right: '20px', bottom: '48px',
                color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.7)', zIndex: 15
              }}>
                {activeStory.emoji && <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>{activeStory.emoji}</div>}
                {activeStory.caption && <div style={{ fontSize: '1.05rem', fontWeight: 600 }}>{activeStory.caption}</div>}
                {activeStory.song && <div style={{ marginTop: '8px', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}><Volume2 size={14} style={{ display: 'inline-block', marginRight: '6px' }} />{activeStory.song}</div>}
              </div>
            )}

            {/* Bottom story counter */}
            <div style={{
              position: 'absolute', bottom: '20px',
              left: '50%', transform: 'translateX(-50%)',
              color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem',
              fontWeight: 600, letterSpacing: '0.05em'
            }}>
              {activeStoryIndex + 1} / {stories.length}
            </div>
          </div>
        </div>
      )}

      {/* Stories Bar */}
      <div className="stories-panel">
        {/* User Story Card */}
        <button type="button" className="story-card add-story" onClick={() => setStoryComposerOpen(true)}>
          <div className="add-btn"><Plus size={20} /></div>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Create Story</span>
        </button>
        
        {/* Render Stories */}
        {stories.map((story, index) => (
          <div
            key={story.id}
            className="story-card"
            onClick={() => openStory(index)}
            style={{ cursor: 'pointer' }}
          >
            <img src={story.bg} alt="Story Background" className="story-bg" />
            <img src={story.avatar} alt={story.name} className="story-avatar" />
            <span className="story-name">{story.name}</span>
          </div>
        ))}
      </div>

      {/* Post Creator Box */}
      <div className="glass-panel post-creator-card">
        <form onSubmit={handlePostSubmit}>
          <div className="post-creator-header">
            {user?.avatar ? (
              <img src={user.avatar} className="post-creator-avatar" alt="Avatar" />
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
                {user?.name.charAt(0).toUpperCase()}
              </div>
            )}
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {/* Author Selection */}
              <select
                value={selectedAuthor}
                onChange={(e) => setSelectedAuthor(e.target.value)}
                style={{
                  padding: '4px 8px',
                  fontSize: '0.8rem',
                  maxWidth: '180px',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                <option value="user">Post as Personal Profile</option>
                {managedPages.map(p => (
                  <option key={p.id} value={p.id}>Post as Page: {p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`What's on your mind, ${user?.name.split(' ')[0]}?`}
            rows={3}
            style={{
              width: '100%',
              resize: 'none',
              background: 'transparent',
              border: 'none',
              borderBottom: '1px solid var(--border-color)',
              borderRadius: '0',
              padding: '8px 0',
              fontSize: '1rem',
              marginBottom: '12px'
            }}
          />

          {/* Media Preview Window */}
          {mediaPreview && (
            <div style={{ position: 'relative', marginBottom: '12px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
              <button
                type="button"
                onClick={() => {
                  setMediaFile(null);
                  setMediaPreview('');
                }}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  borderRadius: 'var(--radius-full)',
                  width: '32px',
                  height: '32px',
                  zIndex: 10
                }}
              >
                <X size={16} />
              </button>
              {mediaFile?.type.startsWith('video/') ? (
                <video src={mediaPreview} controls style={{ width: '100%', maxHeight: '300px', objectFit: 'contain', background: '#000' }} />
              ) : (
                <img src={mediaPreview} alt="Upload preview" style={{ width: '100%', maxHeight: '300px', objectFit: 'cover' }} />
              )}
            </div>
          )}

          {/* Form Actions footer */}
          <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn-text"
                onClick={() => {
                  setPostType('post');
                  fileInputRef.current.click();
                }}
                style={{ padding: '8px 12px', borderRadius: 'var(--radius-full)' }}
              >
                <Image size={18} style={{ color: '#10b981' }} />
                <span style={{ fontSize: '0.85rem' }}>Photo/Video</span>
              </button>

              <button
                type="button"
                className="btn-text"
                onClick={() => {
                  setPostType('reel');
                  fileInputRef.current.click();
                }}
                style={{ padding: '8px 12px', borderRadius: 'var(--radius-full)' }}
              >
                <Film size={18} style={{ color: '#ec4899' }} />
                <span style={{ fontSize: '0.85rem' }}>Reels Video</span>
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,video/*"
                style={{ display: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {postType === 'reel' && (
                <span style={{ fontSize: '0.75rem', color: '#ec4899', fontWeight: 700, border: '1px solid #ec4899', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                  REEL MODE
                </span>
              )}
              
              <button
                type="submit"
                disabled={isSubmitting || (!content.trim() && !mediaFile)}
                className="btn-primary"
                style={{ padding: '8px 18px', borderRadius: 'var(--radius-full)' }}
              >
                {isSubmitting ? 'Posting...' : <><Send size={14} /> Post</>}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Main Feed Posts List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {feedPosts.length === 0 ? (
          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No posts found. Start by writing your first post or following pages!
          </div>
        ) : (
          feedPosts.map(post => (
            <PostCard key={post.id} post={post} />
          ))
        )}
      </div>
    </div>
  );
}

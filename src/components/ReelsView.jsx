import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import CommentSection from './CommentSection';
import { Heart, MessageSquare, Share2, Play, Pause, Volume2, VolumeX, ArrowLeft } from 'lucide-react';

export default function ReelsView() {
  const { reels, fetchReels, toggleLikePost, sharePost, navigateToTab } = useApp();
  const { token } = useAuth();
  
  const [muted, setMuted] = useState(true);
  const [playingId, setPlayingId] = useState(null);
  const [activeCommentsReelId, setActiveCommentsReelId] = useState(null);

  useEffect(() => {
    fetchReels();
  }, [token]);

  // Set the first reel as playing when loaded
  useEffect(() => {
    if (reels.length > 0 && !playingId) {
      setPlayingId(reels[0].id);
    }
  }, [reels]);

  const handleVideoClick = (id) => {
    if (playingId === id) {
      setPlayingId(null);
    } else {
      setPlayingId(id);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
      height: 'calc(100vh - 100px)',
      overflowY: 'auto',
      scrollSnapType: 'y mandatory',
      scrollbarWidth: 'none',
      gap: '24px',
      padding: '20px 0'
    }} className="reels-view-scroll">
      
      {reels.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', maxWidth: '450px', width: '100%' }}>
          <h3>No short reels uploaded yet.</h3>
          <p style={{ marginTop: '8px', fontSize: '0.9rem' }}>Go back to the Home Feed tab and create a new post selecting the "Reels Video" option!</p>
        </div>
      ) : (
        reels.map(reel => {
          const isPlaying = playingId === reel.id;
          const showComments = activeCommentsReelId === reel.id;

          return (
            <div 
              key={reel.id} 
              style={{
                width: '100%',
                maxWidth: '400px',
                height: 'calc(100vh - 140px)',
                minHeight: '500px',
                position: 'relative',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                background: '#000',
                scrollSnapAlign: 'start',
                boxShadow: 'var(--shadow-lg)'
              }}
            >
              {/* Video Element */}
              <video
                src={reel.mediaUrl}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  cursor: 'pointer'
                }}
                loop
                muted={muted}
                autoPlay={isPlaying}
                onClick={() => handleVideoClick(reel.id)}
                ref={el => {
                  if (el) {
                    if (isPlaying) {
                      el.play().catch(() => {});
                    } else {
                      el.pause();
                    }
                  }
                }}
              />

              {/* Pause Overlay Indicator */}
              {!isPlaying && (
                <div 
                  onClick={() => handleVideoClick(reel.id)}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'rgba(0, 0, 0, 0.5)',
                    color: 'white',
                    width: '64px',
                    height: '64px',
                    borderRadius: 'var(--radius-full)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none',
                    zIndex: 5
                  }}
                >
                  <Play size={28} style={{ marginLeft: '4px' }} />
                </div>
              )}

              {/* Top Mute Controls Toggle */}
              <button
                onClick={() => setMuted(!muted)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  color: 'white',
                  borderRadius: 'var(--radius-full)',
                  width: '36px',
                  height: '36px',
                  zIndex: 10
                }}
              >
                {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>

              {/* Sidebar Action Buttons Overlay */}
              <div style={{
                position: 'absolute',
                bottom: '80px',
                right: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
                zIndex: 10,
                alignItems: 'center'
              }}>
                {/* Like Button */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <button
                    onClick={() => toggleLikePost(reel.id, true)}
                    style={{
                      background: 'rgba(0, 0, 0, 0.5)',
                      color: reel.liked ? '#ef4444' : 'white',
                      width: '42px',
                      height: '42px',
                      borderRadius: 'var(--radius-full)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                    }}
                  >
                    <Heart size={20} style={{ fill: reel.liked ? '#ef4444' : 'none' }} />
                  </button>
                  <span style={{ fontSize: '0.75rem', color: 'white', fontWeight: 600, textShadow: '1px 1px 3px rgba(0,0,0,0.8)', marginTop: '4px' }}>
                    {reel.likesCount}
                  </span>
                </div>

                {/* Comment Toggle */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <button
                    onClick={() => setActiveCommentsReelId(showComments ? null : reel.id)}
                    style={{
                      background: 'rgba(0, 0, 0, 0.5)',
                      color: 'white',
                      width: '42px',
                      height: '42px',
                      borderRadius: 'var(--radius-full)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                    }}
                  >
                    <MessageSquare size={20} />
                  </button>
                  <span style={{ fontSize: '0.75rem', color: 'white', fontWeight: 600, textShadow: '1px 1px 3px rgba(0,0,0,0.8)', marginTop: '4px' }}>
                    {reel.commentsCount}
                  </span>
                </div>

                {/* Share Button */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <button
                    onClick={() => sharePost(reel.id)}
                    style={{
                      background: 'rgba(0, 0, 0, 0.5)',
                      color: 'white',
                      width: '42px',
                      height: '42px',
                      borderRadius: 'var(--radius-full)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                    }}
                  >
                    <Share2 size={20} />
                  </button>
                  <span style={{ fontSize: '0.75rem', color: 'white', fontWeight: 600, textShadow: '1px 1px 3px rgba(0,0,0,0.8)', marginTop: '4px' }}>
                    {reel.sharesCount || 0}
                  </span>
                </div>
              </div>

              {/* Creator Metadata Overlay (bottom bar) */}
              <div style={{
                position: 'absolute',
                bottom: '0',
                left: '0',
                right: '0',
                background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.85))',
                padding: '20px 16px',
                color: 'white',
                zIndex: 8,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {reel.authorAvatar ? (
                    <img 
                      src={reel.authorAvatar} 
                      style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-full)', border: '2px solid white', objectFit: 'cover', cursor: 'pointer' }}
                      alt={reel.authorName}
                      onClick={() => navigateToTab(reel.isPagePost ? 'page-detail' : 'profile', reel.isPagePost ? reel.pageId : reel.userId)}
                    />
                  ) : (
                    <div 
                      onClick={() => navigateToTab(reel.isPagePost ? 'page-detail' : 'profile', reel.isPagePost ? reel.pageId : reel.userId)}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--accent-gradient)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        border: '2px solid white',
                        cursor: 'pointer'
                      }}
                    >
                      {reel.authorName.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <span 
                    style={{ fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer' }}
                    onClick={() => navigateToTab(reel.isPagePost ? 'page-detail' : 'profile', reel.isPagePost ? reel.pageId : reel.userId)}
                  >
                    {reel.authorName}
                  </span>
                  
                  {reel.isPagePost && (
                    <span style={{ background: 'var(--accent-color)', fontSize: '0.65rem', padding: '2px 6px', borderRadius: 'var(--radius-sm)', fontWeight: 800 }}>
                      Page
                    </span>
                  )}
                </div>

                <p style={{ fontSize: '0.85rem', lineHeight: '1.4', opacity: 0.95, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {reel.content}
                </p>
              </div>

              {/* Slider Comments Drawer (overlay inside the video element for vertical layout consistency) */}
              {showComments && (
                <div style={{
                  position: 'absolute',
                  top: '60px',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'var(--bg-secondary)',
                  borderTopLeftRadius: 'var(--radius-lg)',
                  borderTopRightRadius: 'var(--radius-lg)',
                  padding: '20px',
                  zIndex: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  animation: 'fadeIn 0.3s forwards'
                }}>
                  <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                    <h4 style={{ fontSize: '0.95rem' }}>Comments</h4>
                    <button 
                      onClick={() => setActiveCommentsReelId(null)}
                      className="btn-text btn-circle"
                      style={{ width: '28px', height: '28px' }}
                    >
                      <ArrowLeft size={16} />
                    </button>
                  </div>
                  
                  <div style={{ flex: 1, overflowY: 'auto' }}>
                    <CommentSection postId={reel.id} commentsCount={reel.commentsCount} />
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

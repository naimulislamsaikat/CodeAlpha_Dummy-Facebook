import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import CommentSection from './CommentSection';
import { Heart, MessageCircle, Share2, Award, Calendar, MoreHorizontal, Globe, Trash2 } from 'lucide-react';

export default function PostCard({ post }) {
  const { toggleLikePost, sharePost, navigateToTab, deletePost } = useApp();
  const { user } = useAuth();
  
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // Format date helper
  const formatDate = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return 'Just now';
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    if (showMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const handleDeletePost = async () => {
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    setShowMenu(false);
    await deletePost(post.id);
  };

  const handleAuthorClick = () => {
    if (post.isPagePost && post.pageId) {
      navigateToTab('page-detail', post.pageId);
    } else {
      navigateToTab('profile', post.userId);
    }
  };

  const handleOriginalAuthorClick = (origPost) => {
    if (origPost.isPagePost && origPost.pageId) {
      navigateToTab('page-detail', origPost.pageId);
    } else {
      navigateToTab('profile', origPost.userId);
    }
  };

  return (
    <div className="glass-panel post-card animate-fade-in" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div className="post-header">
        <div className="post-author-info">
          {post.authorAvatar ? (
            <img 
              src={post.authorAvatar} 
              className="post-author-avatar" 
              alt={post.authorName} 
              onClick={handleAuthorClick}
            />
          ) : (
            <div 
              onClick={handleAuthorClick}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--accent-gradient)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {post.authorName.charAt(0).toUpperCase()}
            </div>
          )}

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="post-author-name" onClick={handleAuthorClick}>
                {post.authorName}
              </span>
              {post.isPagePost && (
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  background: 'var(--bg-input)',
                  color: 'var(--accent-color)',
                  padding: '2px 6px',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px'
                }}>
                  <Award size={10} /> PAGE
                </span>
              )}
            </div>
            
            <div className="post-meta-details">
              <span>{formatDate(post.createdAt)}</span>
              <span>•</span>
              <Globe size={12} />
            </div>
          </div>
        </div>

        <div style={{ position: 'relative' }} ref={menuRef}>
          <button
            className="btn-circle btn-text"
            style={{ width: '32px', height: '32px' }}
            onClick={() => setShowMenu(prev => !prev)}
          >
            <MoreHorizontal size={16} />
          </button>

          {showMenu && (
            <div style={{
              position: 'absolute',
              top: '36px',
              right: 0,
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-md)',
              zIndex: 100,
              minWidth: '140px',
              overflow: 'hidden'
            }}>
              {post.userId === user?.id && (
                <button
                  onClick={handleDeletePost}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '10px 14px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#ef4444',
                    fontSize: '0.9rem',
                    fontWeight: 500
                  }}
                  className="sidebar-btn-hover"
                >
                  <Trash2 size={15} /> Delete Post
                </button>
              )}
              {post.userId !== user?.id && (
                <div style={{ padding: '10px 14px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  No actions available
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main post text */}
      {post.content && post.content !== 'shared a post' && (
        <div className="post-content">
          {post.content}
        </div>
      )}

      {/* Main post image/video file */}
      {post.mediaUrl && (
        <div className="post-media-container">
          {post.mediaType === 'video' ? (
            <video src={post.mediaUrl} controls />
          ) : (
            <img src={post.mediaUrl} alt="Post Attachment" />
          )}
        </div>
      )}

      {/* Shared nested post container */}
      {post.originalPost && (
        <div className="glass-panel" style={{
          padding: '14px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(0, 0, 0, 0.05)',
          borderLeft: '4px solid var(--accent-color)',
          marginTop: '4px',
          marginBottom: '12px'
        }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
            {post.originalPost.authorAvatar ? (
              <img 
                src={post.originalPost.authorAvatar} 
                style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-full)', objectFit: 'cover', cursor: 'pointer' }}
                alt="Orig"
                onClick={() => handleOriginalAuthorClick(post.originalPost)}
              />
            ) : (
              <div 
                onClick={() => handleOriginalAuthorClick(post.originalPost)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--accent-gradient)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                {post.originalPost.authorName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <span 
                style={{ fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
                onClick={() => handleOriginalAuthorClick(post.originalPost)}
              >
                {post.originalPost.authorName}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '6px' }}>
                {formatDate(post.originalPost.createdAt)}
              </span>
            </div>
          </div>

          <div style={{ fontSize: '0.9rem', marginBottom: post.originalPost.mediaUrl ? '8px' : 0 }}>
            {post.originalPost.content}
          </div>

          {post.originalPost.mediaUrl && (
            <div style={{ borderRadius: 'var(--radius-sm)', overflow: 'hidden', maxHeight: '250px' }}>
              {post.originalPost.mediaType === 'video' ? (
                <video src={post.originalPost.mediaUrl} controls style={{ width: '100%', maxHeight: '250px', objectFit: 'contain' }} />
              ) : (
                <img src={post.originalPost.mediaUrl} style={{ width: '100%', maxHeight: '250px', objectFit: 'cover' }} alt="shared upload" />
              )}
            </div>
          )}
        </div>
      )}

      {/* Engagement Counter */}
      <div className="post-stats">
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Heart size={14} style={{ fill: post.likesCount > 0 ? '#ef4444' : 'none', color: post.likesCount > 0 ? '#ef4444' : 'currentColor' }} />
          {post.likesCount} {post.likesCount === 1 ? 'like' : 'likes'}
        </span>
        <div style={{ display: 'flex', gap: '12px' }}>
          <span>{post.commentsCount} {post.commentsCount === 1 ? 'comment' : 'comments'}</span>
          <span>{post.sharesCount || 0} shares</span>
        </div>
      </div>

      {/* Interaction Buttons */}
      <div className="post-actions">
        <button 
          onClick={() => toggleLikePost(post.id, post.type === 'reel')} 
          className={`btn-text post-action-btn ${post.liked ? 'liked' : ''}`}
        >
          <Heart size={18} style={{ fill: post.liked ? 'var(--accent-color)' : 'none' }} />
          <span>Like</span>
        </button>
        
        <button 
          onClick={() => setShowComments(!showComments)} 
          className="btn-text post-action-btn"
        >
          <MessageCircle size={18} />
          <span>Comment</span>
        </button>

        <button 
          onClick={() => sharePost(post.id)} 
          className="btn-text post-action-btn"
          disabled={post.userId === user?.id} // Don't share own post
        >
          <Share2 size={18} />
          <span>Share</span>
        </button>
      </div>

      {/* Comment Section Panel */}
      {showComments && (
        <CommentSection postId={post.id} commentsCount={post.commentsCount} />
      )}
    </div>
  );
}

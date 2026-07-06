import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Send } from 'lucide-react';

export default function CommentSection({ postId }) {
  const { token, user } = useAuth();
  const { fetchFeedPosts } = useApp();
  
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/posts/comments/${postId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId, token]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await fetch(`/api/posts/comment/${postId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: newComment.trim() })
      });

      if (res.ok) {
        setNewComment('');
        fetchComments();
        // Refresh feed so comment counts update on main card
        fetchFeedPosts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="comment-section">
      {/* Comments List */}
      <div className="comments-list">
        {loading ? (
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '8px' }}>
            Loading comments...
          </div>
        ) : comments.length === 0 ? (
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', padding: '8px 0' }}>
            No comments yet. Be the first to share your thoughts!
          </div>
        ) : (
          comments.map(c => (
            <div key={c.id} className="comment-item">
              {c.userAvatar ? (
                <img 
                  src={c.userAvatar} 
                  style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-full)', objectFit: 'cover', marginTop: '4px' }} 
                  alt={c.userName} 
                />
              ) : (
                <div style={{
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
                  marginTop: '4px'
                }}>
                  {c.userName.charAt(0).toUpperCase()}
                </div>
              )}
              
              <div className="comment-bubble">
                <div className="comment-author">{c.userName}</div>
                <div className="comment-text">{c.content}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Comment Input */}
      {user && (
        <form onSubmit={handleCommentSubmit} className="comment-input-form">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
          />
          <button 
            type="submit" 
            className="btn-circle btn-primary animate-fade-in"
            style={{ width: '36px', height: '36px' }}
            disabled={!newComment.trim()}
          >
            <Send size={14} />
          </button>
        </form>
      )}
    </div>
  );
}

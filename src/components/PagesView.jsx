import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import PostCard from './PostCard';
import { Flag, Plus, Users, ArrowLeft, Image as ImageIcon, Briefcase, Sparkles, Send } from 'lucide-react';

export default function PagesView() {
  const { selectedPageId, navigateToTab } = useApp();
  const { token, user } = useAuth();

  const [pagesList, setPagesList] = useState([]);
  const [activePageDetails, setActivePageDetails] = useState(null);
  
  // Page Creation Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [pageName, setPageName] = useState('');
  const [pageCategory, setPageCategory] = useState('');
  const [pageDescription, setPageDescription] = useState('');
  const [pageAvatar, setPageAvatar] = useState(null);
  const [pageAvatarPreview, setPageAvatarPreview] = useState('');
  const [pageCover, setPageCover] = useState(null);
  const [pageCoverPreview, setPageCoverPreview] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Page Posting State
  const [pagePostContent, setPagePostContent] = useState('');
  const [pagePostMedia, setPagePostMedia] = useState(null);
  const [pagePostMediaPreview, setPagePostMediaPreview] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const pagePostMediaRef = useRef(null);

  // Fetch all pages
  const fetchAllPages = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/pages', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPagesList(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch detail page
  const fetchPageDetails = async (pageId) => {
    if (!token || !pageId) return;
    try {
      const res = await fetch(`/api/pages/${pageId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setActivePageDetails(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (selectedPageId) {
      fetchPageDetails(selectedPageId);
    } else {
      setActivePageDetails(null);
      fetchAllPages();
    }
  }, [selectedPageId, token]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPageAvatar(file);
      setPageAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPageCover(file);
      setPageCoverPreview(URL.createObjectURL(file));
    }
  };

  const handlePagePostMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPagePostMedia(file);
      setPagePostMediaPreview(URL.createObjectURL(file));
    }
  };

  // Create commercial page
  const handleCreatePage = async (e) => {
    e.preventDefault();
    if (!pageName || !pageCategory) return;

    setIsCreating(true);
    try {
      const formData = new FormData();
      formData.append('name', pageName);
      formData.append('category', pageCategory);
      formData.append('description', pageDescription);
      
      if (pageAvatar) formData.append('avatar', pageAvatar);
      if (pageCover) formData.append('coverPhoto', pageCover);

      const res = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        setPageName('');
        setPageCategory('');
        setPageDescription('');
        setPageAvatar(null);
        setPageAvatarPreview('');
        setPageCover(null);
        setPageCoverPreview('');
        setShowCreateModal(false);
        fetchAllPages();
        alert('Commercial Page created successfully!');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  // Post on behalf of page
  const handlePagePostSubmit = async (e) => {
    e.preventDefault();
    if (!pagePostContent.trim() && !pagePostMedia) return;

    setIsPosting(true);
    try {
      const formData = new FormData();
      formData.append('content', pagePostContent);
      formData.append('type', 'post');
      formData.append('isPagePost', 'true');
      formData.append('pageId', activePageDetails.id);

      if (pagePostMedia) {
        formData.append('media', pagePostMedia);
      }

      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        setPagePostContent('');
        setPagePostMedia(null);
        setPagePostMediaPreview('');
        fetchPageDetails(activePageDetails.id);
        alert('Page Post published successfully!');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsPosting(false);
    }
  };

  // Subscribe / follow page toggle
  const handleSubscribePage = async (pageId) => {
    try {
      const res = await fetch(`/api/pages/subscribe/${pageId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Update local detail state
        if (activePageDetails && activePageDetails.id === pageId) {
          setActivePageDetails(prev => ({
            ...prev,
            isSubscribed: data.subscribed,
            subscribersCount: data.subscribed ? prev.subscribersCount + 1 : prev.subscribersCount - 1
          }));
        } else {
          fetchAllPages();
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 1. DETAIL VIEW RENDER
  if (activePageDetails) {
    const isOwner = activePageDetails.ownerId === user?.id;

    return (
      <div style={{ width: '100%', maxWidth: '800px' }} className="animate-fade-in">
        {/* Back navigation */}
        <button 
          onClick={() => navigateToTab('pages')} 
          className="btn-secondary" 
          style={{ marginBottom: '16px', borderRadius: 'var(--radius-full)' }}
        >
          <ArrowLeft size={16} /> Back to Pages
        </button>

        {/* Page Banner / Header card */}
        <div className="glass-panel" style={{ overflow: 'hidden', marginBottom: '24px' }}>
          {/* Cover Photo */}
          <div style={{ height: '220px', background: '#252636', position: 'relative' }}>
            {activePageDetails.coverPhoto ? (
              <img src={activePageDetails.coverPhoto} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', background: 'var(--accent-gradient)', opacity: 0.8 }} />
            )}
          </div>

          {/* Details Row */}
          <div style={{ padding: '24px', display: 'flex', gap: '20px', alignItems: 'flex-end', marginTop: '-50px', position: 'relative', zIndex: 5, flexWrap: 'wrap' }}>
            {/* Page Avatar */}
            {activePageDetails.avatar ? (
              <img 
                src={activePageDetails.avatar} 
                alt={activePageDetails.name} 
                style={{ width: '110px', height: '110px', borderRadius: 'var(--radius-md)', border: '4px solid var(--bg-secondary)', objectFit: 'cover', background: 'var(--bg-input)' }} 
              />
            ) : (
              <div style={{
                width: '110px',
                height: '110px',
                borderRadius: 'var(--radius-md)',
                border: '4px solid var(--bg-secondary)',
                background: 'var(--accent-gradient)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '2rem'
              }}>
                {activePageDetails.name.charAt(0).toUpperCase()}
              </div>
            )}

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>{activePageDetails.name}</h2>
                <span style={{
                  background: 'var(--accent-gradient)',
                  color: 'white',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)'
                }}>
                  {activePageDetails.category}
                </span>
              </div>
              
              <div style={{ display: 'flex', gap: '16px', marginTop: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Users size={14} /> {activePageDetails.subscribersCount} subscribers
                </span>
                <span>• Owned by {isOwner ? 'You (Admin)' : 'External Partner'}</span>
              </div>
            </div>

            {/* Subscribe trigger */}
            {!isOwner && (
              <button
                onClick={() => handleSubscribePage(activePageDetails.id)}
                className={activePageDetails.isSubscribed ? 'btn-secondary' : 'btn-primary'}
                style={{ borderRadius: 'var(--radius-full)' }}
              >
                {activePageDetails.isSubscribed ? 'Subscribed' : 'Subscribe to Page'}
              </button>
            )}
          </div>

          <div style={{ padding: '0 24px 24px 24px' }}>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>
              {activePageDetails.description || 'No description provided.'}
            </p>
          </div>
        </div>

        {/* Create Post as Page (If current user is owner) */}
        {isOwner && (
          <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px' }}>
            <h4 style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} style={{ color: 'var(--accent-color)' }} /> Publish to Page Feed
            </h4>
            
            <form onSubmit={handlePagePostSubmit}>
              <textarea
                value={pagePostContent}
                onChange={(e) => setPagePostContent(e.target.value)}
                placeholder="Share a promotional update or announcement..."
                rows={3}
                style={{ marginBottom: '12px' }}
              />

              {pagePostMediaPreview && (
                <div style={{ position: 'relative', marginBottom: '12px', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  <img src={pagePostMediaPreview} alt="Page upload" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover' }} />
                </div>
              )}

              <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between' }}>
                <button
                  type="button"
                  className="btn-text"
                  onClick={() => pagePostMediaRef.current.click()}
                >
                  <ImageIcon size={18} /> Attach Photo
                </button>
                <input
                  type="file"
                  ref={pagePostMediaRef}
                  onChange={handlePagePostMediaChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />

                <button
                  type="submit"
                  disabled={isPosting || (!pagePostContent.trim() && !pagePostMedia)}
                  className="btn-primary"
                >
                  {isPosting ? 'Publishing...' : <><Send size={14} /> Publish</>}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Page Feed Posts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>Page Timeline</h3>
          {activePageDetails.posts?.length === 0 ? (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No timeline posts published by this Commercial Page yet.
            </div>
          ) : (
            activePageDetails.posts?.map(post => {
              // Map detail page authors
              const postWithAuthor = {
                ...post,
                authorName: activePageDetails.name,
                authorAvatar: activePageDetails.avatar,
                commentsCount: 0, // Fallback placeholder
                liked: post.likes ? post.likes.includes(user?.id) : false,
                likesCount: post.likes ? post.likes.length : 0
              };
              return <PostCard key={post.id} post={postWithAuthor} />;
            })
          )}
        </div>

      </div>
    );
  }

  // 2. INDEX DIRECTORY VIEW RENDER
  return (
    <div style={{ width: '100%', maxWidth: '800px' }} className="animate-fade-in">
      <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Commercial Pages</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Discover brands, businesses, and communities</p>
        </div>

        <button 
          onClick={() => setShowCreateModal(true)} 
          className="btn-primary"
          style={{ borderRadius: 'var(--radius-full)' }}
        >
          <Plus size={16} /> Create Page
        </button>
      </div>

      {/* Pages Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
        gap: '20px'
      }}>
        {pagesList.map(page => {
          const isOwnPage = page.ownerId === user?.id;

          return (
            <div key={page.id} className="glass-panel glass-panel-hover" style={{
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              height: '320px'
            }}>
              {/* Header card cover block */}
              <div style={{ height: '90px', background: 'var(--accent-gradient)', opacity: 0.8 }} />

              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '-45px', flex: 1, textAlign: 'center' }}>
                {/* Page Avatar */}
                {page.avatar ? (
                  <img 
                    src={page.avatar} 
                    alt={page.name} 
                    style={{ width: '70px', height: '70px', borderRadius: 'var(--radius-md)', border: '3px solid var(--bg-secondary)', objectFit: 'cover', background: 'var(--bg-input)' }} 
                  />
                ) : (
                  <div style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: 'var(--radius-md)',
                    border: '3px solid var(--bg-secondary)',
                    background: 'var(--accent-gradient)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1.5rem'
                  }}>
                    {page.name.charAt(0).toUpperCase()}
                  </div>
                )}

                <h4 
                  onClick={() => navigateToTab('page-detail', page.id)}
                  style={{ marginTop: '12px', fontSize: '1.05rem', cursor: 'pointer' }}
                  className="gradient-text"
                >
                  {page.name}
                </h4>

                <span style={{
                  background: 'var(--bg-input)',
                  fontSize: '0.75rem',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  color: 'var(--text-secondary)',
                  marginTop: '4px',
                  fontWeight: 600
                }}>
                  {page.category}
                </span>

                <p style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  marginTop: '10px',
                  lineHeight: '1.4',
                  maxHeight: '44px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}>
                  {page.description || 'Welcome to our brand profile page.'}
                </p>

                {/* Footer Buttons */}
                <div style={{ marginTop: 'auto', width: '100%', display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => navigateToTab('page-detail', page.id)}
                    className="btn-secondary"
                    style={{ flex: 1, padding: '8px', fontSize: '0.8rem', borderRadius: 'var(--radius-md)' }}
                  >
                    View
                  </button>
                  
                  {!isOwnPage && (
                    <button
                      onClick={() => handleSubscribePage(page.id)}
                      className={page.isSubscribed ? 'btn-secondary' : 'btn-primary'}
                      style={{ flex: 1, padding: '8px', fontSize: '0.8rem', borderRadius: 'var(--radius-md)' }}
                    >
                      {page.isSubscribed ? 'Subbed' : 'Subscribe'}
                    </button>
                  )}

                  {isOwnPage && (
                    <span style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(99, 102, 241, 0.1)',
                      color: 'var(--accent-color)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid rgba(99, 102, 241, 0.2)'
                    }}>
                      Admin
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE NEW PAGE DIALOG MODAL */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="glass-panel modal-box" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3>Create Commercial Page</h3>
              <button onClick={() => setShowCreateModal(false)} className="btn-text">Close</button>
            </div>

            <form onSubmit={handleCreatePage} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Brand / Page Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Tech Corporation"
                  value={pageName}
                  onChange={(e) => setPageName(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Industry Category</label>
                <select
                  required
                  value={pageCategory}
                  onChange={(e) => setPageCategory(e.target.value)}
                >
                  <option value="">Choose category...</option>
                  <option value="Business/Company">Business/Company</option>
                  <option value="Creator/Blogger">Creator/Blogger</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Education">Education</option>
                  <option value="E-Commerce">E-Commerce</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Page Description</label>
                <textarea
                  placeholder="Write a brief introduction to your organization..."
                  rows={3}
                  value={pageDescription}
                  onChange={(e) => setPageDescription(e.target.value)}
                />
              </div>

              {/* Photos Uploader */}
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Page Avatar</span>
                  <button type="button" className="btn-secondary" style={{ width: '100%' }} onClick={() => avatarInputRef.current.click()}>
                    Upload Logo
                  </button>
                  <input type="file" ref={avatarInputRef} onChange={handleAvatarChange} accept="image/*" style={{ display: 'none' }} />
                  {pageAvatarPreview && (
                    <img src={pageAvatarPreview} style={{ width: '50px', height: '50px', objectFit: 'cover', marginTop: '8px', borderRadius: 'var(--radius-sm)' }} alt="logo" />
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Cover Banner</span>
                  <button type="button" className="btn-secondary" style={{ width: '100%' }} onClick={() => coverInputRef.current.click()}>
                    Upload Cover
                  </button>
                  <input type="file" ref={coverInputRef} onChange={handleCoverChange} accept="image/*" style={{ display: 'none' }} />
                  {pageCoverPreview && (
                    <img src={pageCoverPreview} style={{ width: '80px', height: '50px', objectFit: 'cover', marginTop: '8px', borderRadius: 'var(--radius-sm)' }} alt="cover" />
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className="btn-primary"
                style={{ marginTop: '12px' }}
              >
                {isCreating ? 'Creating Page...' : 'Initialize Brand Page'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

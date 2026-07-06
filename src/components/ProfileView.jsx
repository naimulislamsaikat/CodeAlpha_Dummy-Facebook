import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import PostCard from './PostCard';
import { Edit3, UserCheck, UserPlus, Calendar, Mail, FileText } from 'lucide-react';

export default function ProfileView() {
  const { selectedProfileId, feedPosts } = useApp();
  const { token, user: loggedInUser, updateProfileState } = useAuth();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit Form State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatar, setEditAvatar] = useState(null);
  const [editAvatarPreview, setEditAvatarPreview] = useState('');
  const [editCover, setEditCover] = useState(null);
  const [editCoverPreview, setEditCoverPreview] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const avatarRef = useRef(null);
  const coverRef = useRef(null);

  const fetchProfile = async () => {
    if (!token || !selectedProfileId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/users/profile/${selectedProfileId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfileData(data);
        
        // Pre-fill edit inputs if looking at own profile
        if (selectedProfileId === loggedInUser?.id) {
          setEditName(data.name);
          setEditBio(data.bio);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [selectedProfileId, token]);

  const handleFollowToggle = async () => {
    try {
      const res = await fetch(`/api/users/follow/${profileData.id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfileData(prev => ({
          ...prev,
          isFollowing: data.following,
          followersCount: data.following ? prev.followersCount + 1 : prev.followersCount - 1
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditAvatar(file);
      setEditAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditCover(file);
      setEditCoverPreview(URL.createObjectURL(file));
    }
  };

  // Submit profile changes
  const handleProfileUpdateSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const formData = new FormData();
      formData.append('name', editName);
      formData.append('bio', editBio);
      
      if (editAvatar) formData.append('avatar', editAvatar);
      if (editCover) formData.append('coverPhoto', editCover);

      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        // Update context
        updateProfileState(data.user);
        // Refresh local details
        fetchProfile();
        setShowEditModal(false);
        alert('Profile updated successfully!');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Filter posts created by this profile user (that are not page posts)
  const profilePosts = feedPosts.filter(p => p.userId === selectedProfileId && !p.isPagePost);

  if (loading) {
    return (
      <div className="glass-panel" style={{ width: '100%', maxWidth: '850px', padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Loading profile metadata...
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="glass-panel" style={{ width: '100%', maxWidth: '850px', padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Profile not found
      </div>
    );
  }

  const isOwnProfile = profileData.id === loggedInUser?.id;

  return (
    <div className="profile-view animate-fade-in">
      {/* Cover / Avatar Banner */}
      <div className="glass-panel" style={{ overflow: 'hidden', marginBottom: '24px' }}>
        <div className="profile-cover-container">
          {profileData.coverPhoto ? (
            <img src={profileData.coverPhoto} alt="Cover" className="profile-cover" />
          ) : (
            <div style={{ width: '100%', height: '100%', background: 'var(--accent-gradient)', opacity: 0.8 }} />
          )}

          {isOwnProfile && (
            <button 
              onClick={() => {
                setShowEditModal(true);
                setTimeout(() => coverRef.current.click(), 100);
              }} 
              className="edit-cover-btn btn"
            >
              Change Cover
            </button>
          )}
        </div>

        {/* Info panel */}
        <div className="profile-info-section">
          <div className="profile-avatar-container">
            {profileData.avatar ? (
              <img src={profileData.avatar} alt="Profile" className="profile-avatar" />
            ) : (
              <div className="profile-avatar" style={{
                background: 'var(--accent-gradient)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '3rem'
              }}>
                {profileData.name.charAt(0).toUpperCase()}
              </div>
            )}

            {isOwnProfile && (
              <button 
                onClick={() => {
                  setShowEditModal(true);
                  setTimeout(() => avatarRef.current.click(), 100);
                }} 
                className="edit-avatar-btn btn"
              >
                <Edit3 size={16} />
              </button>
            )}
          </div>

          <div className="profile-details">
            <h2 className="profile-name">{profileData.name}</h2>
            <p className="profile-bio">{profileData.bio}</p>
            
            {/* Stats Row */}
            <div className="profile-stats-row" style={{ justifyContent: 'center' }}>
              <div className="profile-stat-item">
                <span className="profile-stat-value">{profileData.postsCount}</span>
                <span className="profile-stat-label">Posts</span>
              </div>
              <div className="profile-stat-item">
                <span className="profile-stat-value">{profileData.followersCount}</span>
                <span className="profile-stat-label">Followers</span>
              </div>
              <div className="profile-stat-item">
                <span className="profile-stat-value">{profileData.followingCount}</span>
                <span className="profile-stat-label">Following</span>
              </div>
            </div>

            {/* CTA action buttons */}
            <div className="profile-actions" style={{ justifyContent: 'center' }}>
              {isOwnProfile ? (
                <button 
                  onClick={() => setShowEditModal(true)} 
                  className="btn-secondary"
                  style={{ borderRadius: 'var(--radius-full)' }}
                >
                  <Edit3 size={16} /> Edit Profile
                </button>
              ) : (
                <button
                  onClick={handleFollowToggle}
                  className={profileData.isFollowing ? 'btn-secondary' : 'btn-primary'}
                  style={{ borderRadius: 'var(--radius-full)' }}
                >
                  {profileData.isFollowing ? (
                    <><UserCheck size={16} /> Following</>
                  ) : (
                    <><UserPlus size={16} /> Follow</>
                  )}
                </button>
              )}
            </div>

            {/* Metas info footer */}
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '16px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={14} /> Joined {new Date(profileData.joinedDate).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* User specific timeline posts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={18} /> Profile Timeline
        </h3>
        
        {profilePosts.length === 0 ? (
          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No timeline posts published by this profile yet.
          </div>
        ) : (
          profilePosts.map(post => (
            <PostCard key={post.id} post={{ ...post, authorName: profileData.name, authorAvatar: profileData.avatar }} />
          ))
        )}
      </div>

      {/* EDIT MODAL OVERLAY */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="glass-panel modal-box" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3>Update Profile Settings</h3>
              <button onClick={() => setShowEditModal(false)} className="btn-text">Close</button>
            </div>

            <form onSubmit={handleProfileUpdateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Full Display Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Custom Bio</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Photos Uploader */}
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Profile Picture</span>
                  <button type="button" className="btn-secondary" style={{ width: '100%' }} onClick={() => avatarRef.current.click()}>
                    Choose Avatar
                  </button>
                  <input type="file" ref={avatarRef} onChange={handleAvatarChange} accept="image/*" style={{ display: 'none' }} />
                  {editAvatarPreview && (
                    <img src={editAvatarPreview} style={{ width: '50px', height: '50px', objectFit: 'cover', marginTop: '8px', borderRadius: 'var(--radius-full)' }} alt="avatar edit" />
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Cover Photo</span>
                  <button type="button" className="btn-secondary" style={{ width: '100%' }} onClick={() => coverRef.current.click()}>
                    Choose Cover
                  </button>
                  <input type="file" ref={coverRef} onChange={handleCoverChange} accept="image/*" style={{ display: 'none' }} />
                  {editCoverPreview && (
                    <img src={editCoverPreview} style={{ width: '80px', height: '50px', objectFit: 'cover', marginTop: '8px', borderRadius: 'var(--radius-sm)' }} alt="cover edit" />
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isUpdating}
                className="btn-primary"
                style={{ marginTop: '12px' }}
              >
                {isUpdating ? 'Saving Changes...' : 'Save Settings'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

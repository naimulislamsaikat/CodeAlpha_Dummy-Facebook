import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Feed from './components/Feed';
import ReelsView from './components/ReelsView';
import WatchView from './components/WatchView';
import MessagesView from './components/MessagesView';
import PagesView from './components/PagesView';
import ProfileView from './components/ProfileView';
import CallModal from './components/CallModal';
import { Sparkles, Mail, Lock, User, Eye, EyeOff, ShieldCheck, Sun, Moon } from 'lucide-react';

export default function App() {
  const { user, loading, login, register, verifyCode } = useAuth();
  const { activeTab, darkMode, setDarkMode } = useApp();

  // Authentication UI Screens States
  const [authMode, setAuthMode] = useState('login'); // 'login', 'register', 'verify'
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);

  // Form Handlers
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setErrorMsg('');
    setIsLoadingAuth(true);

    try {
      await login(email, password);
    } catch (err) {
      if (err.message.includes('not verified')) {
        setSuccessMsg('Please verify your email to activate account.');
        setAuthMode('verify');
      } else {
        setErrorMsg(err.message || 'Login failed');
      }
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    setErrorMsg('');
    setIsLoadingAuth(true);

    try {
      await register(name, email, password);
      setSuccessMsg('A 6-digit verification code has been printed to the server terminal console! Please input it below.');
      setAuthMode('verify');
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed');
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    if (!email || !verificationCode) return;
    setErrorMsg('');
    setIsLoadingAuth(true);

    try {
      await verifyCode(email, verificationCode);
      setSuccessMsg('Account verified successfully! You can now log in.');
      setAuthMode('login');
      setPassword('');
      setVerificationCode('');
    } catch (err) {
      setErrorMsg(err.message || 'Verification failed');
    } finally {
      setIsLoadingAuth(false);
    }
  };

  // Loading Splash Screen
  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)'
      }}>
        <div className="call-avatar-pulse" style={{ width: '80px', height: '80px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--accent-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            color: 'white',
            fontWeight: 800
          }}>
            A
          </div>
        </div>
        <h4 style={{ marginTop: '16px', fontWeight: 600 }}>Loading social desktop shell...</h4>
      </div>
    );
  }

  // 1. UNAUTHENTICATED UI PANEL (Login, Register & Verification)
  if (!user) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        padding: '20px'
      }}>
        {/* Float Toggler */}
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className="btn-circle btn-secondary"
          style={{ position: 'absolute', top: '24px', right: '24px' }}
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="glass-panel animate-fade-in" style={{
          width: '100%',
          maxWidth: '430px',
          padding: '40px 32px',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)'
        }}>
          {/* Logo Brand Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 className="gradient-text" style={{ fontSize: '2.3rem', fontWeight: 800, letterSpacing: '-0.04em' }}>
              SocialAlpha
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '6px' }}>
              Connect with circles, stream, and build commercial pages
            </p>
          </div>

          {errorMsg && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: '20px',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}>
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              color: '#10b981',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: '20px',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}>
              {successMsg}
            </div>
          )}

          {/* A. LOGIN FORM */}
          {authMode === 'login' && (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input 
                  type="email" 
                  required
                  placeholder="Account Email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '40px' }}
                />
              </div>

              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  required
                  placeholder="Security Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '40px', paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <button 
                type="submit" 
                disabled={isLoadingAuth}
                className="btn-primary" 
                style={{ width: '100%', marginTop: '8px' }}
              >
                {isLoadingAuth ? 'Entering platform...' : 'Sign In'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>New to the platform? </span>
                <span 
                  onClick={() => {
                    setAuthMode('register');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  style={{ color: 'var(--accent-color)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Create Account
                </span>
              </div>
            </form>
          )}

          {/* B. REGISTER FORM */}
          {authMode === 'register' && (
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input 
                  type="text" 
                  required
                  placeholder="Full Name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ paddingLeft: '40px' }}
                />
              </div>

              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input 
                  type="email" 
                  required
                  placeholder="Account Email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '40px' }}
                />
              </div>

              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  required
                  placeholder="Security Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '40px', paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <button 
                type="submit" 
                disabled={isLoadingAuth}
                className="btn-primary" 
                style={{ width: '100%', marginTop: '8px' }}
              >
                {isLoadingAuth ? 'Creating profile...' : 'Register Profile'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Already verified? </span>
                <span 
                  onClick={() => {
                    setAuthMode('login');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  style={{ color: 'var(--accent-color)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Log In
                </span>
              </div>
            </form>
          )}

          {/* C. EMAIL CODE VERIFICATION FORM */}
          {authMode === 'verify' && (
            <form onSubmit={handleVerificationSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                color: 'var(--text-secondary)',
                fontSize: '0.85rem',
                textAlign: 'center',
                marginBottom: '10px'
              }}>
                <ShieldCheck size={48} style={{ color: 'var(--accent-color)' }} />
                <span>We sent a 6-digit activation code to <strong>{email}</strong>. (Check your backend console!)</span>
              </div>

              <input 
                type="text" 
                required
                maxLength={6}
                placeholder="6-Digit Code" 
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                style={{ textAlign: 'center', fontSize: '1.25rem', letterSpacing: '0.3em', fontWeight: 700 }}
              />

              <button 
                type="submit" 
                disabled={isLoadingAuth}
                className="btn-primary" 
                style={{ width: '100%' }}
              >
                {isLoadingAuth ? 'Validating code...' : 'Verify Profile'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.85rem' }}>
                <span 
                  onClick={() => {
                    setAuthMode('register');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  style={{ color: 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Change Email or Re-register
                </span>
              </div>
            </form>
          )}

        </div>
      </div>
    );
  }

  // 2. AUTHENTICATED PLATFORM LAYOUT
  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Navbar />

      <div className="app-body">
        {/* Left Sidebar navigation */}
        <Sidebar />

        {/* Center Panel - Main tabs routing */}
        <main className="main-content">
          {activeTab === 'feed' && <Feed />}
          {activeTab === 'reels' && <ReelsView />}
          {activeTab === 'watch' && <WatchView />}
          {activeTab === 'messages' && <MessagesView />}
          {activeTab === 'pages' && <PagesView />}
          {activeTab === 'page-detail' && <PagesView />}
          {activeTab === 'profile' && <ProfileView />}
        </main>
      </div>

      {/* Global calling video/voice popup screen */}
      <CallModal />
    </div>
  );
}

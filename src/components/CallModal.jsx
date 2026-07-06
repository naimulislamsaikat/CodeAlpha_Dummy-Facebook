import React, { useEffect, useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Phone, Video, PhoneOff, Mic, MicOff, VideoOff, Volume2 } from 'lucide-react';

export default function CallModal() {
  const { activeCall, acceptCall, rejectCall, hangupCall } = useApp();
  
  const [callTime, setCallTime] = useState(0);
  const [micActive, setMicActive] = useState(true);
  const [videoActive, setVideoActive] = useState(true);
  const localVideoRef = useRef(null);
  const streamRef = useRef(null);

  // Connection timer
  useEffect(() => {
    let interval = null;
    if (activeCall && activeCall.state === 'connected') {
      interval = setInterval(() => {
        setCallTime(prev => prev + 1);
      }, 1000);
    } else {
      setCallTime(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeCall]);

  // Webcam stream capture (connected video call simulation)
  useEffect(() => {
    const startWebcam = async () => {
      if (activeCall && activeCall.state === 'connected' && activeCall.type === 'video' && videoActive) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          streamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.warn('Webcam permission denied or unavailable:', err);
        }
      }
    };

    if (activeCall && activeCall.state === 'connected') {
      startWebcam();
    } else {
      // Stop stream on hangup
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [activeCall, videoActive]);

  if (!activeCall) return null;

  // Format call timer
  const formatTime = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="call-modal-overlay">
      <div className="glass-panel call-modal-box" style={{
        background: 'rgba(14, 18, 36, 0.9)',
        color: 'white',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        
        {/* Call header type display */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.8, fontSize: '0.85rem' }}>
          {activeCall.type === 'video' ? <Video size={16} /> : <Phone size={16} />}
          <span>{activeCall.type.toUpperCase()} CALL</span>
        </div>

        {/* 1. CONNECTED STATE VIEW */}
        {activeCall.state === 'connected' ? (
          <>
            <div style={{ width: '100%' }}>
              {activeCall.type === 'video' ? (
                <div className="call-active-video-container">
                  {/* Local self webcam feed (Picture in Picture) */}
                  {videoActive && (
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="call-self-video"
                    />
                  )}
                  
                  {/* Remote user simulation image/feed */}
                  {activeCall.partnerAvatar ? (
                    <img 
                      src={activeCall.partnerAvatar} 
                      className="call-remote-video-feed" 
                      alt="Remote Feed"
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      background: 'var(--accent-gradient)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      fontWeight: 700
                    }}>
                      {activeCall.partnerName}
                    </div>
                  )}

                  <div style={{
                    position: 'absolute',
                    bottom: '12px',
                    left: '12px',
                    background: 'rgba(0, 0, 0, 0.5)',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem'
                  }}>
                    {activeCall.partnerName}
                  </div>
                </div>
              ) : (
                /* Voice call layout */
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', margin: '20px 0' }}>
                  <div className="call-avatar-pulse">
                    {activeCall.partnerAvatar ? (
                      <img src={activeCall.partnerAvatar} alt="Partner avatar" />
                    ) : (
                      <div className="profile-avatar" style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--accent-gradient)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '2.5rem'
                      }}>
                        {activeCall.partnerName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <h3>{activeCall.partnerName}</h3>
                </div>
              )}
            </div>

            <div style={{ fontSize: '1.2rem', fontWeight: 600, letterSpacing: '0.05em' }}>
              {formatTime(callTime)}
            </div>

            {/* Controls Panel */}
            <div className="call-controls" style={{ marginTop: '10px' }}>
              <button
                onClick={() => setMicActive(!micActive)}
                className="btn-circle btn-secondary"
                style={{ background: micActive ? 'var(--bg-input)' : '#ef4444', color: micActive ? 'var(--text-primary)' : 'white' }}
              >
                {micActive ? <Mic size={18} /> : <MicOff size={18} />}
              </button>

              {activeCall.type === 'video' && (
                <button
                  onClick={() => setVideoActive(!videoActive)}
                  className="btn-circle btn-secondary"
                  style={{ background: videoActive ? 'var(--bg-input)' : '#ef4444', color: videoActive ? 'var(--text-primary)' : 'white' }}
                >
                  {videoActive ? <Video size={18} /> : <VideoOff size={18} />}
                </button>
              )}

              <button
                onClick={hangupCall}
                className="call-btn-hangup btn animate-fade-in"
                title="Hang Up"
              >
                <PhoneOff size={22} />
              </button>
            </div>
          </>
        ) : (
          /* 2. DIALING / RINGING INCOMING STATE VIEWS */
          <>
            <div className="call-avatar-pulse">
              {activeCall.partnerAvatar ? (
                <img src={activeCall.partnerAvatar} alt="Partner" />
              ) : (
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--accent-gradient)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '2.5rem'
                }}>
                  {activeCall.partnerName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '6px' }}>{activeCall.partnerName}</h2>
              <span style={{ fontSize: '0.9rem', opacity: 0.8 }} className="gradient-text">
                {activeCall.state === 'ringing' 
                  ? 'Incoming call...' 
                  : 'Dialing connection network...'
                }
              </span>
            </div>

            {/* Answer / Hang Up buttons */}
            <div className="call-controls" style={{ marginTop: '20px' }}>
              {activeCall.isIncoming && activeCall.state === 'ringing' ? (
                <>
                  <button
                    onClick={acceptCall}
                    className="call-btn-accept btn"
                    title="Accept Call"
                  >
                    <Phone size={22} />
                  </button>
                  <button
                    onClick={rejectCall}
                    className="call-btn-hangup btn"
                    title="Decline Call"
                  >
                    <PhoneOff size={22} />
                  </button>
                </>
              ) : (
                /* Dialing outgoing call */
                <button
                  onClick={hangupCall}
                  className="call-btn-hangup btn"
                  title="Cancel Dialing"
                >
                  <PhoneOff size={22} />
                </button>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
}

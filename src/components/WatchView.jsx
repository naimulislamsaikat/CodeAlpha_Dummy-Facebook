import React, { useState } from 'react';
import { Play, Eye, Clock, ThumbsUp, Calendar } from 'lucide-react';

export default function WatchView() {
  const [selectedVideo, setSelectedVideo] = useState(null);

  const videos = [
    {
      id: 'v1',
      title: 'Sintel - Cinematic Storytelling CGI Project',
      description: 'A beautiful CGI open-source short film project by the Blender Foundation. Sintel is a female warrior who finds a baby dragon and nurtures it, leading to an emotional search.',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&h=350&fit=crop',
      channel: 'Blender Studio',
      views: '1.4M views',
      duration: '14:48',
      date: '3 months ago'
    },
    {
      id: 'v2',
      title: 'Big Buck Bunny - Forest Wildlife CGI Loop',
      description: 'An old-time classic comedy short film. Follow a giant white rabbit who decides to take revenge on three bullying forest rodents.',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=600&h=350&fit=crop',
      channel: 'Bunny Channel',
      views: '840K views',
      duration: '09:56',
      date: '1 year ago'
    },
    {
      id: 'v3',
      title: 'Elephants Dream - Surreal Sci-Fi Adventure',
      description: 'The world\'s first open movie project, exploring surreal mechanical corridors and steam chambers inside an expansive computer-generated landscape.',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=350&fit=crop',
      channel: 'Project Orange',
      views: '320K views',
      duration: '10:53',
      date: '2 years ago'
    },
    {
      id: 'v4',
      title: 'For Bigger Blazes - Extreme Volcano Eruptions',
      description: 'Observe dramatic lava currents, molten geysers, and structural tectonic shifts from volcanic zones across the Hawaiian archipelago and Iceland.',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1461360228754-6e81c478b882?w=600&h=350&fit=crop',
      channel: 'Earth Watchers',
      views: '5.2M views',
      duration: '00:15',
      date: '2 weeks ago'
    }
  ];

  return (
    <div style={{ width: '100%', maxWidth: '850px' }} className="animate-fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Watch Showcase</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Explore trending video streams and documentaries</p>
      </div>

      {/* 1. Video Player detail panel */}
      {selectedVideo && (
        <div className="glass-panel animate-fade-in" style={{ padding: '20px', borderRadius: 'var(--radius-lg)', marginBottom: '24px', overflow: 'hidden' }}>
          <div style={{ background: '#000', borderRadius: 'var(--radius-md)', overflow: 'hidden', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <video 
              src={selectedVideo.url} 
              controls 
              autoPlay 
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
          <h3 style={{ marginTop: '16px', fontSize: '1.25rem', lineHeight: '1.4' }}>{selectedVideo.title}</h3>
          
          <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginTop: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            <div>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedVideo.channel}</span>
              <span style={{ margin: '0 8px' }}>•</span>
              <span>{selectedVideo.views}</span>
              <span style={{ margin: '0 8px' }}>•</span>
              <span>{selectedVideo.date}</span>
            </div>
            
            <button className="btn-secondary" style={{ padding: '4px 12px', fontSize: '0.75rem', borderRadius: 'var(--radius-full)' }}>
              <ThumbsUp size={12} /> Like Video
            </button>
          </div>

          <p style={{ marginTop: '14px', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5', whiteSpace: 'pre-line' }}>
            {selectedVideo.description}
          </p>
        </div>
      )}

      {/* 2. Video Grid */}
      <h3 style={{ fontSize: '1.1rem', marginBottom: '14px' }}>Recommended Videos</h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '20px'
      }}>
        {videos.map(video => (
          <div 
            key={video.id} 
            className="glass-panel glass-panel-hover" 
            onClick={() => {
              setSelectedVideo(video);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            style={{
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              height: '280px'
            }}
          >
            {/* Thumbnail */}
            <div style={{ position: 'relative', width: '100%', height: '150px', background: '#111' }}>
              <img src={video.thumbnail} alt={video.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              
              {/* Duration overlay badge */}
              <span style={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
                background: 'rgba(0, 0, 0, 0.75)',
                color: 'white',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: 'var(--radius-sm)'
              }}>
                {video.duration}
              </span>

              {/* Play symbol */}
              <div className="video-play-btn" style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'var(--accent-gradient)',
                color: 'white',
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-md)',
                opacity: 0.9
              }}>
                <Play size={18} style={{ marginLeft: '2px' }} />
              </div>
            </div>

            {/* Meta context info */}
            <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h4 style={{
                fontSize: '0.9rem',
                lineHeight: '1.4',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                height: '38px'
              }}>
                {video.title}
              </h4>
              
              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {video.channel}
                </span>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                  <Eye size={10} /> <span>{video.views}</span>
                  <span>•</span>
                  <Clock size={10} /> <span>{video.date}</span>
                </div>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}

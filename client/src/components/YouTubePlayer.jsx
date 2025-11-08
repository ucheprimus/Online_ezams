// components/YouTubePlayer.jsx
import React, { useEffect, useRef } from 'react';

const YouTubePlayer = ({ videoId, onVideoEnd }) => {
  const iframeRef = useRef(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    
    const handleMessage = (event) => {
      // Handle YouTube player events
      if (event.origin !== 'https://www.youtube.com') return;
      
      try {
        const data = JSON.parse(event.data);
        if (data.event === 'onStateChange' && data.info === 0) {
          // Video ended
          console.log('Video ended via message');
          if (onVideoEnd) onVideoEnd();
        }
      } catch (e) {
        // Ignore non-JSON messages
      }
    };

    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [onVideoEnd]);

  // Fallback if no videoId
  if (!videoId) {
    return (
      <div className="video-placeholder d-flex align-items-center justify-content-center bg-dark text-white">
        <div className="text-center">
          <i className="bi bi-play-circle display-1"></i>
          <p className="mt-3">No video available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ratio ratio-16x9">
      <iframe
        ref={iframeRef}
        src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0&modestbranding=1`}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        style={{ border: 'none', borderRadius: '8px' }}
      ></iframe>
    </div>
  );
};

export default YouTubePlayer;
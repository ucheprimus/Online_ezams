// components/YouTubePlayer.jsx
import React, { useEffect, useRef } from 'react';

const YouTubePlayer = ({ videoId, onVideoEnd }) => {
  const playerRef = useRef(null);
  const iframeRef = useRef(null);

  useEffect(() => {
    // Load YouTube IFrame API
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    // Initialize player when API is ready
    window.onYouTubeIframeAPIReady = () => {
      initializePlayer();
    };

    // If API is already loaded, initialize immediately
    if (window.YT && window.YT.Player) {
      initializePlayer();
    }

    function initializePlayer() {
      playerRef.current = new window.YT.Player(iframeRef.current, {
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          modestbranding: 1,
          rel: 0,
          enablejsapi: 1,
          origin: window.location.origin
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange
        }
      });
    }

    function onPlayerReady(event) {
      console.log('✅ YouTube player ready');
    }

    function onPlayerStateChange(event) {
      // Video ended (state = 0)
      if (event.data === window.YT.PlayerState.ENDED) {
        console.log('✅ Video ended - triggering onVideoEnd callback');
        if (onVideoEnd) {
          onVideoEnd();
        }
      }
    }

    return () => {
      // Cleanup: destroy player when component unmounts
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
      }
    };
  }, [videoId, onVideoEnd]);

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
      <div ref={iframeRef}></div>
    </div>
  );
};

export default YouTubePlayer;
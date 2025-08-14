'use client';
import React from 'react';

interface EmbedPlayerProps {
  url: string;
}

function EmbedPlayer(props: EmbedPlayerProps) {
  React.useEffect(() => {
    if (ref.current) {
      ref.current.src = props.url;
    }

    const iframe: HTMLIFrameElement | null = ref.current;
    iframe?.addEventListener('load', handleIframeLoaded);
    return () => {
      iframe?.removeEventListener('load', handleIframeLoaded);
    };
  }, []);

  const ref = React.useRef<HTMLIFrameElement>(null);
  const [blockClicks, setBlockClicks] = React.useState(true);

  React.useEffect(() => {
    const t = window.setTimeout(() => setBlockClicks(false), 2500);
    return () => window.clearTimeout(t);
  }, []);

  const handleIframeLoaded = () => {
    if (!ref.current) {
      return;
    }
    const iframe: HTMLIFrameElement = ref.current;
    if (iframe) iframe.style.opacity = '1';
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        backgroundColor: '#000',
      }}>
      {blockClicks && (
        <div
          onClick={() => setBlockClicks(false)}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            cursor: 'pointer',
          }}
          aria-hidden
        />
      )}
      <iframe
        ref={ref}
        width="100%"
        height="100%"
        allowFullScreen
        sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
        style={{ opacity: 0 }}
        referrerPolicy="no-referrer"
        loading="eager"
        title="embed-player"
        aria-label="Video player"
      />
    </div>
  );
}

export default EmbedPlayer;

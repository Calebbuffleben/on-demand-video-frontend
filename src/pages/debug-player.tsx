'use client';

import React, { useEffect, useState } from 'react';

export default function DebugPlayerPage() {
  const [hlsLoaded, setHlsLoaded] = useState<boolean>(false);
  const [hlsSupported, setHlsSupported] = useState<boolean | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    const detect = async () => {
      try {
        let mod: any;
        try {
          mod = await import('hls.js');
        } catch {
          try {
            mod = await import('hls.js/dist/hls.min.js');
          } catch {
            mod = await import('hls.js/dist/hls.mjs');
          }
        }
        if (cancelled) return;
        const HlsCtor = mod?.default ?? mod;
        setHlsLoaded(!!HlsCtor);
        const supported = typeof HlsCtor?.isSupported === 'function' ? HlsCtor.isSupported() : false;
        setHlsSupported(supported);
      } catch (e: any) {
        setHlsLoaded(false);
        setHlsSupported(false);
        setError(String(e?.message || e));
      }
    };
    detect();
    return () => { cancelled = true; };
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Debug Video Player</h1>
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
        <h3>Environment Check:</h3>
        <ul>
          <li>HLS.js Loaded: {hlsLoaded ? 'Yes' : 'No'}</li>
          <li>HLS.js Supported: {hlsSupported === null ? 'Checking...' : hlsSupported ? 'Yes' : 'No'}</li>
          <li>Error: {error || 'None'}</li>
        </ul>
      </div>
    </div>
  );
}

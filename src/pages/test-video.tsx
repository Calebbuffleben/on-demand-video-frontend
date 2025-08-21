import React from 'react';
import CustomVideoPlayer from '../components/Video/CustomVideoPlayer';

export default function TestVideoPage() {
  const videoId = 'ec7f7159-c458-4293-a3d0-8cf9ddbf31db';
  const src = {
    hls: `http://localhost:4000/api/videos/stream/${videoId}/master.m3u8`,
  };

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '800px', 
      margin: '0 auto',
      backgroundColor: '#f0f0f0',
      minHeight: '100vh'
    }}>
      <h1>Teste do Custom Video Player</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <p><strong>Video ID:</strong> {videoId}</p>
        <p><strong>HLS URL:</strong> {src.hls}</p>
      </div>

      <div style={{ 
        backgroundColor: '#000', 
        borderRadius: '8px', 
        overflow: 'hidden',
        maxWidth: '100%',
        aspectRatio: '16/9'
      }}>
        <CustomVideoPlayer
          src={src}
          videoId={videoId}
          title="Teste de Vídeo"
          autoPlay={false}
          showControls={true}
          muted={false}
          loop={false}
          showTechnicalInfo={true}
          onError={(error) => {
            console.error('Video Error:', error);
            alert(`Erro no vídeo: ${error.message}`);
          }}
        />
      </div>

      <div style={{ marginTop: '20px', fontSize: '14px' }}>
        <h3>Informações de Debug:</h3>
        <ul>
          <li>HLS.js suportado: {typeof window !== 'undefined' && 'Hls' in window ? 'Sim' : 'Não'}</li>
          <li>Navegador: {typeof window !== 'undefined' ? window.navigator.userAgent : 'Server'}</li>
          <li>URL Base da API: {process.env.NEXT_PUBLIC_API_URL || '/api'}</li>
        </ul>
      </div>
    </div>
  );
}

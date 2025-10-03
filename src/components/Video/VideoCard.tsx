import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { VideoData } from '../../api-connection/videos';
import Image from 'next/image';
import { resolveAssetUrl, buildThumbUrl } from '@/lib/utils';
import { useOrganization } from '@/hooks/useOrganization';

interface VideoCardProps {
  video: VideoData;
  onDelete?: (videoId: string) => void;
  className?: string;
}

export default function VideoCard({ video, onDelete }: VideoCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const { tenantId } = router.query;
  const { organization } = useOrganization();
  
  const thumbnailSrc = resolveAssetUrl(video.thumbnail) || buildThumbUrl(video.uid);
  
  // Helper functions to get tenant-aware URLs
  const getVideoWatchUrl = (uid: string) => {
    const orgId = organization?.id || tenantId;
    return `/${orgId}/videos/watch/${uid}`;
  };

  
  const getEmbedUrl = (uid: string) => {
    const orgId = organization?.id || tenantId;
    return `/${orgId}/embed/${uid}`;
  };

  return (
    <div className="bg-white border border-silver-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      {/* Thumbnail or placeholder */}
      <Link href={getVideoWatchUrl(video.uid)} className="block relative">
        <div className="aspect-video bg-silver-100 relative">
          {thumbnailSrc ? (
            <Image
              src={thumbnailSrc}
              alt={video.meta?.name || 'Miniatura do vídeo'}
              className="w-full h-full object-cover"
              width={320}
              height={180}
              style={{ objectFit: 'cover' }}
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-silver-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-silver-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          
          <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="bg-white rounded-full p-3 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-scale-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              </svg>
            </div>
          </div>
          
          <div className="absolute top-2 right-2">
            <span className={`text-xs px-2 py-1 rounded-full ${video.readyToStream ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              {video.readyToStream ? 'Pronto' : 'Processando'}
            </span>
          </div>
        </div>
      </Link>
      
      {/* Video info */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-scale-900 truncate">
            <Link href={getVideoWatchUrl(video.uid)} className="hover:underline">
              {video.meta?.name || 'Vídeo Sem Título'}
            </Link>
          </h3>
          
          {/* Dropdown menu */}
          <div className="relative">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1 text-silver-500 hover:text-silver-700 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
            
            {isMenuOpen && (
              <div className="absolute right-full mr-2 top-0 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-silver-200">
                <Link 
                  href={tenantId ? `/${tenantId}/videos/edit/${video.uid}` : `/videos/edit/${video.uid}`}
                  className="block px-4 py-2 text-sm text-scale-700 hover:bg-silver-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Editar detalhes do vídeo
                </Link>
                
                <Link 
                  href={getVideoWatchUrl(video.uid)}
                  className="block px-4 py-2 text-sm text-scale-700 hover:bg-silver-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Detalhes do vídeo
                </Link>
                
                <Link 
                  href={getEmbedUrl(video.uid)} 
                  className="block px-4 py-2 text-sm text-scale-700 hover:bg-silver-100"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Visualizar incorporação
                </Link>
                
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-scale-700 hover:bg-silver-100"
                  onClick={() => {
                    setIsMenuOpen(false);
                    const embedCode = `<iframe 
                        src="${window.location.origin}${getEmbedUrl(video.uid)}" 
                        width="640" 
                        height="360" 
                        frameborder="0" 
                        allow="autoplay; fullscreen" 
                        allowfullscreen>
                      </iframe>`;
                    navigator.clipboard.writeText(embedCode);
                    alert('Código de incorporação copiado para a área de transferência!');
                  }}
                >
                  Copiar código de incorporação
                </button>
                
                {onDelete && (
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-silver-100"
                    onClick={() => {
                      setIsMenuOpen(false);
                      if (confirm('Tem certeza de que deseja excluir este vídeo?')) {
                        onDelete(video.uid);
                      }
                    }}
                  >
                    Excluir vídeo
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        
        <p className="text-silver-500 text-sm mb-3 truncate">
          {video.meta?.filename || 'Nome do arquivo não disponível'}
        </p>
        
        <div className="flex justify-between items-center text-xs text-silver-500">
          <span>
            {new Date(video.created).toLocaleDateString()}
          </span>
          
          <Link 
            href={getVideoWatchUrl(video.uid)}
            className="text-scale-900 hover:text-scale-700 flex items-center font-medium"
          >
            Assistir
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
} 
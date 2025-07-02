interface VideoInfoProps {
  videoId: string;
  name: string;
  format: string;
  duration: number;
  readyToStream: boolean;
  preview: string;
  playback: {
    hls: string;
    dash: string;
  };
  className?: string;
}

export default function VideoInfoCard({
  videoId,
  name,
  format,
  duration,
  readyToStream,
  preview,
  playback,
  className = '',
}: VideoInfoProps) {
  // Format duration
  const formattedDuration = `${Math.floor(duration / 60)}:${(duration % 60).toFixed(0).padStart(2, '0')}`;

  return (
    <div className={`bg-white rounded-lg shadow overflow-hidden ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900 truncate">{name}</h2>
        <p className="text-sm text-gray-500 mt-1">Duração: {formattedDuration}</p>
      </div>

      <div className="px-6 py-4">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Informações do Vídeo</h3>
            <dl className="mt-2 border-t border-b border-gray-200 divide-y divide-gray-200">
              <div className="py-3 flex justify-between text-sm">
                <dt className="text-gray-500">ID do Vídeo</dt>
                <dd className="text-gray-900 font-mono">{videoId}</dd>
              </div>
              <div className="py-3 flex justify-between text-sm">
                <dt className="text-gray-500">Formato</dt>
                <dd className="text-gray-900">{format}</dd>
              </div>
              <div className="py-3 flex justify-between text-sm">
                <dt className="text-gray-500">Pronto para Streaming</dt>
                <dd className="text-gray-900">{readyToStream ? 'Sim' : 'Não'}</dd>
              </div>
            </dl>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-900">Links Diretos</h3>
            <div className="mt-2 space-y-2">
              <a 
                href={preview} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Abrir no Cloudflare Stream
              </a>

              <a 
                href={playback.hls} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                URL do Stream HLS
              </a>

              <a 
                href={playback.dash} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                URL do Stream DASH
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
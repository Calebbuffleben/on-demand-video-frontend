import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import DashboardMenu from '@/components/Dashboard/DashboardMenu';
import MuxVideoPlayer from '@/components/Video/MuxVideoPlayer';
import videoService, { VideoData } from '@/api-connection/videos';

export default function VideoDetailPage() {
  const [video, setVideo] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { videoId, tenantId } = router.query;

  useEffect(() => {
    if (videoId && typeof videoId === 'string') {
      fetchVideo(videoId);
    }
  }, [videoId]);

  const fetchVideo = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching video with ID:', id);
      const response = await videoService.getVideoByUid(id);
      console.log('API Response:', JSON.stringify(response, null, 2));
      
      if (response.success && response.data) {
        // Handle both array and object responses
        let videoData: VideoData | null = null;
        
        if (response.data.result && Array.isArray(response.data.result) && response.data.result.length > 0) {
          // If result is an array, get the first element
          videoData = response.data.result[0];
        } else if (response.data.result && typeof response.data.result === 'object') {
          // If result is a direct object, use it
          videoData = response.data.result as unknown as VideoData;
        }
        
        if (videoData) {
          console.log('Video data:', JSON.stringify(videoData, null, 2));
          setVideo(videoData);
        } else {
          throw new Error('Nenhum dado de vídeo disponível');
        }
      } else {
        // Only throw an error if the response indicates a failure
        if (!response.success) {
          const errorMessage = response.message || 'Falha ao carregar vídeo';
          console.error('API response error:', response);
          throw new Error(errorMessage);
        } else {
          // Handle case where response is successful but no video data
          console.error('API response has no video data:', response);
          throw new Error('Nenhum dado de vídeo disponível');
        }
      }
    } catch (err: unknown) {
      console.error('Error fetching video:', err);
      const errorMessage = err instanceof Error ? err.message : 'Falha ao carregar vídeo';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to navigate back to videos
  const getVideosUrl = () => {
    return tenantId ? `/${tenantId}/videos` : '/my-videos';
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    if (!seconds) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = async () => {
    if (window.confirm('Tem certeza de que deseja excluir este vídeo? Esta ação não pode ser desfeita.')) {
      // In a real implementation, you'd call an API to delete the video
      // For now, we'll just redirect back to the videos page
      router.push(getVideosUrl());
      // TODO: Implement actual deletion API call when backend supports it
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copiado para a área de transferência!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>{video?.meta?.name || 'Detalhes do Vídeo'}</title>
      </Head>

      <header className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold text-white truncate">
                {video?.meta?.name || 'Detalhes do Vídeo'}
              </h1>
              <p className="text-blue-100 text-sm mt-1">Gerenciamento de Vídeo</p>
            </div>
            <DashboardMenu />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link href={getVideosUrl()} className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar aos Vídeos
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white p-12 rounded-lg shadow-sm flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Carregando vídeo...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  {error}
                </p>
                <div className="mt-2">
                  <button 
                    onClick={() => router.back()}
                    className="text-sm text-red-700 underline hover:text-red-800"
                  >
                    Voltar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Video Detail View */}
        {!loading && !error && video && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Video Player Column */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                  <div className="absolute inset-0">
                    {video.playback?.hls ? (
                      <MuxVideoPlayer 
                        src={video.playback}
                        title={video.meta?.displayOptions?.showTitle ? video.meta?.name : undefined}
                        autoPlay={video.meta?.displayOptions?.autoPlay}
                        showControls={video.meta?.displayOptions?.showPlaybackControls}
                        muted={video.meta?.displayOptions?.muted}
                        loop={video.meta?.displayOptions?.loop}
                        hideProgress={!video.meta?.displayOptions?.showProgressBar}
                        showTechnicalInfo={video.meta?.embedOptions?.showTechnicalInfo}
                        useOriginalProgressBar={video.meta?.displayOptions?.useOriginalProgressBar}
                        progressBarColor={video.meta?.displayOptions?.progressBarColor}
                        progressEasing={video.meta?.displayOptions?.progressEasing}
                        playButtonColor={video.meta?.displayOptions?.playButtonColor}
                        playButtonSize={video.meta?.displayOptions?.playButtonSize}
                        playButtonBgColor={video.meta?.displayOptions?.playButtonBgColor}
                        poster={video.thumbnail || undefined}
                        soundControlText={video.meta?.displayOptions?.soundControlText}
                        soundControlColor={video.meta?.displayOptions?.soundControlColor}
                        soundControlOpacity={video.meta?.displayOptions?.soundControlOpacity}
                        soundControlSize={video.meta?.displayOptions?.soundControlSize}
                        showSoundControl={video.meta?.displayOptions?.showSoundControl ?? false}
                        showCta={!!video.ctaText}
                        ctaText={video.ctaText}
                        ctaButtonText={video.ctaButtonText}
                        ctaLink={video.ctaLink}
                        ctaStartTime={video.ctaStartTime}
                        ctaEndTime={video.ctaEndTime}
                      />
                    ) : (
                      <div className="aspect-video bg-gray-900 flex items-center justify-center text-white">
                        <div className="text-center p-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p>Reprodução de vídeo não disponível</p>
                          <p className="text-sm text-gray-400 mt-1">O vídeo pode ainda estar sendo processado</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-medium text-gray-900 mb-2">{video.meta?.name}</h2>
                
                <div className="flex flex-wrap gap-3 mb-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {video.meta?.filetype ? video.meta.filetype.toUpperCase() : 'TIPO DESCONHECIDO'}
                  </span>
                  
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {formatDuration(video.duration)} duração
                  </span>
                  
                  {video.readyToStream ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Pronto para Reprodução
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Processando
                    </span>
                  )}
                </div>
                
                <div className="flex items-center text-sm text-gray-500 mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Enviado em {formatDate(video.created)}
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex space-x-3">
                    <button 
                      onClick={handleDelete}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Excluir Vídeo
                    </button>
                    
                    <Link 
                      href={`/${tenantId}/videos/edit/${videoId}`}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Editar Vídeo
                    </Link>
                    
                    <button 
                      onClick={() => copyToClipboard(video.playback.hls)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      Copiar URL do Stream
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Video Info Column */}
            <div>
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Informações do Vídeo</h3>
                </div>
                
                <div className="p-6">
                  <dl className="space-y-4">
                    <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-500">ID do Vídeo</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-mono">{video.uid}</dd>
                    </div>
                    
                    <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-500">Arquivo Original</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{video.meta?.filename || 'Desconhecido'}</dd>
                    </div>
                    
                    <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-500">Tamanho</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formatFileSize(video.size || 0)}</dd>
                    </div>
                    
                    <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-500">Resolução</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {video.input ? `${video.input.width || 0} x ${video.input.height || 0}` : 'Desconhecida'}
                      </dd>
                    </div>
                    
                    <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-500">Criado</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formatDate(video.created)}</dd>
                    </div>
                    
                    <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-500">Modificado</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formatDate(video.modified)}</dd>
                    </div>
                    
                    {video.status && (
                      <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                        <dt className="text-sm font-medium text-gray-500">Status</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {video.status.state}
                          {video.status.pctComplete && ` (${video.status.pctComplete}%)`}
                        </dd>
                      </div>
                    )}

                    <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-500">Organização</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {tenantId || 'Pessoal'}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
              
              {video.playback?.hls ? (
                <div className="bg-white rounded-lg shadow-md overflow-hidden mt-6">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Código de Incorporação</h3>
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-gray-500 mb-4">Use este código para incorporar o vídeo em seu site:</p>
                    <div className="bg-gray-50 p-4 rounded-md font-mono text-xs overflow-x-auto">
                      {`<iframe
                          src="${window.location.origin}/${tenantId}/embed/${videoId}"
                          style="width:100%;height:100%;position:absolute;left:0px;top:0px;overflow:hidden;"
                          frameborder="0"
                          allow="autoplay; fullscreen"
                          allowfullscreen
                        ></iframe>`}
                    </div>
                    <button 
                      onClick={() => copyToClipboard(`<iframe src=\"${window.location.origin}/${tenantId}/embed/${videoId}\" style=\"width:100%;height:100%;position:absolute;left:0px;top:0px;overflow:hidden;\" frameborder=\"0\" allow=\"autoplay; fullscreen\" allowfullscreen></iframe>`)}
                      className="mt-4 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="-ml-0.5 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      Copiar Código de Incorporação
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden mt-6">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Código de Incorporação</h3>
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-gray-500">
                      Código de incorporação não disponível. O vídeo pode ainda estar sendo processado.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 
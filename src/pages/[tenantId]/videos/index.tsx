import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useOrganization } from '@clerk/nextjs';
import Head from 'next/head';
import Link from 'next/link';
import DashboardMenu from '../../../components/Dashboard/DashboardMenu';
import DashboardLayout from '../../../components/Dashboard/DashboardLayout';
import DashboardSidebar from '../../../components/Dashboard/DashboardSidebar';
import VideoCard from '../../../components/Video/VideoCard';
import EmptyVideoState from '../../../components/Video/EmptyVideoState';
import videoService, { VideoData } from '../../../api-connection/videos';
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline';

export default function TenantVideosPage() {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const { organization } = useOrganization();
  const { tenantId } = router.query;

  // Get filtered videos based on search term
  const filteredVideos = videos.filter(video => 
    video.meta?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper function to navigate back to dashboard
  const getDashboardUrl = () => {
    if (tenantId && typeof tenantId === 'string') {
      return `/${tenantId}/dashboard`;
    }
    return organization?.id ? `/${organization.id}/dashboard` : '/dashboard';
  };

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await videoService.getAllVideos();
      
      if (response.success && response.data.result) {
        setVideos(response.data.result);
      } else {
        throw new Error('Falha ao buscar vídeos');
      }
    } catch (err: unknown) {
      console.error('Error fetching videos:', err);
      const errorMessage = err instanceof Error ? err.message : 'Falha ao carregar vídeos';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleDeleteVideo = async (videoId: string) => {
    // In a real implementation, you'd call an API to delete the video
    // For now, we'll just remove it from the local state
    setVideos(prev => prev.filter(video => video.uid !== videoId));
    // TODO: Implement actual deletion API call when backend supports it
    try {
      await videoService.deleteVideo(videoId);
    } catch (error) {
      console.error('Error deleting video:', error);
    }
  };

  return (
    <>
      <Head>
        <title>Meus Vídeos</title>
      </Head>
      
      <DashboardLayout sidebar={<DashboardSidebar />}>
        <div className="p-4 md:p-6">
          <header className="bg-white shadow-sm mb-6 rounded-lg">
            <div className="px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-semibold">Meus Vídeos</h1>
                <p className="text-gray-600 text-sm mt-1">Gerencie seus vídeos enviados</p>
              </div>
              <DashboardMenu />
            </div>
          </header>

          {/* Breadcrumb */}
          <div className="mb-6">
            <Link href={getDashboardUrl()} className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Voltar ao Painel
            </Link>
          </div>

          {/* Search and Actions Bar */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center justify-between mb-6">
              <div className="w-64">
                <input
                  type="text"
                  placeholder="Buscar vídeos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <Link 
                href={tenantId ? `/${tenantId}/upload-video` : '/upload-video'} 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                <ArrowUpTrayIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Enviar Vídeo
              </Link>
            </div>
          </div>

          {/* Content (loading, error, empty, or videos grid) */}
          {loading && (
            <div className="bg-white p-12 rounded-lg shadow-sm flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Carregando seus vídeos...</p>
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
                      onClick={fetchVideos}
                      className="text-sm text-red-700 underline hover:text-red-800"
                    >
                      Tentar novamente
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredVideos.length === 0 && (
            searchTerm ? (
              <div className="text-center py-12">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum vídeo corresponde à sua busca</h3>
                <p className="text-gray-500 mb-4">
                  Tente usar palavras-chave diferentes ou limpe sua busca
                </p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Limpar busca
                </button>
              </div>
            ) : (
              <EmptyVideoState />
            )
          )}

          {/* Videos Grid */}
          {!loading && !error && filteredVideos.length > 0 && (
            <div>
              <div className="mb-4 flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">
                  {searchTerm 
                    ? `Resultados da busca (${filteredVideos.length})` 
                    : `Todos os Vídeos (${videos.length})`
                  }
                </h2>
                <div className="text-sm text-gray-500">
                  {videos.filter(v => v.readyToStream).length} de {videos.length} prontos para reprodução
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVideos.map(video => (
                  <VideoCard 
                    key={video.uid} 
                    video={video}
                    onDelete={handleDeleteVideo}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
} 
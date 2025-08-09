import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import DashboardMenu from '../../../components/Dashboard/DashboardMenu';
import DashboardLayout from '../../../components/Dashboard/DashboardLayout';
import DashboardSidebar from '../../../components/Dashboard/DashboardSidebar';
import VideoCard from '../../../components/Video/VideoCard';
import EmptyVideoState from '../../../components/Video/EmptyVideoState';
import videoService, { VideoData } from '../../../api-connection/videos';
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import AuthGuard from '@/components/Auth/AuthGuard';

function TenantVideosPage() {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const { tenantId } = router.query;

  // Get filtered videos based on search term
  const filteredVideos = videos.filter(video => 
    video.meta?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );



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
    try {
      await videoService.deleteVideo(videoId);
      setVideos(prev => prev.filter(video => video.uid !== videoId));
    } catch (error) {
      console.error('Error deleting video:', error);
    }
  };

  return (
    <>
      <Head>
        <title>Meus Vídeos</title>
      </Head>
      <AuthGuard>
      <DashboardLayout sidebar={<DashboardSidebar />}>
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-semibold text-white">Meus Vídeos</h1>
                <p className="text-gray-300 text-sm mt-1">Gerencie seus vídeos enviados</p>
              </div>
              <DashboardMenu />
            </div>

            {/* Search and Actions Bar */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="Buscar vídeos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-silver-300 rounded-md shadow-sm focus:ring-scale-500 focus:border-scale-500"
                  />
                </div>
                <Link 
                  href={tenantId ? `/${tenantId}/upload-video` : '/upload-video'} 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-scale-900 hover:bg-scale-800"
                >
                  <ArrowUpTrayIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  Enviar Vídeo
                </Link>
              </div>
            </div>

            {/* Content */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg shadow-sm animate-pulse h-64"
                  />
                ))}
              </div>
            ) : error ? (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                    <button 
                      onClick={fetchVideos}
                      className="mt-2 text-sm text-red-700 underline hover:text-red-800"
                    >
                      Tentar novamente
                    </button>
                  </div>
                </div>
              </div>
            ) : filteredVideos.length === 0 ? (
              searchTerm ? (
                <div className="text-center py-12">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-silver-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <h3 className="text-lg font-medium text-scale-900 mb-2">Nenhum vídeo corresponde à sua busca</h3>
                  <p className="text-silver-500 mb-4">
                    Tente usar palavras-chave diferentes ou limpe sua busca
                  </p>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-scale-600 hover:text-scale-800 underline"
                  >
                    Limpar busca
                  </button>
                </div>
              ) : (
                <EmptyVideoState />
              )
            ) : (
              <div>
                <div className="mb-4 flex justify-between items-center">
                  <h2 className="text-lg font-medium text-white">
                    {searchTerm 
                      ? `Resultados da busca (${filteredVideos.length})` 
                      : `Todos os Vídeos (${videos.length})`
                    }
                  </h2>
                  <div className="text-sm text-gray-300">
                    {videos.filter(v => v.readyToStream).length} de {videos.length} prontos para reprodução
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
        </div>
      </DashboardLayout>
      </AuthGuard>
    </>
  );
}

export default TenantVideosPage;
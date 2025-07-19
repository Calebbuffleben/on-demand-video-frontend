import React, { useState, useEffect } from 'react';
import analyticsService, { VideoRetentionData } from '../../api-connection/analytics';

interface RetentionDataPoint {
  time: number;
  retention: number;
}

interface VideoRetentionChartProps {
  className?: string;
}

const VideoRetentionChart: React.FC<VideoRetentionChartProps> = ({ className = '' }) => {
  const [retentionData, setRetentionData] = useState<VideoRetentionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; retention: number; time: number } | null>(null);

  useEffect(() => {
    loadRetentionData();
  }, []);

  const loadRetentionData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get retention data for all videos in the organization
      const response = await analyticsService.getOrganizationRetention();
      
      if (response.success) {
        setRetentionData(response.data);
      } else {
        throw new Error('Failed to load retention data');
      }
    } catch (err) {
      console.error('Error loading retention data:', err);
      setError('Failed to load retention data');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getAverageRetention = (retention: RetentionDataPoint[]): number => {
    if (retention.length === 0) return 0;
    const sum = retention.reduce((acc, point) => acc + point.retention, 0);
    return Math.round(sum / retention.length);
  };

  const getRetentionColor = (percentage: number): string => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    if (percentage >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getRetentionBgColor = (percentage: number): string => {
    if (percentage >= 80) return 'bg-green-50 border-green-200';
    if (percentage >= 60) return 'bg-yellow-50 border-yellow-200';
    if (percentage >= 40) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  const getRetentionBarColor = (percentage: number): string => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-silver-200 rounded-lg w-1/3 mb-4"></div>
          <div className="h-64 bg-silver-200 rounded-lg mb-4"></div>
          <div className="space-y-2">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-4 bg-silver-200 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
        <div className="text-center text-red-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-lg font-medium">{error}</p>
          <button 
            onClick={loadRetentionData}
            className="mt-4 px-6 py-3 bg-scale-600 text-white rounded-lg hover:bg-scale-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (retentionData.length === 0) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
        <div className="text-center text-silver-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-silver-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-lg font-medium">Nenhum dado de retenção disponível</p>
          <p className="text-sm">Faça upload de vídeos para ver análises de retenção</p>
        </div>
      </div>
    );
  }

  const selectedVideoData = selectedVideo 
    ? retentionData.find(video => video.videoId === selectedVideo)
    : retentionData[0];

  const averageRetention = selectedVideoData ? getAverageRetention(selectedVideoData.retention) : 0;

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-scale-600 to-scale-700 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">📊 Retenção de Vídeos</h3>
            <p className="text-scale-100 mt-1">Análise detalhada de retenção de todos os vídeos da organização</p>
          </div>
          <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-sm font-medium">Analytics</span>
          </div>
        </div>
      </div>

      {/* Video Selector */}
      <div className="p-6 border-b border-silver-200 bg-silver-50">
        <label className="block text-sm font-semibold text-scale-700 mb-3">🎬 Selecionar Vídeo</label>
        <select
          value={selectedVideo || retentionData[0]?.videoId || ''}
          onChange={(e) => setSelectedVideo(e.target.value)}
          className="w-full px-4 py-3 border border-silver-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-scale-500 focus:border-scale-500 bg-white shadow-sm transition-all duration-200 hover:border-scale-400"
        >
          {retentionData.map((video) => (
            <option key={video.videoId} value={video.videoId}>
              {video.title} ({video.totalViews} visualizações)
            </option>
          ))}
        </select>
      </div>

      {/* Chart Area */}
      <div className="p-6">
        {selectedVideoData && (
          <div>
            {/* Enhanced Video Info Cards */}
            <div className="mb-8">
              <h4 className="text-xl font-bold text-scale-900 mb-4 flex items-center">
                <span className="mr-2">🎥</span>
                {selectedVideoData.title}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`text-center p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${getRetentionBgColor(averageRetention)}`}>
                  <div className="text-3xl font-bold text-scale-900 mb-2">{selectedVideoData.totalViews.toLocaleString()}</div>
                  <div className="text-sm text-silver-600 font-medium">Total de Visualizações</div>
                  <div className="mt-2 text-xs text-silver-500">📈 Engajamento total</div>
                </div>
                <div className="text-center p-6 rounded-xl border-2 border-silver-200 bg-silver-50 hover:shadow-lg transition-all duration-200">
                  <div className="text-3xl font-bold text-scale-900 mb-2">{formatTime(selectedVideoData.averageWatchTime)}</div>
                  <div className="text-sm text-silver-600 font-medium">Tempo Médio de Visualização</div>
                  <div className="mt-2 text-xs text-silver-500">⏱️ Duração média</div>
                </div>
                <div className={`text-center p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${getRetentionBgColor(averageRetention)}`}>
                  <div className={`text-3xl font-bold mb-2 ${getRetentionColor(averageRetention)}`}>
                    {averageRetention}%
                  </div>
                  <div className="text-sm text-silver-600 font-medium">Retenção Média</div>
                  <div className="mt-2 text-xs text-silver-500">📊 Performance geral</div>
                </div>
              </div>
            </div>

            {/* Enhanced Retention Chart */}
            <div className="mb-8">
              <h5 className="text-lg font-semibold text-scale-900 mb-4 flex items-center">
                <span className="mr-2">📈</span>
                Curva de Retenção
              </h5>
              <div className="bg-gradient-to-br from-silver-50 to-white rounded-xl p-6 border border-silver-200 relative">
                <svg 
                  className="w-full h-80" 
                  viewBox="0 0 100 100" 
                  preserveAspectRatio="none"
                  onMouseLeave={() => setHoveredPoint(null)}
                >
                  {/* Enhanced Grid lines */}
                  {[0, 25, 50, 75, 100].map((y) => (
                    <line
                      key={y}
                      x1="0"
                      y1={100 - y}
                      x2="100"
                      y2={100 - y}
                      stroke="#e5e7eb"
                      strokeWidth="0.5"
                      strokeDasharray={y === 50 ? "2,2" : "none"}
                    />
                  ))}
                  
                  {/* X-axis grid lines */}
                  {[0, 20, 40, 60, 80, 100].map((x) => (
                    <line
                      key={x}
                      x1={x}
                      y1="0"
                      x2={x}
                      y2="100"
                      stroke="#f3f4f6"
                      strokeWidth="0.5"
                    />
                  ))}
                  
                  {/* Enhanced Retention curve with hover effects */}
                  {selectedVideoData.retention.length > 0 && (
                    <>
                      <polyline
                        points={selectedVideoData.retention
                          .map((point, index) => {
                            const x = (index / (selectedVideoData.retention.length - 1)) * 100;
                            const y = 100 - point.retention;
                            return `${x},${y}`;
                          })
                          .join(' ')}
                        fill="none"
                        stroke="#171717"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="transition-all duration-200"
                      />
                      
                      {/* Hover points */}
                      {selectedVideoData.retention.map((point, index) => {
                        const x = (index / (selectedVideoData.retention.length - 1)) * 100;
                        const y = 100 - point.retention;
                        return (
                          <circle
                            key={index}
                            cx={x}
                            cy={y}
                            r="3"
                            fill="#171717"
                            className="cursor-pointer transition-all duration-200 hover:r-5 hover:fill-scale-600"
                            onMouseEnter={() => setHoveredPoint({ x, y, retention: point.retention, time: point.time })}
                          />
                        );
                      })}
                    </>
                  )}
                  
                  {/* Enhanced Area under curve */}
                  {selectedVideoData.retention.length > 0 && (
                    <polygon
                      points={`0,100 ${selectedVideoData.retention
                        .map((point, index) => {
                          const x = (index / (selectedVideoData.retention.length - 1)) * 100;
                          const y = 100 - point.retention;
                          return `${x},${y}`;
                        })
                        .join(' ')} 100,100`}
                      fill="url(#retentionGradient)"
                      opacity="0.15"
                    />
                  )}
                  
                  {/* Enhanced Gradient definition */}
                  <defs>
                    <linearGradient id="retentionGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#171717" stopOpacity="0.4" />
                      <stop offset="50%" stopColor="#171717" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#171717" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>
                </svg>
                
                {/* Enhanced Y-axis labels */}
                <div className="absolute left-4 top-6 bottom-6 flex flex-col justify-between text-xs text-silver-600 font-medium">
                  <span>100%</span>
                  <span>75%</span>
                  <span>50%</span>
                  <span>25%</span>
                  <span>0%</span>
                </div>

                {/* X-axis labels */}
                <div className="absolute bottom-2 left-6 right-6 flex justify-between text-xs text-silver-600 font-medium">
                  <span>0s</span>
                  <span>{formatTime(Math.floor((selectedVideoData.retention.length - 1) * 0.25))}</span>
                  <span>{formatTime(Math.floor((selectedVideoData.retention.length - 1) * 0.5))}</span>
                  <span>{formatTime(Math.floor((selectedVideoData.retention.length - 1) * 0.75))}</span>
                  <span>{formatTime(selectedVideoData.retention.length - 1)}</span>
                </div>

                {/* Hover tooltip */}
                {hoveredPoint && (
                  <div 
                    className="absolute bg-scale-900 text-white px-3 py-2 rounded-lg text-sm shadow-lg pointer-events-none z-10"
                    style={{
                      left: `${hoveredPoint.x}%`,
                      top: `${hoveredPoint.y}%`,
                      transform: 'translate(-50%, -100%) translateY(-10px)'
                    }}
                  >
                    <div className="font-semibold">{hoveredPoint.retention.toFixed(1)}%</div>
                    <div className="text-scale-200">{formatTime(hoveredPoint.time)}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Retention Stats */}
            <div>
              <h5 className="text-lg font-semibold text-scale-900 mb-4 flex items-center">
                <span className="mr-2">📊</span>
                Análise de Retenção
              </h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: '0-25%', data: selectedVideoData.retention.filter(p => p.retention <= 25).length, color: 'red' },
                  { label: '25-50%', data: selectedVideoData.retention.filter(p => p.retention > 25 && p.retention <= 50).length, color: 'orange' },
                  { label: '50-75%', data: selectedVideoData.retention.filter(p => p.retention > 50 && p.retention <= 75).length, color: 'yellow' },
                  { label: '75-100%', data: selectedVideoData.retention.filter(p => p.retention > 75).length, color: 'green' },
                ].map((stat, index) => (
                  <div key={index} className="text-center p-4 rounded-xl border-2 border-silver-200 bg-white hover:shadow-lg transition-all duration-200">
                    <div className={`text-2xl font-bold mb-1 ${getRetentionColor(stat.color === 'red' ? 20 : stat.color === 'orange' ? 40 : stat.color === 'yellow' ? 60 : 80)}`}>
                      {stat.data}
                    </div>
                    <div className="text-xs text-silver-600 font-medium">{stat.label}</div>
                    <div className="mt-2 w-full bg-silver-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${getRetentionBarColor(stat.color === 'red' ? 20 : stat.color === 'orange' ? 40 : stat.color === 'yellow' ? 60 : 80)}`}
                        style={{ width: `${(stat.data / selectedVideoData.retention.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Summary */}
            <div className="mt-8 p-6 bg-gradient-to-r from-scale-50 to-silver-50 rounded-xl border border-scale-200">
              <h6 className="text-lg font-semibold text-scale-900 mb-3 flex items-center">
                <span className="mr-2">🎯</span>
                Resumo de Performance
              </h6>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <span className="text-silver-600 font-medium">Retenção Inicial (10s)</span>
                  <span className="font-bold text-scale-900">
                    {selectedVideoData.retention[10] ? selectedVideoData.retention[10].retention.toFixed(1) : '0'}%
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <span className="text-silver-600 font-medium">Retenção Final</span>
                  <span className="font-bold text-scale-900">
                    {selectedVideoData.retention[selectedVideoData.retention.length - 1] ? selectedVideoData.retention[selectedVideoData.retention.length - 1].retention.toFixed(1) : '0'}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoRetentionChart; 
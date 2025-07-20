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
              <h5 className="text-xl font-bold text-scale-900 mb-4 flex items-center">
                <span className="mr-2">📈</span>
                Análise Visual de Retenção
              </h5>
              
              <div className="bg-gradient-to-br from-slate-800 via-slate-800/95 to-slate-800 rounded-2xl p-8 border border-slate-600/20 relative overflow-hidden">
                {/* Animated background elements */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-emerald-500/5 animate-pulse"></div>
                <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-blue-400/10 to-slate-400/10 rounded-full blur-xl"></div>
                <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-emerald-400/10 to-slate-400/10 rounded-full blur-xl"></div>
                
                <div className="relative z-10">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    {/* Pie Chart */}
                    <div className="flex justify-center">
                        <div className="relative w-80 h-80">
                          <svg 
                            className="w-full h-full transform -rotate-90" 
                            viewBox="0 0 100 100"
                            style={{
                              filter: 'drop-shadow(0 25px 25px rgb(0 0 0 / 0.25))',
                            }}
                          >
                            {/* Background circle with enhanced depth */}
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="none"
                              stroke="rgba(148, 163, 184, 0.1)"
                              strokeWidth="8"
                              filter="url(#inner-shadow)"
                              className="transform transition-all duration-300"
                            />
                            
                            {/* Filtros para profundidade aprimorada */}
                            <defs>
                              <filter id="inner-shadow">
                                <feOffset dx="0" dy="3" />
                                <feGaussianBlur stdDeviation="3" result="offset-blur" />
                                <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse" />
                                <feFlood floodColor="black" floodOpacity="0.4" result="color" />
                                <feComposite operator="in" in="color" in2="inverse" result="shadow" />
                                <feComposite operator="over" in="shadow" in2="SourceGraphic" />
                              </filter>

                              <filter id="shadow-depth" x="-50%" y="-50%" width="200%" height="200%">
                                <feOffset dx="0" dy="3" />
                                <feGaussianBlur stdDeviation="3" />
                                <feComposite operator="out" in="SourceGraphic" />
                                <feColorMatrix type="matrix" values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.35 0"/>
                                <feBlend mode="multiply" in2="SourceGraphic" />
                              </filter>

                              <filter id="elevation">
                                <feMorphology operator="dilate" radius="1" in="SourceAlpha" result="expanded"/>
                                <feOffset dx="0" dy="-2" in="expanded" result="offset"/>
                                <feGaussianBlur stdDeviation="2" in="offset" result="shadow"/>
                                <feColorMatrix type="matrix" values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.3 0" in="shadow" result="shadow-colored"/>
                                <feComposite in="SourceGraphic" in2="shadow-colored" operator="over"/>
                              </filter>

                              {/* Gradientes com profundidade melhorada */}
                              <linearGradient id="gradient-excellent" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#3b82f6" stopOpacity="1" />
                                <stop offset="50%" stopColor="#2563eb" stopOpacity="0.95" />
                                <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.9" />
                              </linearGradient>
                              <linearGradient id="gradient-good" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#0ea5e9" stopOpacity="1" />
                                <stop offset="50%" stopColor="#0284c7" stopOpacity="0.95" />
                                <stop offset="100%" stopColor="#0369a1" stopOpacity="0.9" />
                              </linearGradient>
                              <linearGradient id="gradient-fair" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#10b981" stopOpacity="1" />
                                <stop offset="50%" stopColor="#059669" stopOpacity="0.95" />
                                <stop offset="100%" stopColor="#047857" stopOpacity="0.9" />
                              </linearGradient>
                              <linearGradient id="gradient-poor" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#34d399" stopOpacity="1" />
                                <stop offset="50%" stopColor="#10b981" stopOpacity="0.95" />
                                <stop offset="100%" stopColor="#059669" stopOpacity="0.9" />
                              </linearGradient>

                              {/* Gradiente para brilho */}
                              <linearGradient id="shine" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
                                <stop offset="50%" stopColor="rgba(255,255,255,0.15)" />
                                <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
                              </linearGradient>
                            </defs>

                            {/* Pie segments with enhanced depth */}
                            {(() => {
                              const segments = [
                                { 
                                  label: 'Alta Retenção', 
                                  value: selectedVideoData.retention.filter(p => p.retention > 75).length,
                                  color: 'url(#gradient-excellent)',
                                  percentage: (selectedVideoData.retention.filter(p => p.retention > 75).length / selectedVideoData.retention.length) * 100
                                },
                                { 
                                  label: 'Média Retenção', 
                                  value: selectedVideoData.retention.filter(p => p.retention > 50 && p.retention <= 75).length,
                                  color: 'url(#gradient-good)',
                                  percentage: (selectedVideoData.retention.filter(p => p.retention > 50 && p.retention <= 75).length / selectedVideoData.retention.length) * 100
                                },
                                { 
                                  label: 'Baixa Retenção', 
                                  value: selectedVideoData.retention.filter(p => p.retention > 25 && p.retention <= 50).length,
                                  color: 'url(#gradient-fair)',
                                  percentage: (selectedVideoData.retention.filter(p => p.retention > 25 && p.retention <= 50).length / selectedVideoData.retention.length) * 100
                                },
                                { 
                                  label: 'Muito Baixa', 
                                  value: selectedVideoData.retention.filter(p => p.retention <= 25).length,
                                  color: 'url(#gradient-poor)',
                                  percentage: (selectedVideoData.retention.filter(p => p.retention <= 25).length / selectedVideoData.retention.length) * 100
                                }
                              ];
                              
                              let currentAngle = 0;
                              return segments.map((segment, index) => {
                                const angle = (segment.percentage / 100) * 360;
                                const x1 = 50 + 40 * Math.cos((currentAngle * Math.PI) / 180);
                                const y1 = 50 + 40 * Math.sin((currentAngle * Math.PI) / 180);
                                const x2 = 50 + 40 * Math.cos(((currentAngle + angle) * Math.PI) / 180);
                                const y2 = 50 + 40 * Math.sin(((currentAngle + angle) * Math.PI) / 180);
                                
                                const largeArcFlag = angle > 180 ? 1 : 0;
                                
                                // Caminho principal
                                const pathData = [
                                  `M 50 50`,
                                  `L ${x1} ${y1}`,
                                  `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                                  'Z'
                                ].join(' ');

                                // Caminho da sombra com mais profundidade
                                const shadowPath = [
                                  `M ${x1} ${y1}`,
                                  `L ${x1 + 3} ${y1 + 3}`,
                                  `A 40 40 0 ${largeArcFlag} 1 ${x2 + 3} ${y2 + 3}`,
                                  `L ${x2} ${y2}`,
                                  `A 40 40 0 ${largeArcFlag} 0 ${x1} ${y1}`,
                                  'Z'
                                ].join(' ');

                                // Caminho do brilho superior
                                const highlightPath = [
                                  `M ${x1} ${y1}`,
                                  `L ${x1 - 1} ${y1 - 1}`,
                                  `A 40 40 0 ${largeArcFlag} 1 ${x2 - 1} ${y2 - 1}`,
                                  `L ${x2} ${y2}`,
                                  `A 40 40 0 ${largeArcFlag} 0 ${x1} ${y1}`,
                                  'Z'
                                ].join(' ');
                                
                                currentAngle += angle;
                                
                                return (
                                  <g key={index} 
                                    className="transform transition-all duration-500 ease-out cursor-pointer"
                                    onMouseEnter={(e) => {
                                      const target = e.currentTarget;
                                      target.style.transform = `translateY(-8px) scale(1.05)`;
                                      target.style.filter = 'brightness(1.2) drop-shadow(0 8px 16px rgba(0,0,0,0.3))';
                                    }}
                                    onMouseLeave={(e) => {
                                      const target = e.currentTarget;
                                      target.style.transform = 'none';
                                      target.style.filter = 'none';
                                    }}
                                  >
                                    {/* Sombra profunda */}
                                    <path
                                      d={shadowPath}
                                      fill="rgba(0,0,0,0.3)"
                                      className="transition-all duration-500"
                                    />
                                    
                                    {/* Segmento principal com gradiente */}
                                    <path
                                      d={pathData}
                                      fill={segment.color}
                                      className="transition-all duration-500"
                                      style={{
                                        transformBox: 'fill-box',
                                        transformOrigin: 'center',
                                      }}
                                    >
                                      <animate
                                        attributeName="d"
                                        dur="0.5s"
                                        begin="mouseover"
                                        fill="freeze"
                                        to={`M 50 50 L ${x1 - 4} ${y1 - 4} A 42 42 0 ${largeArcFlag} 1 ${x2 - 4} ${y2 - 4} Z`}
                                      />
                                      <animate
                                        attributeName="d"
                                        dur="0.5s"
                                        begin="mouseout"
                                        fill="freeze"
                                        to={pathData}
                                      />
                                    </path>

                                    {/* Brilho superior para efeito 3D */}
                                    <path
                                      d={highlightPath}
                                      fill="url(#shine)"
                                      className="transition-all duration-500 opacity-0"
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.opacity = '0.8';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.opacity = '0';
                                      }}
                                    />

                                    {/* Borda com brilho */}
                                    <path
                                      d={pathData}
                                      fill="none"
                                      stroke="rgba(255,255,255,0.15)"
                                      strokeWidth="0.5"
                                      className="transition-all duration-500"
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.strokeWidth = '1.5';
                                        e.currentTarget.style.stroke = 'rgba(255,255,255,0.4)';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.strokeWidth = '0.5';
                                        e.currentTarget.style.stroke = 'rgba(255,255,255,0.15)';
                                      }}
                                    />

                                    {/* Linha e texto do percentual */}
                                    <g className="opacity-0 transition-opacity duration-500"
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.opacity = '1';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.opacity = '0';
                                      }}
                                    >
                                      <path
                                        d={`M 50 50 L ${50 + 35 * Math.cos((currentAngle + angle/2) * Math.PI / 180)} ${50 + 35 * Math.sin((currentAngle + angle/2) * Math.PI / 180)}`}
                                        stroke="rgba(255,255,255,0.3)"
                                        strokeWidth="0.5"
                                        strokeDasharray="2 2"
                                      />
                                      <text
                                        x={50 + 42 * Math.cos((currentAngle + angle/2) * Math.PI / 180)}
                                        y={50 + 42 * Math.sin((currentAngle + angle/2) * Math.PI / 180)}
                                        fill="white"
                                        fontSize="4"
                                        textAnchor="middle"
                                        alignmentBaseline="middle"
                                        className="font-semibold"
                                      >
                                        {segment.percentage.toFixed(1)}%
                                      </text>
                                    </g>
                                  </g>
                                );
                              });
                            })()}
                          </svg>

                          {/* Texto central com sombra mais pronunciada */}
                          <div 
                            className="absolute inset-0 flex items-center justify-center pointer-events-none" 
                            style={{ 
                              textShadow: '0 3px 6px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.1)' 
                            }}
                          >
                            <div className="text-center">
                              <div className="text-3xl font-bold text-slate-200 mb-1">{averageRetention}%</div>
                              <div className="text-sm text-slate-400">Retenção Média</div>
                            </div>
                          </div>
                        </div>
                    </div>
                    
                    {/* Legend and Stats */}
                    <div className="space-y-6">
                      <div>
                        <h6 className="text-xl font-bold text-slate-200 mb-4 flex items-center">
                          <span className="mr-2">🎯</span>
                          Distribuição de Performance
                        </h6>
                        <div className="space-y-4">
                          {[
                            { 
                              label: 'Alta Retenção (75-100%)', 
                              value: selectedVideoData.retention.filter(p => p.retention > 75).length,
                              percentage: (selectedVideoData.retention.filter(p => p.retention > 75).length / selectedVideoData.retention.length) * 100,
                              color: 'from-blue-500/70 to-blue-600/70',
                              icon: '🟢'
                            },
                            { 
                              label: 'Média Retenção (50-75%)', 
                              value: selectedVideoData.retention.filter(p => p.retention > 50 && p.retention <= 75).length,
                              percentage: (selectedVideoData.retention.filter(p => p.retention > 50 && p.retention <= 75).length / selectedVideoData.retention.length) * 100,
                              color: 'from-sky-500/70 to-sky-600/70',
                              icon: '🟡'
                            },
                            { 
                              label: 'Baixa Retenção (25-50%)', 
                              value: selectedVideoData.retention.filter(p => p.retention > 25 && p.retention <= 50).length,
                              percentage: (selectedVideoData.retention.filter(p => p.retention > 25 && p.retention <= 50).length / selectedVideoData.retention.length) * 100,
                              color: 'from-emerald-500/70 to-emerald-600/70',
                              icon: '🟠'
                            },
                            { 
                              label: 'Muito Baixa (0-25%)', 
                              value: selectedVideoData.retention.filter(p => p.retention <= 25).length,
                              percentage: (selectedVideoData.retention.filter(p => p.retention <= 25).length / selectedVideoData.retention.length) * 100,
                              color: 'from-teal-500/70 to-teal-600/70',
                              icon: '🔴'
                            }
                          ].map((item, index) => (
                            <div key={index} className="flex items-center space-x-4 p-3 bg-slate-700/30 rounded-lg backdrop-blur-sm border border-slate-600/20">
                              <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${item.color}`}></div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-slate-200 font-medium">{item.label}</span>
                                  <span className="text-slate-200 font-bold">{item.percentage.toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-slate-600/20 rounded-full h-2 mt-2">
                                  <div 
                                    className={`h-2 rounded-full bg-gradient-to-r ${item.color} transition-all duration-1000 ease-out`}
                                    style={{ width: `${item.percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Performance indicator */}
                      <div className="p-4 bg-gradient-to-r from-slate-700/30 to-slate-600/30 rounded-lg backdrop-blur-sm border border-slate-600/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-blue-100 font-semibold">Performance Geral</span>
                          <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                            averageRetention >= 80 ? 'bg-blue-500/20 text-blue-200' :
                            averageRetention >= 60 ? 'bg-sky-500/20 text-sky-200' :
                            averageRetention >= 40 ? 'bg-emerald-500/20 text-emerald-200' :
                            'bg-teal-500/20 text-teal-200'
                          }`}>
                            {averageRetention >= 80 ? 'Excelente' :
                             averageRetention >= 60 ? 'Bom' :
                             averageRetention >= 40 ? 'Regular' :
                             'Baixo'}
                          </span>
                        </div>
                        <div className="text-blue-200/80 text-sm">
                          {averageRetention >= 80 ? '🎉 Seu vídeo está performando excepcionalmente bem!' :
                           averageRetention >= 60 ? '👍 Boa performance, mas há espaço para melhorar.' :
                           averageRetention >= 40 ? '⚠️ Performance moderada, considere otimizações.' :
                           '🚨 Performance baixa, recomenda-se revisão completa.'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* CSS Animation */}
              <style jsx>{`
                @keyframes fadeInScale {
                  from {
                    opacity: 0;
                    transform: scale(0.8);
                  }
                  to {
                    opacity: 1;
                    transform: scale(1);
                  }
                }
              `}</style>
            </div>

            {/* Enhanced Retention Stats */}
            <div>
              <h5 className="text-lg font-semibold text-scale-900 mb-4 flex items-center">
                <span className="mr-2">📊</span>
                Análise de Retenção
              </h5>
              
              {/* Simplified metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Retention Score */}
                <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h6 className="text-lg font-semibold text-green-900">🎯 Score de Retenção</h6>
                    <div className={`text-2xl font-bold ${getRetentionColor(averageRetention)}`}>
                      {averageRetention}%
                    </div>
                  </div>
                  <div className="w-full bg-green-200 rounded-full h-3 mb-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-500 ${getRetentionBarColor(averageRetention)}`}
                      style={{ width: `${averageRetention}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-green-700">
                    {averageRetention >= 80 ? 'Excelente! Seu vídeo mantém o público engajado.' :
                     averageRetention >= 60 ? 'Bom! Há espaço para melhorar o engajamento.' :
                     averageRetention >= 40 ? 'Regular. Considere otimizar o conteúdo.' :
                     'Baixo. Recomendamos revisar a estratégia do vídeo.'}
                  </p>
                </div>

                {/* Drop-off Points */}
                <div className="p-6 bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-xl">
                  <h6 className="text-lg font-semibold text-red-900 mb-4">⚠️ Pontos de Abandono</h6>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-red-700">Primeiros 10 segundos:</span>
                      <span className="font-bold text-red-900">
                        {selectedVideoData.retention[10] ? (100 - selectedVideoData.retention[10].retention).toFixed(1) : '0'}% abandonaram
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-red-700">Meio do vídeo:</span>
                      <span className="font-bold text-red-900">
                        {selectedVideoData.retention[Math.floor(selectedVideoData.retention.length / 2)] ? 
                         (100 - selectedVideoData.retention[Math.floor(selectedVideoData.retention.length / 2)].retention).toFixed(1) : '0'}% abandonaram
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-red-700">Final do vídeo:</span>
                      <span className="font-bold text-red-900">
                        {selectedVideoData.retention[selectedVideoData.retention.length - 1] ? 
                         (100 - selectedVideoData.retention[selectedVideoData.retention.length - 1].retention).toFixed(1) : '0'}% assistiram até o fim
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Simple insights */}
              <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-xl">
                <h6 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                  <span className="mr-2">💡</span>
                  Dicas para melhorar a retenção
                </h6>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-600 mt-1">🎬</span>
                    <div>
                      <strong>Início forte:</strong> Capture a atenção nos primeiros 10 segundos
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-600 mt-1">⚡</span>
                    <div>
                      <strong>Ritmo constante:</strong> Mantenha o interesse ao longo do vídeo
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-600 mt-1">🎯</span>
                    <div>
                      <strong>Final impactante:</strong> Deixe uma impressão memorável
                    </div>
                  </div>
                </div>
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
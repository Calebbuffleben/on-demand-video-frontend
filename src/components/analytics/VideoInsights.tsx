'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Quartile { time: number; reached: number; pct: number }
interface Completion { completed: number; pct: number }
interface Replays { count: number; sessionsWithReplay: number; ratePct: number }
interface Heat { start: number; end: number; secondsWatched: number; intensityPct: number }
interface Drop { time: number; dropPct: number }

interface VideoInsightsProps {
  quartiles: { q25: Quartile; q50: Quartile; q75: Quartile; q100: Quartile };
  completion: Completion;
  replays: Replays;
  heatmap: Heat[];
  dropOffs: Drop[];
  totalViews?: number;
}

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const VideoInsights: React.FC<VideoInsightsProps> = ({ quartiles, completion, replays, dropOffs, totalViews }) => {
  return (
    <div className="grid gap-6">
      {/* Contexto */}
      {typeof totalViews === 'number' && (
        <div className="text-sm text-gray-600"><strong>Base:</strong> {totalViews} visualizações</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader><CardTitle>Q25 • 25% do vídeo</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quartiles.q25.pct}%</div>
            <div className="text-sm text-gray-500">Marcou {formatTime(quartiles.q25.time)} • {quartiles.q25.reached} pessoas alcançaram</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Q50 • Metade do vídeo</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quartiles.q50.pct}%</div>
            <div className="text-sm text-gray-500">Marcou {formatTime(quartiles.q50.time)} • {quartiles.q50.reached} pessoas alcançaram</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Q75 • 75% do vídeo</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quartiles.q75.pct}%</div>
            <div className="text-sm text-gray-500">Marcou {formatTime(quartiles.q75.time)} • {quartiles.q75.reached} pessoas alcançaram</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Conclusão • ≥99% do vídeo</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completion.pct}%</div>
            <div className="text-sm text-gray-500">{completion.completed} pessoas concluíram</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Replays</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
            <div>
              <div className="text-2xl font-bold">{replays.count}</div>
              <div className="text-sm text-gray-500">Replays totais</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{replays.ratePct}%</div>
              <div className="text-sm text-gray-500">Sessões com pelo menos 1 replay</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Maiores Pontos de Queda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-gray-500 mb-2">Momentos com maior queda percentual de retenção entre segundos consecutivos.</div>
          <ul className="space-y-2" aria-label="Pontos de queda">
            {dropOffs.map((d, i) => (
              <li key={`${d.time}-${i}`} className="flex justify-between text-sm">
                <span>{formatTime(d.time)}</span>
                <span className="font-medium" title="Queda percentual em pontos percentuais">-{d.dropPct}%</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoInsights;



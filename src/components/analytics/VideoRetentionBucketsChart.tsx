'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

type Bucket = {
  start: number;
  end: number;
  viewers: number;
  pct: number;
};

interface VideoRetentionBucketsChartProps {
  data: Bucket[];
  totalViews: number;
}

const formatRange = (start: number, end: number) => {
  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };
  return `${fmt(start)}-${fmt(end)}`;
};

const VideoRetentionBucketsChart: React.FC<VideoRetentionBucketsChartProps> = ({ data, totalViews }) => {
  const [showPercentage, setShowPercentage] = useState(true);

  const chartData = data.map((b) => ({
    label: formatRange(b.start, b.end),
    value: showPercentage ? b.pct : b.viewers,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Retenção por Bucket</span>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Mostrar:</span>
            <button
              onClick={() => setShowPercentage(true)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                showPercentage ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Porcentagem
            </button>
            <button
              onClick={() => setShowPercentage(false)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                !showPercentage ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Visualizações
            </button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[360px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="label" interval={0} angle={-30} textAnchor="end" height={60} />
              <YAxis domain={showPercentage ? [0, 100] : [0, 'dataMax']} />
              <Tooltip
                formatter={(value: number) => [
                  showPercentage ? `${value}%` : `${value} viewers`,
                  showPercentage ? 'Retention' : `Viewers (Total: ${totalViews})`
                ]}
              />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoRetentionBucketsChart;



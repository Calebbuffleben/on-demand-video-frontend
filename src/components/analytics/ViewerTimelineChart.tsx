import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ViewerTimelineData {
  time: number;
  retention: number;
}

interface ViewerTimelineChartProps {
  data: ViewerTimelineData[];
  videoDuration: number;
  granularity?: number;
  totalViews: number;
}

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const ViewerTimelineChart: React.FC<ViewerTimelineChartProps> = ({ data, videoDuration, granularity = 5, totalViews }) => {
  const [showPercentage, setShowPercentage] = useState(true);

  // Filter data points based on granularity
  const filteredData = data.filter((_, index) => {
    if (granularity < 60) {
      // For second granularity, keep every nth point
      return index % granularity === 0;
    } else {
      // For minute granularity, convert to seconds and keep every nth point
      const secondsInterval = granularity / 60;
      return index % secondsInterval === 0;
    }
  });

  // Transform data based on toggle state
  // Use the actual totalViews from backend to maintain curve shape
  const chartData = filteredData.map(point => ({
    ...point,
    displayValue: showPercentage 
      ? point.retention 
      : Math.round((point.retention / 100) * totalViews)
  }));

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Retenção de Visualizadores</span>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Mostrar:</span>
            <button
              onClick={() => setShowPercentage(true)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                showPercentage 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Porcentagem
            </button>
            <button
              onClick={() => setShowPercentage(false)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                !showPercentage 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Visualizações
            </button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                tickFormatter={formatTime}
                domain={[0, videoDuration]}
                tickCount={10}
              />
              <YAxis
                domain={showPercentage ? [0, 100] : [0, 'dataMax']}
                tickFormatter={(value) => showPercentage ? `${value}%` : value.toString()}
              />
              <Tooltip
                formatter={(value: number) => [
                  showPercentage ? `${value.toFixed(1)}%` : `${Math.round(value)} viewers`,
                  showPercentage ? 'Retention' : 'Active Viewers'
                ]}
                labelFormatter={(time: number) => `Time: ${formatTime(time)}`}
              />
              <Line
                type="monotone"
                dataKey="displayValue"
                stroke="#8884d8"
                strokeWidth={2}
                dot={false}
                name={showPercentage ? "Viewer Retention" : "Active Viewers"}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ViewerTimelineChart; 
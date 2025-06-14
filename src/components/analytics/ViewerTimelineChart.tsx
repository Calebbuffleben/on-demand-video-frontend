import React from 'react';
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
}

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const ViewerTimelineChart: React.FC<ViewerTimelineChartProps> = ({ data, videoDuration, granularity = 5 }) => {
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Viewer Retention</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={filteredData}
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
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                formatter={(value: number) => [`${value.toFixed(1)}%`, 'Retention']}
                labelFormatter={(time: number) => `Time: ${formatTime(time)}`}
              />
              <Line
                type="monotone"
                dataKey="retention"
                stroke="#8884d8"
                strokeWidth={2}
                dot={false}
                name="Viewer Retention"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ViewerTimelineChart; 
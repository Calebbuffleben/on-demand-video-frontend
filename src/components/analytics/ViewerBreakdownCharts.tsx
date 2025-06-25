'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { ViewerAnalytics, DeviceBreakdown, BrowserBreakdown, LocationBreakdown, OSBreakdown, ConnectionBreakdown } from '../../api-connection/analytics';

interface ViewerBreakdownChartsProps {
  data: ViewerAnalytics;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

// Empty state component
const EmptyDataState: React.FC<{ title: string; description?: string }> = ({ title, description }) => (
  <div className="flex flex-col items-center justify-center h-64 text-gray-500">
    <div className="w-16 h-16 mb-4 opacity-30">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 00-2-2m0 0V9a2 2 0 012-2h2a2 2 0 00-2-2" />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-500 text-center max-w-xs">
      {description || 'No data available yet. Analytics will appear once your video starts receiving views.'}
    </p>
  </div>
);

const ViewerBreakdownCharts: React.FC<ViewerBreakdownChartsProps> = ({ data }) => {
  // Check if we have any meaningful data
  const hasDeviceData = data.devices && data.devices.length > 0;
  const hasBrowserData = data.browsers && data.browsers.length > 0;
  const hasLocationData = data.locations && data.locations.length > 0;
  const hasOSData = data.operatingSystems && data.operatingSystems.length > 0;
  const hasConnectionData = data.connections && data.connections.length > 0;
  const hasTotalViews = data.totalViews > 0;

  // Show message if no data at all
  if (!hasTotalViews && !hasDeviceData && !hasBrowserData && !hasLocationData && !hasOSData && !hasConnectionData) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Viewer Demographics</h2>
        <EmptyDataState 
          title="No Analytics Data Available"
          description="Your video hasn't received any views yet, or analytics data is still being processed. Check back later to see viewer demographics and engagement metrics."
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Viewer Demographics</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Device Breakdown */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Device Breakdown</h3>
          {hasDeviceData ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.devices}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ device, percentage }) => `${device} (${percentage?.toFixed(1)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="views"
                >
                  {data.devices.map((_: DeviceBreakdown, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string, props: { payload?: DeviceBreakdown }) => [
                    `${value} views (${props.payload?.percentage?.toFixed(1) || 0}%)`,
                    props.payload?.device || 'Unknown Device'
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyDataState title="No Device Data" />
          )}
        </div>

        {/* Browser Breakdown */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Browser Breakdown</h3>
          {hasBrowserData ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.browsers}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ browser, percentage }) => `${browser} (${percentage?.toFixed(1)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="views"
                >
                  {data.browsers.map((_: BrowserBreakdown, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string, props: { payload?: BrowserBreakdown }) => [
                    `${value} views (${props.payload?.percentage?.toFixed(1) || 0}%)`,
                    props.payload?.browser || 'Unknown Browser'
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyDataState title="No Browser Data" />
          )}
        </div>

        {/* Geographic Distribution */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Geographic Distribution</h3>
          {hasLocationData ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.locations}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="country" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip
                  formatter={(value: number, name: string, props: { payload?: LocationBreakdown }) => [
                    `${value} views (${props.payload?.percentage?.toFixed(1) || 0}%)`,
                    props.payload?.country || 'Unknown Country'
                  ]}
                />
                <Bar dataKey="views" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyDataState title="No Geographic Data" />
          )}
        </div>

        {/* Operating System Breakdown */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Operating System</h3>
          {hasOSData ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.operatingSystems}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="os" />
                <YAxis />
                <Tooltip
                  formatter={(value: number, name: string, props: { payload?: OSBreakdown }) => [
                    `${value} views (${props.payload?.percentage?.toFixed(1) || 0}%)`,
                    props.payload?.os || 'Unknown OS'
                  ]}
                />
                <Bar dataKey="views" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyDataState title="No Operating System Data" />
          )}
        </div>

        {/* Connection Type */}
        <div className="bg-gray-50 rounded-lg p-4 lg:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Connection Type</h3>
          {hasConnectionData ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.connections}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="connectionType" />
                <YAxis />
                <Tooltip
                  formatter={(value: number, name: string, props: { payload?: ConnectionBreakdown }) => [
                    `${value} views (${props.payload?.percentage?.toFixed(1) || 0}%)`,
                    props.payload?.connectionType || 'Unknown Connection'
                  ]}
                />
                <Bar dataKey="views" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyDataState title="No Connection Data" />
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewerBreakdownCharts; 
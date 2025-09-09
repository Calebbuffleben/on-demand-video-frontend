'use client';

import React, { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { ViewerAnalytics, DeviceBreakdown, BrowserBreakdown, OSBreakdown, ConnectionBreakdown } from '../../api-connection/analytics';

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
      {description || 'Nenhum dado disponível ainda. As análises aparecerão quando seu vídeo começar a receber visualizações.'}
    </p>
  </div>
);

const ViewerBreakdownCharts: React.FC<ViewerBreakdownChartsProps> = ({ data }) => {
  // Location level selector: country | region | city
  const [locationLevel, setLocationLevel] = useState<'country' | 'region' | 'city'>('country');

  // Aggregate locations by selected level
  const aggregatedLocations = useMemo(() => {
    if (!data.locations || data.locations.length === 0) return [] as Array<{ label: string; views: number; percentage: number }>;
    const map = new Map<string, number>();
    for (const loc of data.locations) {
      let key = '';
      if (locationLevel === 'country') {
        key = loc.country || loc.countryCode || 'Unknown';
      } else if (locationLevel === 'region') {
        const regionLabel = loc.region || 'Unknown Region';
        key = loc.countryCode ? `${loc.countryCode}-${regionLabel}` : regionLabel;
      } else {
        const cityLabel = loc.city || 'Unknown City';
        key = loc.region ? `${cityLabel}, ${loc.region}` : cityLabel;
      }
      map.set(key, (map.get(key) || 0) + (loc.views || 0));
    }
    const total = Array.from(map.values()).reduce((s, v) => s + v, 0) || 1;
    return Array.from(map.entries())
      .map(([label, views]) => ({ label, views, percentage: (views / total) * 100 }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 20);
  }, [data.locations, locationLevel]);

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
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Demografia dos Visualizadores</h2>
        <EmptyDataState 
          title="Nenhum Dado de Análise Disponível"
          description="Seu vídeo ainda não recebeu visualizações, ou os dados de análise ainda estão sendo processados. Volte mais tarde para ver a demografia dos visualizadores e métricas de engajamento."
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Demografia dos Visualizadores</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Device Breakdown */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Distribuição por Dispositivo</h3>
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
                    `${value} visualizações (${props.payload?.percentage?.toFixed(1) || 0}%)`,
                    props.payload?.device || 'Dispositivo Desconhecido'
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyDataState title="Nenhum Dado de Dispositivo" />
          )}
        </div>

        {/* Browser Breakdown */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Distribuição por Navegador</h3>
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
                    `${value} visualizações (${props.payload?.percentage?.toFixed(1) || 0}%)`,
                    props.payload?.browser || 'Navegador Desconhecido'
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyDataState title="Nenhum Dado de Navegador" />
          )}
        </div>

        {/* Geographic Distribution */
        }
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Distribuição Geográfica</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Nível:</span>
              <select
                value={locationLevel}
                onChange={(e) => setLocationLevel(e.target.value as 'country' | 'region' | 'city')}
                className="rounded-md border border-gray-300 px-2 py-1 text-sm"
              >
                <option value="country">País</option>
                <option value="region">Estado/Região</option>
                <option value="city">Cidade</option>
              </select>
            </div>
          </div>
          {hasLocationData ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={aggregatedLocations}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="label" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip
                  formatter={(value: number, name: string, props: { payload?: { label?: string; percentage?: number } }) => [
                    `${value} visualizações (${(props.payload?.percentage || 0).toFixed(1)}%)`,
                    props.payload?.label || 'Local Desconhecido'
                  ]}
                />
                <Bar dataKey="views" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyDataState title="Nenhum Dado Geográfico" />
          )}
        </div>

        {/* Operating System Breakdown */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Sistema Operacional</h3>
          {hasOSData ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.operatingSystems}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="os" />
                <YAxis />
                <Tooltip
                  formatter={(value: number, name: string, props: { payload?: OSBreakdown }) => [
                    `${value} visualizações (${props.payload?.percentage?.toFixed(1) || 0}%)`,
                    props.payload?.os || 'SO Desconhecido'
                  ]}
                />
                <Bar dataKey="views" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyDataState title="Nenhum Dado de Sistema Operacional" />
          )}
        </div>

        {/* Connection Type */}
        <div className="bg-gray-50 rounded-lg p-4 lg:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Tipo de Conexão</h3>
          {hasConnectionData ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.connections}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="connectionType" />
                <YAxis />
                <Tooltip
                  formatter={(value: number, name: string, props: { payload?: ConnectionBreakdown }) => [
                    `${value} visualizações (${props.payload?.percentage?.toFixed(1) || 0}%)`,
                    props.payload?.connectionType || 'Conexão Desconhecida'
                  ]}
                />
                <Bar dataKey="views" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyDataState title="Nenhum Dado de Conexão" />
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewerBreakdownCharts; 
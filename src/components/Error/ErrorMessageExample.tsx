import React from 'react';
import ErrorMessage from './ErrorMessage';

/**
 * Example component demonstrating the improved error messages
 * This is for demonstration purposes only
 */
export default function ErrorMessageExample() {
  const limitErrors = [
    {
      name: 'Storage Limit Exceeded',
      error: { response: { data: { message: 'limit_storage_gb_exceeded' } } }
    },
    {
      name: 'Minutes Limit Exceeded', 
      error: { response: { data: { message: 'limit_total_minutes_exceeded' } } }
    },
    {
      name: 'Views Limit Exceeded',
      error: { response: { data: { message: 'limit_unique_views_exceeded' } } }
    },
    {
      name: 'Generic API Error',
      error: { response: { data: { message: 'API Error (403): limit_unknown_exceeded' } } }
    },
    {
      name: 'Network Error',
      error: { message: 'Network Error: Cannot connect to server' }
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold mb-4">Exemplos de Mensagens de Erro Melhoradas</h2>
      
      {limitErrors.map((example, index) => (
        <div key={index} className="space-y-2">
          <h3 className="font-semibold text-gray-700">{example.name}</h3>
          <ErrorMessage error={example.error} />
        </div>
      ))}
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">Melhorias Implementadas:</h3>
        <ul className="text-blue-700 space-y-1">
          <li>• Mensagens em português e mais amigáveis</li>
          <li>• Identificação visual de erros de limite (ícone de aviso laranja)</li>
          <li>• Botão direto para upgrade do plano</li>
          <li>• Diferenciação entre erros de limite e outros erros</li>
          <li>• Links automáticos para página de billing</li>
        </ul>
      </div>
    </div>
  );
}

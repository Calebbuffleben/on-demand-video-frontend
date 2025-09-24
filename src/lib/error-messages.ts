/**
 * Utility functions for handling and translating error messages
 */

export interface LimitErrorDetails {
  message: string;
  isLimitError: boolean;
  limitType?: 'storage' | 'minutes' | 'views';
  upgradeUrl?: string;
}

/**
 * Translates backend error codes to user-friendly messages
 */
export function translateError(error: any): LimitErrorDetails {
  // Handle axios errors
  if (error?.response?.data?.message) {
    const backendMessage = error.response.data.message;
    return translateBackendError(backendMessage);
  }
  
  // Handle direct error messages
  if (typeof error === 'string') {
    return translateBackendError(error);
  }
  
  // Handle Error objects
  if (error?.message) {
    return translateBackendError(error.message);
  }
  
  return {
    message: 'Ocorreu um erro inesperado. Tente novamente.',
    isLimitError: false
  };
}

/**
 * Translates specific backend error codes to user-friendly messages
 */
function translateBackendError(message: string): LimitErrorDetails {
  switch (message) {
    case 'limit_storage_gb_exceeded':
      return {
        message: 'Você atingiu o limite de armazenamento do seu plano atual. Para enviar mais vídeos, faça upgrade do seu plano.',
        isLimitError: true,
        limitType: 'storage',
        upgradeUrl: '/billing'
      };
      
    case 'limit_total_minutes_exceeded':
      return {
        message: 'Você atingiu o limite de minutos totais do seu plano atual. Para enviar vídeos mais longos, faça upgrade do seu plano.',
        isLimitError: true,
        limitType: 'minutes',
        upgradeUrl: '/billing'
      };
      
    case 'limit_unique_views_exceeded':
      return {
        message: 'Você atingiu o limite de visualizações únicas do seu plano atual. Para mais visualizações, faça upgrade do seu plano.',
        isLimitError: true,
        limitType: 'views',
        upgradeUrl: '/billing'
      };
      
    default:
      // Check if it's a generic limit error
      if (message.includes('limit_') && message.includes('exceeded')) {
        return {
          message: 'Você atingiu um limite do seu plano atual. Para continuar usando a plataforma, faça upgrade do seu plano.',
          isLimitError: true,
          upgradeUrl: '/billing'
        };
      }
      
      return {
        message: message,
        isLimitError: false
      };
  }
}

/**
 * Formats error messages for display in UI components
 */
export function formatErrorForDisplay(error: any): string {
  const translated = translateError(error);
  return translated.message;
}

/**
 * Checks if an error is related to plan limits
 */
export function isLimitError(error: any): boolean {
  return translateError(error).isLimitError;
}

/**
 * Gets upgrade URL for limit errors
 */
export function getUpgradeUrl(error: any): string | undefined {
  return translateError(error).upgradeUrl;
}

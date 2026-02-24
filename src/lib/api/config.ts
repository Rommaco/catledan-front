/**
 * Configuración centralizada de la API.
 * Servidor local: serverless-offline usa puerto 4000.
 */
export const getApiBaseUrl = (): string =>
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

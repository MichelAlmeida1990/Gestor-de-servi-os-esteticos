/**
 * Configuração da URL da API
 * 
 * Em desenvolvimento: http://localhost:3001
 * Em produção: usa NEXT_PUBLIC_API_URL da variável de ambiente
 */
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Função auxiliar para fazer requisições autenticadas
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });
}


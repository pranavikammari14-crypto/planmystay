/**
 * PlanMyStay API Configuration Utility
 * Automatically prefixes endpoints with VITE_API_BASE_URL if configured,
 * otherwise defaults to relative /api paths.
 * Attaches authentication tokens and cookie credentials.
 */

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_URL}${normalizedPath}`;
}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const url = apiUrl(path);
  const token = typeof window !== 'undefined' ? localStorage.getItem('pms_token') : null;
  const headers = new Headers(options.headers || {});

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });
}

export const API_BASE = BASE_URL;

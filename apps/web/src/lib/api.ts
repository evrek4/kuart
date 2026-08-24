/**
 * Dynamic API URL Resolver
 * Resolves backend API URL dynamically based on current client environment.
 * If accessed via local IP (e.g., 192.168.x.x) or custom host, it dynamically
 * maps any hardcoded 'localhost' API references to the browser's hostname.
 */
export function getApiUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  if (typeof window !== 'undefined' && window.location) {
    const currentHost = window.location.hostname;
    if (currentHost && currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
      try {
        const parsed = new URL(envUrl);
        if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
          const protocol = window.location.protocol === 'https:' ? 'https:' : parsed.protocol;
          const port = parsed.port || '3001';
          return `${protocol}//${currentHost}:${port}`;
        }
      } catch (e) {
        const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
        return `${protocol}//${currentHost}:3001`;
      }
    }
  }

  return envUrl;
}

export const API_BASE = getApiUrl();

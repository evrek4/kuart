"use client";

import { useEffect } from "react";
import { getApiUrl } from "@/lib/api";

/**
 * Global Fetch Interceptor
 * 1. Intercepts all client-side window.fetch calls to dynamically resolve API host
 *    (e.g., if page loaded via 192.168.1.102:3010, rewrites localhost:3001 to 192.168.1.102:3001).
 * 2. Automatically attaches the 'kuafor-token' from cookies as Authorization Bearer header.
 */
export default function FetchInterceptor({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const originalFetch = window.fetch;
      
      window.fetch = async (...args) => {
        let [resource, config] = args;
        const currentHost = window.location.hostname;
        
        // 1. Dynamic API Host Rewriting for Mobile / Network devices
        if (typeof resource === 'string') {
          if (currentHost && currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
            if (resource.includes('localhost:3001') || resource.includes('127.0.0.1:3001')) {
              const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
              resource = resource
                .replace('http://localhost:3001', `${protocol}//${currentHost}:3001`)
                .replace('https://localhost:3001', `${protocol}//${currentHost}:3001`)
                .replace('http://127.0.0.1:3001', `${protocol}//${currentHost}:3001`);
            }
          }
        }

        // 2. Attach Authorization Token to API requests
        if (typeof resource === 'string' && (resource.includes('/api/') || resource.includes(':3001'))) {
          const cookies = document.cookie.split('; ');
          const tokenCookie = cookies.find(row => row.startsWith('kuafor-token='));
          const token = tokenCookie ? tokenCookie.split('=')[1] : null;

          if (token) {
            config = config || {};
            config.headers = {
              ...config.headers,
              "Authorization": `Bearer ${token}`
            };
          }
        }
        
        return originalFetch(resource, config);
      };
    }
  }, []);

  return <>{children}</>;
}

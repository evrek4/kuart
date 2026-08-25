import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if the request is for the API
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const url = request.nextUrl.clone();
    
    // In production, proxy to the local API server running on port 3001
    // In development, the next.config.mjs rewrites handles it, but this acts as a fallback
    url.protocol = 'http:';
    url.hostname = '127.0.0.1';
    url.port = '3001';
    
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};

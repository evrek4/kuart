import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // API proxy
  if (pathname.startsWith('/api/')) {
    const url = request.nextUrl.clone();
    
    // In production, proxy to the local API server running on port 3001
    // In development, the next.config.mjs rewrites handles it, but this acts as a fallback
    url.protocol = 'http:';
    url.hostname = '127.0.0.1';
    url.port = '3001';
    
    return NextResponse.rewrite(url);
  }

  // Super Admin koruması
  if (pathname.startsWith('/super-admin')) {
    const token = request.cookies.get('kuafor-token')?.value;
    if (!token) return NextResponse.redirect(new URL('/login', request.url));
    
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || "");
      const { payload } = await jwtVerify(token, secret);
      if (payload.role !== 'SUPER_ADMIN') {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    } catch {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Dashboard koruması  
  if (pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('kuafor-token')?.value;
    if (!token) return NextResponse.redirect(new URL('/login', request.url));
    
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || "");
      await jwtVerify(token, secret);
    } catch {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*', '/super-admin/:path*', '/dashboard/:path*'],
};

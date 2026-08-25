import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function getDecodedTokenRole(token?: string): string | null {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload.role || null;
  } catch (e) {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';
  const pathname = url.pathname;

  // 1. Static resources and API routes bypass
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 2. Super Admin Access Protection
  if (pathname.startsWith('/super-admin')) {
    const token = request.cookies.get('kuafor-token')?.value;
    const userRole = getDecodedTokenRole(token);
    
    if (userRole !== 'SUPER_ADMIN') {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 3. Dashboard (Tenant) Access Protection
  if (pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('kuafor-token')?.value;
    const userRole = getDecodedTokenRole(token);

    // Oturum açmamış kullanıcı → /login'e yönlendir
    if (!userRole) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Süper admin dashboard'a erişemez; kendi paneline yönlendir
    if (userRole === 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/super-admin', request.url));
    }

    // Tenant-scoped roller (SALON_OWNER, SALON_STAFF) erişebilir
    return NextResponse.next();
  }

  // 4. Custom Domain and Subdomain Routing
  // Identify if it's main platform domains
  const isLocal = hostname.startsWith('localhost') || hostname.startsWith('127.0.0.1');
  const isPlatformDomain = hostname.endsWith('kuafor.art');

  // Let's check subdomains if it is platform domain, e.g. "prestij.kuafor.art" or "prestij.localhost:3000"
  let subdomain: string | null = null;
  if (isPlatformDomain) {
    const parts = hostname.split('.');
    if (parts.length >= 3) {
      const firstPart = parts[0];
      if (firstPart !== 'www' && firstPart !== 'kuafor') {
        subdomain = firstPart;
      }
    }
  } else if (isLocal) {
    // Check local subdomain format, e.g. "prestij.localhost:3000"
    const parts = hostname.split('.');
    if (parts.length >= 2) {
      const firstPart = parts[0];
      if (firstPart !== 'www' && firstPart !== 'localhost' && firstPart !== '127') {
        subdomain = firstPart;
      }
    }
  }

  // If a subdomain is detected on kuafor.art or localhost, rewrite to /[subdomain]
  if (subdomain) {
    url.pathname = `/${subdomain}${pathname}`;
    return NextResponse.rewrite(url);
  }

  // If it is NOT local host and NOT platform domain, it is treated as a Custom Domain!
  // e.g. "prestijkuafor.com" or a custom domain mapped by users
  if (!isPlatformDomain && !isLocal) {
    try {
      const apiBase = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const res = await fetch(`${apiBase}/api/storefront/resolve-domain?host=${hostname}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.slug) {
          url.pathname = `/${data.slug}${pathname}`;
          return NextResponse.rewrite(url);
        }
      }
    } catch (err) {
      console.error('[Middleware] Custom domain resolution failed:', err);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
